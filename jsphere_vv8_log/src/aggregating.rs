use std::collections::HashMap;

use super::*;

#[pub_fields]
#[derive(Debug, Clone)]
pub struct RecordAggregate {
    scripts: HashMap<i32, ScriptAggregate>,
    current_script_id: i32,
    interaction_injected: bool,
    // TODO: Record API calls.
}

impl RecordAggregate {
    pub fn add(&mut self, line: usize, record: LogRecord) -> Result<()> {
        match record {
            LogRecord::IsolateContext { address } => {
                debug!(line, "Ignoring isolate context {address:#x}");
            }

            LogRecord::WindowOrigin { value } => debug!(line, ?value, "Ignoring window.origin"),

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
                    is_injected && source[..source.len().min(50)].contains("Create Gremlins horde");
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
                };
                if let Some(prev_script) = self.scripts.insert(id, script) {
                    bail!("Overwrote script {id}: {prev_script:?}");
                }
            }

            LogRecord::ExecutionContext { script_id } => {
                let script = self
                    .scripts
                    .get(&script_id)
                    .context("Unknown execution context script ID")?;
                if matches!(script.injection_type, ScriptInjectionType::Interaction) {
                    self.interaction_injected = true;
                }
                self.current_script_id = script_id;
            }

            // TODO: Record API calls, alone with if they could be triggered by
            // interactions.
            LogRecord::FunctionCall {
                offset,
                method,
                is_user_fn,
                receiver,
                arguments,
            } => todo!(),

            LogRecord::ConstructionCall {
                offset,
                method,
                is_user_fn,
                arguments,
            } => todo!(),

            LogRecord::GetProperty {
                offset,
                object,
                property,
            } => todo!(),

            LogRecord::SetProperty {
                offset,
                object,
                property,
                value,
            } => todo!(),
        }
        Ok(())
    }
}

#[pub_fields]
#[derive_enum_everything]
pub struct ScriptAggregate {
    line: usize,
    name: ScriptName,
    source: String,
    injection_type: ScriptInjectionType,
}

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
