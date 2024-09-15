use super::*;

/// A VV8 log record, corresponding to one line in the log file.
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
        /// The full script source, with unprintable and
        /// Unicode characters escaped (see [JSValue]).
        source: String,
    },

    /// `!`: Execution context for subsequent log records.
    ExecutionContext {
        /// Active script ID in the current isolate script-ID-space, e.g., 5.
        /// If set to [ID_UNSURE], means unsure.
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

/// Unsure script ID (`?` in the log file).
pub const ID_UNSURE: i32 = i32::MIN;

impl TryFrom<&str> for LogRecord {
    type Error = LogRecordErr;

    fn try_from(line: &str) -> Result<Self, Self::Error> {
        let mut parts = SplitRecordLine::new(&line[1..]);
        match &line[..1] {
            "~" => {
                let address_str = parts.next().ok_or(LogRecordErr::NoIsolateAddress)?;
                if !address_str.starts_with("0x") {
                    return Err(LogRecordErr::InvalidIsolateAddress);
                }
                let address = u64::from_str_radix(&address_str[2..], 16)
                    .map_err(|_| LogRecordErr::InvalidHexNumber)?;
                Ok(LogRecord::IsolateContext { address })
            }

            "@" => {
                let value = parts.next().ok_or(LogRecordErr::NoValue)?.into();
                Ok(LogRecord::WindowOrigin { value })
            }

            "$" => {
                let id = parts
                    .next()
                    .ok_or(LogRecordErr::NoScriptId)?
                    .parse()
                    .map_err(|_| LogRecordErr::InvalidScriptId)?;
                let name = parts.next().ok_or(LogRecordErr::NoScriptName)?.into();
                let source = unescape_colon(parts.drain());
                Ok(LogRecord::ScriptProvenance { id, name, source })
            }

            "!" => {
                let script_id_str = parts
                    .next()
                    .ok_or(LogRecordErr::NoExecutionContextScriptId)?;
                let script_id = match script_id_str {
                    "?" => ID_UNSURE,
                    _ => script_id_str
                        .parse()
                        .map_err(|_| LogRecordErr::InvalidExecutionContextScriptId)?,
                };
                Ok(LogRecord::ExecutionContext { script_id })
            }

            "c" => {
                let offset = parts
                    .next()
                    .ok_or(LogRecordErr::NoFunctionCallOffset)?
                    .parse()
                    .map_err(|_| LogRecordErr::InvalidFunctionCallOffset)?;
                let method = parts
                    .next()
                    .ok_or(LogRecordErr::NoFunctionCallMethod)?
                    .trim_start_matches('%')
                    .into();
                let receiver = parts
                    .next()
                    .ok_or(LogRecordErr::NoFunctionCallReceiver)?
                    .into();
                let arguments = parts.next().map_or(JSValue::Undefined, Into::into);
                Ok(LogRecord::FunctionCall {
                    offset,
                    method,
                    receiver,
                    arguments,
                })
            }

            "n" => {
                let offset = parts
                    .next()
                    .ok_or(LogRecordErr::NoConstructionCallOffset)?
                    .parse()
                    .map_err(|_| LogRecordErr::InvalidConstructionCallOffset)?;
                let method = parts
                    .next()
                    .ok_or(LogRecordErr::NoConstructionCallMethod)?
                    .trim_start_matches('%')
                    .into();
                let arguments = parts.next().map_or(JSValue::Undefined, Into::into);
                Ok(LogRecord::ConstructionCall {
                    offset,
                    method,
                    arguments,
                })
            }

            "g" => {
                let offset = parts
                    .next()
                    .ok_or(LogRecordErr::NoGetPropertyOffset)?
                    .parse()
                    .map_err(|_| LogRecordErr::InvalidGetPropertyOffset)?;
                let object = parts
                    .next()
                    .ok_or(LogRecordErr::NoGetPropertyObject)?
                    .into();
                let property = parts
                    .next()
                    .ok_or(LogRecordErr::NoGetPropertyProperty)?
                    .into();
                Ok(LogRecord::GetProperty {
                    offset,
                    object,
                    property,
                })
            }

            "s" => {
                let offset = parts
                    .next()
                    .ok_or(LogRecordErr::NoSetPropertyOffset)?
                    .parse()
                    .map_err(|_| LogRecordErr::InvalidSetPropertyOffset)?;
                let object = parts
                    .next()
                    .ok_or(LogRecordErr::NoSetPropertyObject)?
                    .into();
                let property = parts
                    .next()
                    .ok_or(LogRecordErr::NoSetPropertyProperty)?
                    .into();
                let value = parts.next().ok_or(LogRecordErr::NoSetPropertyValue)?.into();
                Ok(LogRecord::SetProperty {
                    offset,
                    object,
                    property,
                    value,
                })
            }
            _ => Err(LogRecordErr::UnknownLogRecordType),
        }
    }
}

/// Error when parsing a line of VV8 log record.
#[derive(Error)]
#[derive_enum_everything]
pub enum LogRecordErr {
    #[error("`~` not followed by isolate address")]
    NoIsolateAddress,
    #[error("`~` isolate address not a hex")]
    InvalidIsolateAddress,
    #[error("`~` isolate address not a valid hex number")]
    InvalidHexNumber,
    #[error("`@` not followed by value")]
    NoValue,
    #[error("`$` not followed by script ID")]
    NoScriptId,
    #[error("`$` script ID not number")]
    InvalidScriptId,
    #[error("`$` not followed by script name")]
    NoScriptName,
    #[error("`!` not followed by script ID")]
    NoExecutionContextScriptId,
    #[error("`!` script ID not number")]
    InvalidExecutionContextScriptId,
    #[error("`c` not followed by offset")]
    NoFunctionCallOffset,
    #[error("`c` offset not number")]
    InvalidFunctionCallOffset,
    #[error("`c` not followed by method")]
    NoFunctionCallMethod,
    #[error("`c` not followed by receiver")]
    NoFunctionCallReceiver,
    #[error("`n` not followed by offset")]
    NoConstructionCallOffset,
    #[error("`n` offset not number")]
    InvalidConstructionCallOffset,
    #[error("`n` not followed by method")]
    NoConstructionCallMethod,
    #[error("`g` not followed by offset")]
    NoGetPropertyOffset,
    #[error("`g` offset not number")]
    InvalidGetPropertyOffset,
    #[error("`g` not followed by object")]
    NoGetPropertyObject,
    #[error("`g` not followed by property")]
    NoGetPropertyProperty,
    #[error("`s` not followed by offset")]
    NoSetPropertyOffset,
    #[error("`s` offset not number")]
    InvalidSetPropertyOffset,
    #[error("`s` not followed by object")]
    NoSetPropertyObject,
    #[error("`s` not followed by property")]
    NoSetPropertyProperty,
    #[error("`s` not followed by value")]
    NoSetPropertyValue,
    #[error("Unknown log record type")]
    UnknownLogRecordType,
}

#[cfg(test)]
mod tests;
