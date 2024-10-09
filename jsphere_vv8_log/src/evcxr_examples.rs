//! Examples for running in Evcxr.
#![allow(dead_code, unused_imports, unused_mut, unused_variables)]
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
    // Read logs from a directory.
    let start_time = Instant::now();
    let mut logs = read_logs("headless_browser/target/youtube.com/0").unwrap();
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

    // Parse a log line.
    let log_line = r#"c7611:%eval:{823408,Window}:"() => window.__hordePromise__ !== undefined""#;
    let record = LogRecord::try_from(log_line).unwrap();
    let value = JSValue::from(r"{464471,parse\:%parse,stringify\:%stringify}");

    // Examine if the JS values in log lines are expected.
    for (index, log) in logs.iter().enumerate() {
        println!("\nLog {index}:");
        for (line, record) in &log.records {
            match record {
                LogRecord::IsolateContext { .. } | LogRecord::WindowOrigin { .. } => {
                    println!("{line}: Ignoring {record:#?}")
                }
                LogRecord::FunctionCall {
                    receiver: JSValue::Object { .. } | JSValue::Function { .. } | JSValue::Lambda,
                    ..
                } => {}
                LogRecord::GetProperty {
                    object, property, ..
                }
                | LogRecord::SetProperty {
                    object, property, ..
                } if matches!(
                    object,
                    JSValue::Object { .. } | JSValue::ObjectLiteral { .. }
                ) && matches!(
                    property,
                    JSValue::String(_) | JSValue::Int(_) | JSValue::Float(_) | JSValue::Unsure
                ) => {}
                LogRecord::FunctionCall { .. }
                | LogRecord::GetProperty { .. }
                | LogRecord::SetProperty { .. } => println!("{line}: Unexpected: {record:#?}"),
                _ => {}
            }
        }
    }

    // Aggregate API calls.
    let mut aggregate = RecordAggregate::default();
    for entry in &logs[2].records {
        let (line, record) = entry.clone();
        if let Err(err) = aggregate.add(line, record) {
            println!("{line}: {err}");
        }
    }
}
