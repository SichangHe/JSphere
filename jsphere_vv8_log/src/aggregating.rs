use super::*;

#[pub_fields]
#[derive(Clone, Debug, Default)]
pub struct RecordAggregate {
    scripts: HashMap<i32, ScriptAggregate>,
    current_script_id: i32,
    interaction_injected: bool,
}

impl RecordAggregate {
    pub fn add(&mut self, line: usize, record: LogRecord) -> Result<()> {
        let maybe_get_set = match record {
            LogRecord::IsolateContext { address } => {
                debug!(line, "Ignoring isolate context {address:#x}");
                None
            }

            LogRecord::WindowOrigin { value } => {debug!(line, ?value, "Ignoring window.origin"); None},

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
                    is_injected && source[..source.len().min(50)].contains("Gremlins horde");
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
                    api_calls: Default::default(),
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
            } | LogRecord::FunctionCall { offset: -1, .. } => None,

            LogRecord::FunctionCall {
                method, receiver, .. // Ignore arguments, etc. for now.
            } => {
                let this = match receiver {
                    JSValue::Object { constructor, .. } => Some(constructor),
                    JSValue::Function { name, is_user_fn } => {
                        match is_user_fn {
                            true => None, // Ignore user functions.
                            false => Some(name),
                        }
                    }
                    JSValue::Lambda => None, // Ignore lambda calls.
                    _ => bail!("{line}: Unexpected function call receiver: {receiver:?}"),
                };
                if let Some(this) = this {
                    let api_call = ApiCall {
                        api_type: ApiType::Function,
                        this,
                        attr: Some(method),
                        may_be_interaction: self.interaction_injected,
                    };
                    let api_calls = &mut self.current_script()?.api_calls;api_calls.entry(api_call).or_default().push(line);
                }
                None
            }

            // Ignore user construction calls.
            LogRecord::ConstructionCall {
                is_user_fn: true, ..
            } => None,

            LogRecord::ConstructionCall {
                method,.. // Ignore arguments, etc. for now.
            } => {
                let api_call = ApiCall {
                    api_type: ApiType::Construction,
                    this: method,
                    attr: None,
                    may_be_interaction: self.interaction_injected,
                };
                    let api_calls = &mut self.current_script()?.api_calls;api_calls.entry(api_call).or_default().push(line);
                None
            },

            LogRecord::GetProperty {
                object,
                property,
                ..
            } => Some((ApiType::Get, object, property)),

            | LogRecord::SetProperty {
                object,
                property,
                ..
            } => Some((ApiType::Set, object, property)),
        };

        // Handle get/set calls after all other types.
        if let Some((api_type, object, property)) = maybe_get_set {
            let this = match object {
                JSValue::Object { constructor, .. } => Some(constructor),
                JSValue::ObjectLiteral { .. } => None, // Ignore object literals.
                _ => bail!("{line}: Unexpected get/set on object: {object:?}"),
            };
            if let Some(this) = this {
                let attr = match property {
                    JSValue::String(attr) => Some(attr),
                    JSValue::Int(_) | JSValue::Float(_) | JSValue::Unsure => None, // Ignore numbers or internal values.
                    _ => bail!("{line}: Unexpected get/set property: {property:?}"),
                };
                if attr.is_some() {
                    let api_call = ApiCall {
                        api_type,
                        this,
                        attr,
                        may_be_interaction: self.interaction_injected,
                    };
                    let api_calls = &mut self.current_script()?.api_calls;
                    api_calls.entry(api_call).or_default().push(line);
                }
            }
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
    line: usize,
    /// Indicates where the script came from.
    name: ScriptName,
    /// JS source code.
    source: String,
    injection_type: ScriptInjectionType,
    /// API calls made, and the lines where they were made.
    api_calls: HashMap<ApiCall, Vec<usize>>,
}

/// A browser JS API call.
///
/// Arguments are ignored.
#[derive_everything]
pub struct ApiCall {
    api_type: ApiType,
    this: String,
    attr: Option<String>,
    may_be_interaction: bool,
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
