use super::*;

/// JavaScript and V8 values. As per VV8 output, strings are
/// ASCII-encoded, escaping unprintable characters as `\xNN` and
/// Unicode characters as `\uNNNN`.
#[derive_float_enum_everything]
pub enum JSValue {
    String(String),
    Int(i64),
    Float(f64),
    RegEx(String),
    Boolean(bool),
    Null,
    Undefined,
    /// "V8-specific oddball type that leaks into the log data".
    V8Specific,
    Function {
        name: String,
        is_user_fn: bool,
    },
    /// Anonymous function.
    Lambda,
    /// Object with the name of the constructor function.
    Object {
        index: i32,
        constructor: String,
    },
    /// Object with only the index.
    ObjectUnknown(i32),
    /// Literal object.
    ObjectLiteral {
        index: i32,
        pairs: Vec<(String, String)>,
    },
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
                if value.starts_with("\"") && value.ends_with("\"") && value.len() >= 2 {
                    // "<string>"
                    JSValue::String(unescape_colon(&value[1..value.len() - 1]))
                } else if value.starts_with('/') && value.ends_with('/') && value.len() >= 2 {
                    // "/regex/"
                    JSValue::RegEx(unescape_colon(&value[1..value.len() - 1]))
                } else if value.starts_with('{') && value.ends_with('}') {
                    // "{Object}"
                    parse_js_object(value).unwrap_or(JSValue::ObjectUnknown(-1))
                } else if let Ok(n) = value.parse() {
                    JSValue::Int(n)
                } else if let Ok(n) = value.parse() {
                    JSValue::Float(n)
                } else if let Some(stripped) = value.strip_prefix("%") {
                    JSValue::Function {
                        name: unescape_colon(stripped),
                        is_user_fn: false,
                    }
                } else {
                    JSValue::Function {
                        name: unescape_colon(value),
                        is_user_fn: true,
                    }
                }
            }
        }
    }
}

fn parse_js_object(value: &str) -> Option<JSValue> {
    let mut splits = value[1..value.len() - 1].split(',');
    let index = splits.next()?.parse().ok()?;
    Some(if let Some(constructor) = splits.next() {
        if let Some(pair1) = splits.next() {
            // {index,key0\:val0,key1\:val1}
            let pair0 = constructor;
            let mut pairs = Vec::with_capacity(4); // Usually big enough.
            for pair in [pair0, pair1].into_iter().chain(splits) {
                let (key, val) = pair.split_once(r"\:")?;
                pairs.push((unescape_colon(key), unescape_colon(val)));
            }
            pairs.shrink_to_fit();
            JSValue::ObjectLiteral { index, pairs }
        } else {
            // {index,constructor}
            JSValue::Object {
                index,
                constructor: unescape_colon(constructor),
            }
        }
    } else {
        // {index}
        JSValue::ObjectUnknown(index)
    })
}
