use super::*;

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
