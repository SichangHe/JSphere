//! Parsing logic for VisibleV8 (VV8) log files.
//! See
//! <https://github.com/SichangHe/wspr-ncsu--visiblev8/blob/master/tests/README.md>
//! for the specification of the log file format.
#![allow(clippy::len_without_is_empty)]

use std::{
    collections::HashMap,
    fs::{self, DirEntry, File},
    io::{self, BufRead, BufReader},
    path::Path,
};

pub use aggregating::{
    ApiCall, ApiType, RecordAggregate, ScriptAggregate, ScriptInjectionType, ScriptName,
};
pub use js_values::JSValue;
use lazy_regex::regex_is_match;
pub use log_files::{read_logs, LogFile, LogFileInfo};
pub use log_records::{LogRecord, LogRecordErr, ID_UNSURE};
use rayon::prelude::*;
pub use record_lines::SplitRecordLine;
use shame::prelude::*;

pub mod aggregating;
pub mod js_values;
pub mod log_files;
pub mod log_records;
pub mod record_lines;

fn unescape_colon(data: &str) -> String {
    data.replace(r"\:", ":").replace(r"\\", r"\")
}

#[cfg(test)]
mod evcxr_examples;
