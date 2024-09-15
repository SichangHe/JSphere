#![allow(dead_code, unused_imports, unused_mut)]
use crate as jsphere_vv8_log;

/*
// Copy to the end of the comment from here if running in Evcxr.
:opt 2
:dep shame
:dep jsphere_vv8_log = { path = "jsphere_vv8_log" }
// */
use jsphere_vv8_log::*;
use shame::prelude::*;
use std::time::Instant;

fn main() {
    init_tracing();
    let start_time = Instant::now();
    let mut logs = read_logs("/tmp").unwrap();
    println!(
        "Read {} log files in {}ms",
        logs.len(),
        start_time.elapsed().as_millis()
    );
    println!("{:#?}", &logs[0].records[..20]);
    println!("{:#?}", &logs[0].read_errs[..20]);
    for (index, log) in logs.iter().enumerate() {
        let info = &log.info;
        let n_records = log.records.len();
        let n_read_errs = log.read_errs.len();
        println!("logs[{index}]: {info:?} | {n_records} records, {n_read_errs} read errors");
    }
}
