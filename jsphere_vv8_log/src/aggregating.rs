use super::*;

#[pub_fields]
#[derive(Clone, Debug, Default)]
pub struct RecordAggregate {
    scripts: HashMap<i32, ScriptAggregate>,
    current_script_id: i32,
    interaction_injected: bool,
}

impl RecordAggregate {
    pub fn add(&mut self, line: u32, record: LogRecord) -> Result<()> {
        let maybe_get_set = match record {
            LogRecord::IsolateContext { address } => {
                debug!(line, "Ignoring isolate context {address:#x}");
                None
            }

            LogRecord::WindowOrigin { value } => {
                debug!(line, ?value, "Ignoring window.origin");
                None
            }

            LogRecord::ScriptProvenance { id, name, source } => {
                let name = name.try_into()?;
                let is_injected = match name {
                    ScriptName::Empty => true,
                    ScriptName::Url(_) => false,
                    ScriptName::Eval { parent_script_id } => matches!(
                        self.scripts
                            .get(&parent_script_id)
                            .context("Unknown parent script ID")?
                            .injection_type,
                        ScriptInjectionType::Injected | ScriptInjectionType::Interaction
                    ),
                };
                // NOTE: Hardcoding interaction script check for now.
                let is_interaction =
                    is_injected && source[..source.len().min(100)].contains("Gremlins horde");
                let injection_type = match (is_interaction, is_injected) {
                    (true, _) => ScriptInjectionType::Interaction,
                    (_, true) => ScriptInjectionType::Injected,
                    _ => ScriptInjectionType::Not,
                };
                let script = ScriptAggregate {
                    line,
                    name,
                    source,
                    injection_type,
                    ..Default::default()
                };
                if let Some(prev_script) = self.scripts.insert(id, script) {
                    bail!("Overwrote script {id}: {prev_script:?}");
                }
                None
            }

            // Ignore unsure execution contexts.
            LogRecord::ExecutionContext { script_id } if script_id == ID_UNSURE => None,

            LogRecord::ExecutionContext { script_id } => {
                self.current_script_id = script_id;
                let script = self.current_script()?;
                if matches!(script.injection_type, ScriptInjectionType::Interaction) {
                    // Entering a context with an interaction script is
                    // the only way we know an interaction started for sure.
                    self.interaction_injected = true;
                }
                None
            }

            // Ignore user function calls or function calls with
            // a placeholder offset.
            LogRecord::FunctionCall {
                is_user_fn: true, ..
            }
            | LogRecord::FunctionCall { offset: -1, .. }
            | LogRecord::ConstructionCall {
                is_user_fn: true, ..
            } => {
                if let Ok(script) = self.current_script() {
                    script.n_filtered_call += 1;
                }
                None
            }

            LogRecord::FunctionCall {
                // Ignore arguments, etc. for now.
                method,
                receiver,
                ..
            } => {
                let this = match receiver {
                    JSValue::Object { constructor, .. } => Some(constructor),
                    JSValue::Function { name, is_user_fn } => {
                        match is_user_fn {
                            true => None, // Ignore user functions.
                            false => Some(name),
                        }
                    }

                    JSValue::Lambda
                    | JSValue::V8Specific
                    | JSValue::ObjectUnknown(_)
                    | JSValue::ObjectLiteral { .. }
                    | JSValue::Unsure => None, // Ignore internal calls or calls of user-defined functions.

                    JSValue::String(_)
                    | JSValue::Int(_)
                    | JSValue::Float(_)
                    | JSValue::RegEx(_)
                    | JSValue::Boolean(_)
                    | JSValue::Null
                    | JSValue::Undefined => {
                        if method != "Function" {
                            Some("".into()) // Record empty string for static functions.
                        } else {
                            None // Ignore placeholder calls on `Function`.
                        }
                    }
                };

                if let Some(this) = this {
                    let api_call = ApiCall {
                        api_type: ApiType::Function,
                        this,
                        attr: Some(method),
                    };
                    self.push_api_call(api_call, line)?;
                } else {
                    self.current_script()?.n_filtered_call += 1;
                }
                None
            }

            LogRecord::ConstructionCall {
                // Ignore arguments, etc. for now.
                method,
                ..
            } => {
                let api_call = ApiCall {
                    api_type: ApiType::Construction,
                    this: method,
                    attr: None,
                };
                self.push_api_call(api_call, line)?;
                None
            }

            LogRecord::GetProperty {
                object, property, ..
            } => Some((ApiType::Get, object, property)),

            LogRecord::SetProperty {
                object, property, ..
            } => Some((ApiType::Set, object, property)),
        };

        // Handle get/set calls after all other types.
        if let Some((api_type, object, property)) = maybe_get_set {
            let this = match object {
                JSValue::Object { constructor, .. } => Some(constructor),
                JSValue::ObjectLiteral { .. } => None, // Ignore object literals.
                _ => bail!("{line}: Unexpected get/set on object: {object:?}"),
            };
            let maybe_this_attr = if let Some(this) = this {
                let attr = match property {
                    JSValue::String(attr) => Some(attr),
                    // Ignore getting/setting user-defined or internal values.
                    JSValue::Object { .. }
                    | JSValue::Int(_)
                    | JSValue::Float(_)
                    | JSValue::Unsure => None,
                    _ => bail!("{line}: Unexpected get/set property: {property:?}"),
                };
                attr.map(|attr| (this, attr))
            } else {
                None
            };
            if let Some((this, attr)) = maybe_this_attr {
                let api_call = ApiCall {
                    api_type,
                    this,
                    attr: Some(attr),
                };
                self.push_api_call(api_call, line)?;
            } else {
                self.current_script()?.n_filtered_call += 1
            }
        }
        Ok(())
    }

    fn push_api_call(&mut self, api_call: ApiCall, line: u32) -> Result<()> {
        let may_interact = self.interaction_injected;
        let current_script = self.current_script()?;
        if api_call.likely_browser_api() {
            let lines = current_script.api_calls.entry(api_call).or_default();
            if may_interact && lines.i_may_interact.is_none() {
                lines.i_may_interact = Some(lines.lines.len() as u32);
            }
            lines.lines.push(line);
        } else {
            current_script.n_filtered_call += 1;
        }
        Ok(())
    }

    fn current_script(&mut self) -> Result<&mut ScriptAggregate> {
        self.scripts
            .get_mut(&self.current_script_id)
            .context("Unknown execution context script ID")
    }
}

/// A script that was executed and its aggregate information.
#[pub_fields]
#[derive(Clone, Debug, Default)]
pub struct ScriptAggregate {
    /// Line number in the log file where the script's context appears.
    line: u32,
    /// Indicates where the script came from.
    name: ScriptName,
    /// JS source code.
    source: String,
    injection_type: ScriptInjectionType,
    /// API calls made, and the lines where they were made.
    api_calls: HashMap<ApiCall, CallLines>,
    /// API calls that are filtered out.
    n_filtered_call: u32,
}

/// A browser JS API call.
///
/// Arguments are ignored.
#[pub_fields]
#[derive_everything]
pub struct ApiCall {
    api_type: ApiType,
    this: String,
    attr: Option<String>,
}

impl ApiCall {
    /// Whether the call is likely a browser API call, judging by its name.
    /// Names are checked to be alphanumeric, optionally with dots and spaces,
    /// with at most 3 consecutive numbers.
    /// `this` needs to be at least 3 characters long; `attr` needs to be at
    /// least 2 characters.
    pub fn likely_browser_api(&self) -> bool {
        let Self { this, attr, .. } = self;
        this.len() >= 3
            && match_browser_api_name(this)
            && match attr {
                Some(attr) => attr.len() >= 2 && match_browser_api_name(attr),
                None => true,
            }
    }
}

fn match_browser_api_name(name: &str) -> bool {
    regex_is_match!(r"^([A-Za-z\. ]+[0-9]{0,3})+$", name)
}

/// Lines where API calls were made.
#[pub_fields]
#[derive_everything]
pub struct CallLines {
    lines: Vec<u32>,
    /// The index in `lines`, starting from which there may be interactions.
    i_may_interact: Option<u32>,
}

impl CallLines {
    pub fn len(&self) -> u32 {
        self.lines.len() as u32
    }

    pub fn n_may_interact(&self) -> u32 {
        self.len() - self.n_must_not_interact()
    }

    pub fn n_must_not_interact(&self) -> u32 {
        self.i_may_interact.unwrap_or(self.len())
    }
}

/// The type of API call.
#[derive_everything]
pub enum ApiType {
    #[default]
    Function,
    Construction,
    Get,
    Set,
}

/// New script's name.
/// E.g., `"chrome\://headless/headless_command.js"` or `""`.
#[derive_everything]
pub enum ScriptName {
    /// This also means that the script is either injected or internal.
    #[default]
    Empty,
    /// In URL form
    Url(String),
    /// The parent script's ID in case of `eval`.
    Eval { parent_script_id: i32 },
}

/// Whether the script was injected, and if so, whether it was for interaction.
#[derive_everything]
pub enum ScriptInjectionType {
    #[default]
    Not,
    Injected,
    Interaction,
}

impl TryFrom<JSValue> for ScriptName {
    type Error = shame::anyhow::Error;

    fn try_from(value: JSValue) -> Result<Self, Self::Error> {
        Ok(match value {
            JSValue::String(empty) if empty.is_empty() => Self::Empty,
            JSValue::String(url) => Self::Url(url),
            JSValue::Int(parent_script_id) => Self::Eval {
                parent_script_id: parent_script_id as i32,
            },
            _ => bail!("Unexpected script name: {value:?}"),
        })
    }
}
