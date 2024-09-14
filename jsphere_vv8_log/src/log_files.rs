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
    /// Invalid lines encountered when reading the log file.
    read_errs: Vec<String>,
}

impl TryFrom<&Path> for LogFile {
    type Error = anyhow::Error;

    #[inline]
    fn try_from(path: &Path) -> Result<Self> {
        if !path.is_file() {
            bail!("`{path:?}` is not a file");
        }
        let file_name = path
            .file_name()
            .context("no file name")?
            .to_str()
            .context("file name not valid UTF-8")?;
        let info = file_name.try_into().context("not VV8 log file name")?;

        let file = File::open(path).context("Failed to open the log file")?;
        let (records, invalid_lines) = parse_log_file(file);
        Ok(LogFile {
            info,
            records,
            read_errs: invalid_lines,
        })
    }
}

/// Parse the log file content into records.
fn parse_log_file(file: File) -> (Vec<LogRecord>, Vec<String>) {
    let file_reader = BufReader::new(file);
    let mut records = Vec::with_capacity(256);
    let mut invalid_lines = Vec::with_capacity(4);
    for line in file_reader.lines() {
        let maybe_record = || -> Result<_> { line?.as_str().try_into() }();
        match maybe_record {
            Ok(record) => records.push(record),
            Err(err) => {
                warn!(?err, "LogFile: reading line");
                invalid_lines.push(err.to_string())
            }
        }
    }
    records.shrink_to_fit();
    invalid_lines.shrink_to_fit();
    (records, invalid_lines)
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
    type Error = anyhow::Error;

    #[inline]
    fn try_from(file_name: &str) -> Result<Self> {
        if is_not_vv8_log_file(file_name) {
            bail!("`{file_name}` not a VV8 log file name");
        }
        let middle = &file_name[4..(file_name.len() - 4)];
        let parts: Vec<&str> = middle.split('-').collect();
        if parts.len() == 4 {
            let timestamp = parts[0].parse().context("Failed to parse the timestamp")?;
            let pid = parts[1].parse().context("Failed to parse the process ID")?;
            let tid = parts[2].parse().context("Failed to parse the thread ID")?;
            let thread_name = parts[3].to_string();
            Ok(LogFileInfo {
                timestamp,
                pid,
                tid,
                thread_name,
            })
        } else {
            bail!("LogFileInfo: File name `{file_name}` not in expected format");
        }
    }
}

#[inline]
pub fn is_not_vv8_log_file(file_name: &str) -> bool {
    !file_name.ends_with(".log") || !file_name.starts_with("vv8-")
}

#[cfg(test)]
mod tests;
