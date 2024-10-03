use super::*;

#[test]
fn log_record_parsing() {
    let expected = LogRecord::IsolateContext {
        address: u64::from_str_radix("2a3800370000", 16).unwrap(),
    };
    let actual = "~0x2a3800370000".try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::WindowOrigin {
        value: JSValue::Unsure,
    };
    let actual = "@?".try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::ExecutionContext {
        script_id: ID_UNSURE,
    };
    let actual = "!?".try_into().unwrap();
    assert_eq!(expected, actual);

    let arguments = vec![JSValue::String(
        "eyJtZXRob2QiOiJQYWdlLmZyYW1lU3RvcHBlZExvYWRpbmciLCJwYXJhbXMiOnsiZnJhbWVJZCI6IjQxMTNDMTY3NDA0REYxOUQ3MUI5NjdDMEYwMTA2NjNGIn0sIn Nlc3Npb25JZCI6IjgwRTg0QUM5N0JDMjA1NTQ2RkQ2QUQ5MTQ2NzEyRkQxIn0=".into()
        )];
    let expected = LogRecord::FunctionCall {
        offset: 27,
        method: "atob".into(),
        is_user_fn: false,
        receiver: JSValue::Object {
            index: 729551,
            constructor: "Window".into(),
        },
        arguments,
    };
    let line = r#"c27:%atob:{729551,Window}:"eyJtZXRob2QiOiJQYWdlLmZyYW1lU3RvcHBlZExvYWRpbmciLCJwYXJhbXMiOnsiZnJhbWVJZCI6IjQxMTNDMTY3NDA0REYxOUQ3MUI5NjdDMEYwMTA2NjNGIn0sIn Nlc3Npb25JZCI6IjgwRTg0QUM5N0JDMjA1NTQ2RkQ2QUQ5MTQ2NzEyRkQxIn0=""#;
    let actual = line.try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::FunctionCall {
        offset: 143517,
        method: "getSubscription".into(),
        is_user_fn: false,
        receiver: JSValue::Object {
            index: 847586,
            constructor: "PushManager".into(),
        },
        arguments: vec![],
    };
    let actual = "c143517:%getSubscription:{847586,PushManager}"
        .try_into()
        .unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::ConstructionCall {
        offset: 36193,
        method: "MutationObserver".into(),
        is_user_fn: false,
        arguments: vec![JSValue::Lambda],
    };
    let actual = "n36193:%MutationObserver:<anonymous>".try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::ConstructionCall {
        offset: 23,
        method: "Image".into(),
        is_user_fn: false,
        arguments: vec![],
    };
    let actual = "n23:%Image".try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::GetProperty {
        offset: 74,
        object: JSValue::Object {
            index: 729551,
            constructor: "Window".into(),
        },
        property: JSValue::String("cdp".into()),
    };
    let actual = r#"g74:{729551,Window}:"cdp""#.try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::SetProperty {
        offset: 185,
        object: JSValue::Object {
            index: 729551,
            constructor: "Window".into(),
        },
        property: JSValue::String("cdp".into()),
        value: JSValue::Object {
            index: 663864,
            constructor: "Object".into(),
        },
    };
    let actual = r#"s185:{729551,Window}:"cdp":{663864,Object}"#.try_into().unwrap();
    assert_eq!(expected, actual);

    let expected = LogRecord::FunctionCall {
        offset: 326104,
        method: "createPolicy".into(),
        is_user_fn: false,
        receiver: JSValue::Object {
            index: 551471,
            constructor: "TrustedTypePolicyFactory".into(),
        },
        arguments: vec![
            JSValue::String("polymer_resin".into()),
            JSValue::ObjectLiteral {
                index: 71465,
                pairs: vec![
                    ("createHTML".into(), "createHTML".into()),
                    ("createScript".into(), "createScript".into()),
                    ("createScriptURL".into(), "createScriptURL".into()),
                ],
            },
        ],
    };
    let actual = r#"c326104:%createPolicy:{551471,TrustedTypePolicyFactory}:"polymer_resin":{71465,createHTML\:createHTML,createScript\:createScript,createScriptURL\:createScriptURL}"#.try_into().unwrap();
    assert_eq!(expected, actual);
}
