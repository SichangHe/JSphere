//! Parsing logic for VisibleV8 (VV8) log files.
//! See
//! <https://github.com/SichangHe/wspr-ncsu--visiblev8/blob/master/tests/README.md>
//! for the specification of the log file format.

use std::{
    fs::{self, File},
    io::{BufRead, BufReader},
    path::Path,
};

pub use js_values::JSValue;
pub use log_files::{read_logs, LogFile, LogFileInfo};
pub use log_records::{LogRecord, LogRecordErr};
pub use record_lines::SplitRecordLine;
use shame::prelude::*;

pub mod js_values;
pub mod log_files;
pub mod log_records;
pub mod record_lines;

#[cfg(test)]
mod evcxr_examples;
