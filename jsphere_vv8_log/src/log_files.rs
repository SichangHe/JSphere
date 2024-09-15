use super::*;

/// Read and parse all log files in the specified directory.
/// Returns a tuple of vectors, where the first vector contains the successful results and the second vector contains the failed results.
pub fn read_logs(dir: &str) -> Result<Vec<LogFile>> {
    let mut log_files = Vec::new();

    for entry in fs::read_dir(dir).context("Reading directory")? {
        match entry {
            Ok(entry) => {
                let path = entry.path();
                match path.as_path().try_into() {
                    Ok(log_file) => log_files.push(log_file),
                    Err(err) => debug!(?path, ?err, "Did not parse as log file"),
                }
            }
            Err(err) => error!(?err, "Reading directory entry"),
        }
    }

    Ok(log_files)
}

/// Struct to represent a successful log file processing result.
/// Each field corresponds to a part of the result.
#[derive_float_everything]
#[pub_fields]
pub struct LogFile {
    /// The information in the file name.
    info: LogFileInfo,
    /// The parsed log records.
    records: Vec<LogRecord>,
    /// Invalid lines encountered when reading the log file, alone with
    /// the corresponding [LogRecordErr].
    read_errs: Vec<(String, LogRecordErr)>,
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
fn parse_log_file(file: File) -> (Vec<LogRecord>, Vec<(String, LogRecordErr)>) {
    let file_reader = BufReader::new(file);
    let mut records = Vec::with_capacity(1024);
    let mut read_errs = Vec::with_capacity(256);
    for line in file_reader.lines() {
        match line {
            Ok(line) => match line.as_str().try_into() {
                Ok(record) => records.push(record),
                Err(err) => {
                    warn!(line, ?err, "LogFile: parsing line");
                    read_errs.push((line, err));
                }
            },
            Err(err) => {
                warn!(?err, "LogFile: reading line");
                read_errs.push((err.to_string(), LogRecordErr::UnknownLogRecordType));
            }
        }
    }
    records.shrink_to_fit();
    read_errs.shrink_to_fit();
    (records, read_errs)
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
