//! Parsing logic for VisibleV8 (VV8) log files.
//! See
//! <https://github.com/SichangHe/wspr-ncsu--visiblev8/blob/master/tests/README.md>
//! for the specification of the log file format.

use std::{
    fs::{self, File},
    io::{BufRead, BufReader},
    path::Path,
};

use record_lines::SplitRecordLine;
use shame::{anyhow, prelude::*};

pub mod log_files;
pub mod record_lines;

/// Enum to represent the different types of log records.
/// Each variant corresponds to a specific type of event in the V8 JavaScript engine.
#[derive_float_enum_everything]
pub enum LogRecord {
    /// `~`: (Possibly) a new isolate context, a namespace for e.g. script IDs.
    IsolateContext {
        /// Isolate address that is unique per-process, e.g., `0x2a3800370000`.
        address: u64,
    },

    /// `@`: (Possibly) a new `window.origin` value of
    /// the current isolate context.
    WindowOrigin {
        /// Contains either the [JSValue::String] retrieved from the property,
        /// or [JSValue::Unsure] if that is unavailable.
        value: JSValue,
    },

    /// `$`: Script provenance.
    ScriptProvenance {
        /// The new script's ID, e.g., 5.
        id: i32,
        /// Either the new script's name in URL form as [JSValue::String], or
        /// the parent script's ID as [JSValue::Number] in case of `eval`.
        /// E.g., `"chrome\://headless/headless_command.js"` or `""`.
        name: JSValue,
        /// The full script source.
        source: String,
    },

    /// `!`: Execution context for subsequent log records.
    ExecutionContext {
        /// Active script ID in the current isolate script-ID-space, e.g., 5.
        script_id: i32,
    },

    /// `c`: Function call.
    FunctionCall {
        /// Character offset within the script, e.g., 27 or -1.
        offset: i32,
        /// Function object/name, e.g., `%atob`. We trim the leading `%`.
        method: String,
        /// Receiver (`this` value), e.g., `{729551,Window}`.
        receiver: JSValue,
        /// Positional arguments to the function.
        arguments: JSValue,
    },

    /// `n`: "Construction" function call, e.g., `new Foo(1, 2, 3)`.
    ConstructionCall {
        /// Character offset within the script, e.g., 23.
        offset: i32,
        /// Function object/name, e.g., `%Image`. We trim the leading `%`.
        method: String,
        /// Positional arguments to the function.
        arguments: JSValue,
    },

    /// `g`: Getting property value, e.g., `foo.bar`.
    GetProperty {
        /// Character offset within the script, e.g., 74.
        offset: i32,
        /// Object owning the property, e.g., `{729551,Window}`.
        object: JSValue,
        /// Property name/index, e.g., `"cdp"`.
        property: JSValue,
    },

    /// `s`: Setting property value, e.g., `foo.bar = baz`.
    SetProperty {
        /// Character offset within the script, e.g., 185.
        offset: i32,
        /// Object owning the property, e.g., `{729551,Window}`.
        object: JSValue,
        /// Property name/index, e.g., `"cdp"`.
        property: JSValue,
        /// New value, e.g., `{663864,Object}`.
        value: JSValue,
    },
}

impl TryFrom<&str> for LogRecord {
    type Error = anyhow::Error;

    /// Assumptions: The input is a valid VV8 log record line in plain ASCII.
    /// We do not care about excessive portions after the last delimiter.
    fn try_from(line: &str) -> Result<Self> {
        let mut parts = SplitRecordLine::new(&line[1..]);
        Ok(match &line[..1] {
            "~" => {
                let address_str = parts
                    .next()
                    .context("`~` not followed by isolate address")?;
                if !address_str.starts_with("0x") {
                    bail!("`~` isolate address not a hex");
                }
                let address = u64::from_str_radix(&address_str[2..], 16)
                    .context("`~` isolate address not a valid hex number")?;
                LogRecord::IsolateContext { address }
            }
            "@" => {
                let value = parts.next().context("`@` not followed by value")?.into();
                LogRecord::WindowOrigin { value }
            }
            "$" => {
                let id = parts
                    .next()
                    .context("`$` not followed by script ID")?
                    .parse()
                    .context("`$` script ID not number")?;
                let name = parts
                    .next()
                    .context("`$` not followed by script name")?
                    .into();
                // TODO: Unescape the source.
                let source = parts.drain().into();
                LogRecord::ScriptProvenance { id, name, source }
            }
            "!" => {
                let script_id = parts
                    .next()
                    .context("`!` not followed by script ID")?
                    .parse()
                    .context("`!` script ID not number")?;
                LogRecord::ExecutionContext { script_id }
            }
            "c" => {
                let offset = parts
                    .next()
                    .context("`c` not followed by offset")?
                    .parse()
                    .context("`c` offset not number")?;
                let method = parts
                    .next()
                    .context("`c` not followed by method")?
                    .trim_start_matches('%')
                    .into();
                let receiver = parts.next().context("`c` not followed by receiver")?.into();
                let arguments = parts.next().map_or(JSValue::Undefined, Into::into);
                LogRecord::FunctionCall {
                    offset,
                    method,
                    receiver,
                    arguments,
                }
            }
            "n" => {
                let offset = parts
                    .next()
                    .context("`n` not followed by offset")?
                    .parse()
                    .context("`n` offset not number")?;
                let method = parts
                    .next()
                    .context("`n` not followed by method")?
                    .trim_start_matches('%')
                    .into();
                let arguments = parts.next().map_or(JSValue::Undefined, Into::into);
                LogRecord::ConstructionCall {
                    offset,
                    method,
                    arguments,
                }
            }
            "g" => {
                let offset = parts
                    .next()
                    .context("`g` not followed by offset")?
                    .parse()
                    .context("`g` offset not number")?;
                let object = parts.next().context("`g` not followed by object")?.into();
                let property = parts.next().context("`g` not followed by property")?.into();
                LogRecord::GetProperty {
                    offset,
                    object,
                    property,
                }
            }
            "s" => {
                let offset = parts
                    .next()
                    .context("`s` not followed by offset")?
                    .parse()
                    .context("`s` offset not number")?;
                let object = parts.next().context("`s` not followed by object")?.into();
                let property = parts.next().context("`s` not followed by property")?.into();
                let value = parts.next().context("`s` not followed by value")?.into();
                LogRecord::SetProperty {
                    offset,
                    object,
                    property,
                    value,
                }
            }
            _ => bail!("Unknown log record type for `{line}`"),
        })
    }
}

/// JavaScript and V8 values. As per VV8 output, strings are
/// ASCII-encoded, escaping unprintable characters as `\xNN` and
/// Unicode characters as `\uNNNN`.
#[derive_float_enum_everything]
pub enum JSValue {
    String(String),
    Number(f64),
    RegEx(String),
    Boolean(bool),
    Null,
    Undefined,
    /// "V8-specific oddball type that leaks into the log data".
    V8Specific,
    Function(String),
    /// Anonymous function.
    Lambda,
    /// Object with the name of the constructor function,
    /// usually `{offset,Constructor}`.
    // TODO: Split into offset and constructor.
    Object(String),
    /// A value the logging code is unsure about.
    Unsure,
}

impl From<&str> for JSValue {
    fn from(value: &str) -> Self {
        match value {
            "#F" => JSValue::Boolean(false),
            "#T" => JSValue::Boolean(true),
            "#N" => JSValue::Null,
            "#U" => JSValue::Undefined,
            "#?" => JSValue::V8Specific,
            "<anonymous>" => JSValue::Lambda,
            "?" => JSValue::Unsure,
            _ => {
                if value.starts_with("\"") && value.ends_with("\"") {
                    // "<string>"
                    JSValue::String(unescape_colon(&value[1..value.len() - 1]))
                } else if value.starts_with('/') && value.ends_with('/') {
                    // "/regex/"
                    JSValue::RegEx(unescape_colon(&value[1..value.len() - 1]))
                } else if value.starts_with('{') && value.ends_with('}') {
                    // "{Constructor}"
                    JSValue::Object(value[1..value.len() - 1].into())
                } else if let Ok(n) = value.parse() {
                    JSValue::Number(n)
                } else {
                    JSValue::Function(value.into())
                }
            }
        }
    }
}

fn unescape_colon(data: &str) -> String {
    data.replace(r"\:", ":").replace(r"\\", r"\")
}

#[cfg(test)]
mod tests;
