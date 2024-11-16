//! Examples for running in Evcxr.
#![allow(dead_code, unused_imports, unused_mut, unused_variables)]
use crate as jsphere_vv8_log;

/*
// Copy to the end of the comment from here if running in Evcxr.
:opt 2
:dep shame
:dep lazy-regex
:dep jsphere_vv8_log = { path = "jsphere_vv8_log" }
// */
use jsphere_vv8_log::*;
use lazy_regex::regex_captures;
use shame::prelude::*;
use std::{
    collections::HashMap,
    fs::{self, File},
    io::{BufWriter, Write},
    time::Instant,
};

fn main() {
    init_tracing();

    //================================================================
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

    println!("{}", &aggregate.scripts[&27].source);

    //================================================================
    // Shared functions for scanning logs.
    fn for_each_log(mut callback: impl FnMut(LogFile, &str)) {
        for dir_entry_result in fs::read_dir("headless_browser/target/").unwrap() {
            let dir_entry = dir_entry_result.unwrap();
            let subdomain_dir = dir_entry.path();
            let subdomain = subdomain_dir.file_name().unwrap().to_str().unwrap();
            for trial in 0..5 {
                let trial_dir = subdomain_dir.join(trial.to_string());
                if trial_dir.exists() && trial_dir.is_dir() {
                    println!("Scanning `{}`", trial_dir.to_string_lossy());
                    let logs = read_logs(&trial_dir).unwrap();
                    for log in logs {
                        callback(log, subdomain);
                    }
                }
            }
        }
    }
    fn for_each_filtered_script(mut callback: impl FnMut(i32, ScriptAggregate, &str)) {
        for_each_log(|mut log, subdomain| {
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
            for (id, script) in aggregate.scripts {
                // Filter out injected scripts.
                if matches!(script.injection_type, ScriptInjectionType::Not)
                    && script.source != "window.history.back()"
                {
                    callback(id, script, subdomain);
                }
            }
        })
    }

    //================================================================
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
    for_each_filtered_script(|_, script, _| {
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
    });
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
                "{api_type:?},{this},{attr},{appear_in},{appear_in_may_interact},{total},\
                 {may_interact},{percent_total_total},{percent_interact_interact},\
                 {avg_percent_total_script},{avg_percent_interact_script}",
                attr = attr.as_deref().unwrap_or(""),
                percent_total_total = (total as f64) * 100.0 / (out_of_total as f64),
                percent_interact_interact =
                    (may_interact as f64) * 100.0 / (out_of_may_interact as f64),
                avg_percent_total_script = acc_per_total * 100.0 / (appear_in as f64),
                avg_percent_interact_script = acc_per_may_interact * 100.0 / (appear_in as f64),
            )
            .unwrap();
        }
        file.flush().unwrap();
    }

    //================================================================
    // Classify each script by heuristics.
    #[derive(Clone, Debug, Default)]
    struct ScriptFeatures {
        id: i32,
        name: Option<String>,
        subdomain: String,
        size: usize,
        rewritten: bool,
        total_call: u32,
        sure_frontend_processing: bool,
        sure_dom_element_generation: bool,
        sure_ux_enhancement: bool,
        sure_extensional_featuers: bool,
        has_request: bool,
        queries_element: bool,
        uses_storage: bool,
    }
    let mut script_features = Vec::<ScriptFeatures>::with_capacity(8192);
    for_each_filtered_script(|id, script, subdomain| {
        let ScriptAggregate {
            line,
            name,
            source,
            injection_type: _,
            api_calls,
            n_filtered_call,
        } = script;
        // NOTE: We have the `effectiveLen` if the script is rewritten.
        let (size, rewritten) = match regex_captures!(r"^//(\d+) effectiveLen", &source)
            .and_then(|(_, len)| len.parse::<usize>().ok())
        {
            Some(len) => (len, true),
            None => (source.len(), false),
        };
        let mut features = ScriptFeatures {
            id,
            subdomain: subdomain.to_string(),
            size,
            rewritten,
            total_call: api_calls.len() as u32 + n_filtered_call,
            ..ScriptFeatures::default()
        };
        if let ScriptName::Url(name) = name {
            features.name = Some(name);
        }
        for (
            ApiCall {
                api_type,
                this,
                attr,
            },
            lines,
        ) in api_calls
        {
            match (api_type, (this.as_str(), attr.as_deref())) {
                // Frontend processing.
                (
                    ApiType::Get,
                    (
                        this,
                        Some(
                            "state" | "keyCode" | "pointerType" | "which" | "bubbles" | "clientY"
                            | "target" | "key" | "charCode" | "clientX" | "pointerId"
                            | "currentTarget" | "isTrusted" | "propertyName" | "preventDefault"
                            | "offsetY" | "cancelable" | "changedTouches" | "composed" | "screenX"
                            | "button" | "composedPath" | "metaKey" | "pageY" | "ctrlKey"
                            | "touches" | "detail" | "shiftKey" | "type" | "offsetX" | "pageX"
                            | "eventPhase" | "timeStamp" | "screenY" | "altKey" | "data"
                            | "relatedTarget" | "defaultPrevented",
                        ),
                    ),
                ) if this.ends_with("Event") => features.sure_frontend_processing = true,
                (
                    ApiType::Get,
                    ("Location", Some("pathname" | "hash" | "href" | "hostname" | "search"))
                    | ("HTMLInputElement" | "HTMLTextAreaElement", Some("value" | "checked")),
                )
                | (ApiType::Function, (_, Some("addEventListener")))
                | (
                    ApiType::Set,
                    (_, Some("textContent"))
                    | ("URLSearchParams" | "DOMRect" | "DOMRectReadOnly", Some(_)),
                ) => features.sure_frontend_processing = true,

                // DOM element generation.
                (
                    ApiType::Function,
                    (
                        _,
                        Some(
                            "createElement" | "createElementNS" | "createTextNode" | "appendChild"
                            | "insertBefore",
                        ),
                    )
                    | ("CSSStyleDeclaration", Some("setProperty")),
                )
                | (ApiType::Set, ("CSSStyleDeclaration", _) | (_, Some("style")))
                    if lines.n_must_not_interact() > 0 =>
                {
                    features.sure_dom_element_generation = true
                }

                // UX enhancement.
                (
                    ApiType::Function,
                    (
                        _,
                        Some(
                            "removeAttribute"
                            | "matchMedia"
                            | "removeChild"
                            | "requestAnimationFrame"
                            | "cancelAnimationFrame",
                        ),
                    )
                    | ("FontFaceSet", Some("load"))
                    | ("MediaQueryList", Some("matches")),
                )
                | (ApiType::Set, (_, Some("hidden" | "disabled"))) => {
                    features.sure_ux_enhancement = true
                }

                // Extensional features.
                (
                    ApiType::Function,
                    ("Performance" | "PerformanceTiming" | "PerformanceResourceTiming", _)
                    | ("Navigator", Some("sendBeacon")),
                    // TODO: This list can be extended much more.
                ) => features.sure_extensional_featuers = true,

                // Requests.
                (ApiType::Function, ("XMLHttpRequest", _) | ("Window", Some("fetch"))) => {
                    features.has_request = true
                }

                // Queries element.
                (ApiType::Get, (_, Some(attr)))
                    if attr.starts_with("querySelector")
                        || attr.starts_with("getElementBy")
                        || attr.starts_with("getElementsBy") =>
                {
                    features.queries_element = true
                }

                // Uses storage.
                (ApiType::Function, ("Storage", _) | ("HTMLDocument", Some("cookie"))) => {
                    features.uses_storage = true
                }

                _ => {}
            }
        }
        script_features.push(features);
    });

    {
        let mut file = BufWriter::new(File::create("data/script_features3.csv").unwrap());
        // Need to use tab because URLs may contain commas.
        file.write_all(
            b"id\tname\tsubdomain\tsize\trewritten\ttotal_call\tsure_frontend_processing\
              \tsure_dom_element_generation\tsure_ux_enhancement\
              \tsure_extensional_featuers\thas_request\tqueries_element\tuses_storage\n",
        )
        .unwrap();
        for ScriptFeatures {
            id,
            name,
            subdomain,
            size,
            rewritten,
            total_call,
            sure_frontend_processing,
            sure_dom_element_generation,
            sure_ux_enhancement,
            sure_extensional_featuers,
            has_request,
            queries_element,
            uses_storage,
        } in &script_features
        {
            writeln!(
                file,
                "{id}\t{name}\t{subdomain}\t{size}\t{rewritten}\t{total_call}\t{sure_frontend_processing}\
                 \t{sure_dom_element_generation}\t{sure_ux_enhancement}\
                 \t{sure_extensional_featuers}\t{has_request}\t{queries_element}\t{uses_storage}",
                name = name.as_deref().unwrap_or(""),
                sure_frontend_processing = *sure_frontend_processing as u8,
                sure_dom_element_generation = *sure_dom_element_generation as u8,
                sure_ux_enhancement = *sure_ux_enhancement as u8,
                sure_extensional_featuers = *sure_extensional_featuers as u8,
                has_request = *has_request as u8,
                queries_element = *queries_element as u8,
                uses_storage = *uses_storage as u8,
            )
            .unwrap();
        }
    }
}
