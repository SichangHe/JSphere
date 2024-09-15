use super::*;

#[test]
fn vv8_log_file_name() {
    let expected = LogFileInfo {
        timestamp: 1726285073665,
        pid: 87,
        tid: 87,
        thread_name: "chrome.0".into(),
    };
    let actual = "vv8-1726285073665-87-87-chrome.0.log".try_into().unwrap();
    assert_eq!(expected, actual);
}

#[test]
fn not_vv8_log_file_name() {
    assert!(is_not_vv8_log_file("test.log"));
    assert!(is_not_vv8_log_file("vv8-1726285073665-87-87-chrome.0"));
    assert!(is_not_vv8_log_file("papers.tar.gz"));
}
