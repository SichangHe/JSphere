use super::*;

/// Read and parse all log files in the specified directory.
/// Returns a tuple of vectors, where the first vector contains the successful results and the second vector contains the failed results.
pub fn read_logs<P: AsRef<Path>>(dir: P) -> Result<Vec<LogFile>> {
    let log_files = fs::read_dir(dir)
        .context("Reading directory")?
        .par_bridge()
        .filter_map(read_dir_entry)
        .collect();
    Ok(log_files)
}

fn read_dir_entry(entry: io::Result<DirEntry>) -> Option<LogFile> {
    entry
        .inspect_err(|err| error!(?err, "Reading directory entry"))
        .ok()
        .and_then(|entry| {
            let path = entry.path();
            path.as_path()
                .try_into()
                .inspect_err(|err| debug!(?path, ?err, "Did not parse as log file"))
                .ok()
        })
}

/// Struct to represent a successful log file processing result.
/// Each field corresponds to a part of the result.
#[derive_float_everything]
#[pub_fields]
pub struct LogFile {
    /// The information in the file name.
    info: LogFileInfo,
    /// The parsed log records with line numbers from 0.
    records: Vec<(usize, LogRecord)>,
    /// Invalid lines encountered when reading the log file.
    read_errs: Vec<ReadErr>,
}

impl TryFrom<&Path> for LogFile {
    type Error = LogFileErr;

    #[inline]
    fn try_from(path: &Path) -> Result<Self, Self::Error> {
        if !path.is_file() {
            return Err(LogFileErr::NotAFile);
        }
        let file_name = path.file_name().ok_or(LogFileErr::NoFileName)?;
        let file_name_str = file_name.to_str().ok_or(LogFileErr::InvalidFileName)?;
        let info = file_name_str
            .try_into()
            .map_err(|_| LogFileErr::NotALogFileName)?;

        let file = File::open(path).map_err(LogFileErr::OpenFileError)?;
        let (records, read_errs) = parse_log_file(file);
        Ok(LogFile {
            info,
            records,
            read_errs,
        })
    }
}

#[derive_enum_everything]
pub struct ReadErr {
    /// Line number starting from 0.
    line_n: usize,
    line: String,
    err: LogRecordErr,
}

/// Error when parsing a VV8 log file to [LogFile].
#[derive(Debug, Error)]
pub enum LogFileErr {
    #[error("Not a file")]
    NotAFile,
    #[error("No file name")]
    NoFileName,
    #[error("File name not valid UTF-8")]
    InvalidFileName,
    #[error("Not a VV8 log file name")]
    NotALogFileName,
    #[error("Failed to open the log file")]
    OpenFileError(std::io::Error),
}

/// Parse the log file content into records.
/// Returns log records sorted by line numbers, alone with read errors.
fn parse_log_file(file: File) -> (Vec<(usize, LogRecord)>, Vec<ReadErr>) {
    let file_reader = BufReader::new(file);
    let mut records = Vec::with_capacity(1024);
    let mut read_errs = Vec::with_capacity(32);
    for (line_n, line) in file_reader.lines().enumerate() {
        match parse_log_file_line(line) {
            Ok(record) => records.push((line_n, record)),
            Err((line, err)) => read_errs.push(ReadErr { line_n, line, err }),
        }
    }

    records.shrink_to_fit();
    read_errs.shrink_to_fit();
    (records, read_errs)
}

fn parse_log_file_line(line: io::Result<String>) -> Result<LogRecord, (String, LogRecordErr)> {
    let line = line.map_err(|err| {
        warn!(?err, "LogFile: reading line");
        (err.to_string(), LogRecordErr::UnknownLogRecordType)
    })?;
    line.as_str().try_into().map_err(|err| {
        warn!(line, ?err, "LogFile: parsing line");
        (line, err)
    })
}

/// Information in the log file name VV8 creates:
/// `vv8-$TIMESTAMP-$PID-$TID-$THREAD_NAME.log`. E.g.,
/// `vv8-1726285073665-87-87-chrome.0.log`.
#[derive_everything]
#[pub_fields]
pub struct LogFileInfo {
    /// The timestamp part of the file name.
    timestamp: u64,
    /// The process ID part of the file name.
    pid: u32,
    /// The thread ID part of the file name.
    tid: u32,
    /// The thread name part of the file name.
    thread_name: String,
}

impl TryFrom<&str> for LogFileInfo {
    type Error = LogFileInfoErr;

    #[inline]
    fn try_from(file_name: &str) -> Result<Self, Self::Error> {
        if is_not_vv8_log_file(file_name) {
            return Err(LogFileInfoErr::NotALogFileName);
        }
        do_parse_log_file_info(file_name)
    }
}

/// Assuming the file name is a VV8 log file name.
fn do_parse_log_file_info(file_name: &str) -> Result<LogFileInfo, LogFileInfoErr> {
    let middle = &file_name[4..(file_name.len() - 4)];
    let parts: Vec<&str> = middle.split('-').collect();
    if parts.len() != 4 {
        return Err(LogFileInfoErr::NotALogFileName);
    }
    let timestamp = parts[0]
        .parse()
        .map_err(|_| LogFileInfoErr::TimestampParsing)?;
    let pid = parts[1].parse().map_err(|_| LogFileInfoErr::PidParsing)?;
    let tid = parts[2].parse().map_err(|_| LogFileInfoErr::TidParsing)?;
    let thread_name = parts[3].to_string();
    Ok(LogFileInfo {
        timestamp,
        pid,
        tid,
        thread_name,
    })
}

#[inline]
pub fn is_not_vv8_log_file(file_name: &str) -> bool {
    !file_name.ends_with(".log") || !file_name.starts_with("vv8-")
}

/// Error when parsing a log file name to [LogFileInfo].
#[derive(Debug, Error)]
pub enum LogFileInfoErr {
    #[error("Not a VV8 log file name")]
    NotALogFileName,
    #[error("Failed to parse the timestamp")]
    TimestampParsing,
    #[error("Failed to parse the process ID")]
    PidParsing,
    #[error("Failed to parse the thread ID")]
    TidParsing,
}

#[cfg(test)]
mod tests;
