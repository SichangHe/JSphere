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
use std::{
    collections::HashMap,
    fs::{self, File},
    io::{BufWriter, Write},
    time::Instant,
};

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

    let i_log = logs
        .iter()
        .enumerate()
        .max_by_key(|(_, LogFile { records, .. })| records.len())
        .map(|(i, _)| i)
        .unwrap();

    // Aggregate API calls.
    let mut aggregate = RecordAggregate::default();
    for entry in &logs[i_log].records {
        let (line, record) = entry.clone();
        if let Err(err) = aggregate.add(line as u32, record) {
            println!("{line}: {err}");
        }
    }

    // Overview of aggregate API calls.
    let mut ids = aggregate.scripts.keys().copied().collect::<Vec<_>>();
    ids.sort_unstable();
    for id in &ids {
        let script = &aggregate.scripts[id];
        println!(
            "{id} line#{} source~{}kB used {} APIs {:?} {:?}",
            script.line,
            script.source.len() / 1024,
            script.api_calls.len(),
            script.injection_type,
            script.name,
        );
    }

    // Write API calls per script on YouTube to a CSV file.
    {
        let mut file = BufWriter::new(File::create("data/youtube_script_api_calls.csv").unwrap());
        file.write_all(b"script_id,api_type,this,attr,total,interact\n")
            .unwrap();
        for (id, script) in &aggregate.scripts {
            for (api_call, lines) in &script.api_calls {
                writeln!(
                    file,
                    "{},{:?},{},{},{},{}",
                    id,
                    api_call.api_type,
                    api_call.this,
                    api_call.attr.as_deref().unwrap_or(""),
                    lines.lines.len(),
                    lines.n_may_interact(),
                )
                .unwrap();
            }
        }
        file.flush().unwrap();
    }

    // Scan over all logs and find popular API calls.
    #[derive(Copy, Clone, Debug, Default)]
    struct CallCounts {
        appear_in: u32,
        appear_in_may_interact: u32,
        total: u32,
        may_interact: u32,
        out_of_total: u32,
        out_of_may_interact: u32,
        acc_per_total: f64,
        acc_per_may_interact: f64,
    }
    let mut api_calls = HashMap::<ApiCall, CallCounts>::with_capacity(2048);
    for dir_entry_result in fs::read_dir("headless_browser/target/").unwrap() {
        let dir_entry = dir_entry_result.unwrap();
        let subdomain_dir = dir_entry.path();
        for trial in 0..5 {
            let trial_dir = subdomain_dir.join(trial.to_string());
            if trial_dir.exists() && trial_dir.is_dir() {
                println!("Scanning `{}`", trial_dir.to_string_lossy());
                let logs = read_logs(&trial_dir).unwrap();
                for log in logs {
                    let LogFileInfo {
                        timestamp,
                        pid,
                        tid,
                        thread_name,
                    } = &log.info;
                    println!(
                        "[{timestamp} {pid} {tid} {thread_name}] {} records {} read errors",
                        log.records.len(),
                        log.read_errs.len()
                    );
                    let mut aggregate = RecordAggregate::default();
                    for (line, record) in log.records {
                        if let Err(err) = aggregate.add(line as u32, record) {
                            println!("{line}: {err}");
                        }
                    }
                    for script in aggregate.scripts.into_values() {
                        if matches!(script.injection_type, ScriptInjectionType::Not)
                            && script.source != "window.history.back()"
                        {
                            if let Some((total_calls, total_may_interact)) = script
                                .api_calls
                                .values()
                                .map(|lines| (lines.len(), lines.n_may_interact()))
                                .reduce(|(a, b), (c, d)| (a + c, b + d))
                            {
                                for (api_call, lines) in script.api_calls {
                                    let len = lines.len();
                                    let n_may_interact = lines.n_may_interact();
                                    let counts = api_calls.entry(api_call).or_default();
                                    counts.appear_in += 1;
                                    counts.total += len;
                                    counts.may_interact += n_may_interact;
                                    counts.out_of_total += total_calls;
                                    counts.out_of_may_interact += total_may_interact;
                                    counts.acc_per_total += (len as f64) / (total_calls as f64);
                                    if total_may_interact > 0 {
                                        counts.appear_in_may_interact += 1;
                                        counts.acc_per_may_interact +=
                                            (n_may_interact as f64) / (total_may_interact as f64);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    {
        let mut file = BufWriter::new(File::create("data/api_calls.csv").unwrap());
        file.write_all(b"api_type,this,attr,appear,appear_interact,total,interact,%total/total,%interact/interact,avg%total/script,avg%interact/script\n")
            .unwrap();
        for (
            ApiCall {
                api_type,
                this,
                attr,
            },
            CallCounts {
                appear_in,
                appear_in_may_interact,
                total,
                may_interact,
                out_of_total,
                out_of_may_interact,
                acc_per_total,
                acc_per_may_interact,
            },
        ) in api_calls
        {
            writeln!(
                file,
                "{api_type:?},{this},{},{appear_in},{appear_in_may_interact},{total},{may_interact},{},{},{},{}",
                attr.as_deref().unwrap_or(""),
                (total as f64) * 100.0 / (out_of_total as f64),
                (may_interact as f64) * 100.0 / (out_of_may_interact as f64),
                acc_per_total * 100.0 / (appear_in as f64),
                acc_per_may_interact * 100.0 / (appear_in as f64),
            )
            .unwrap();
        }
        file.flush().unwrap();
    }
}
