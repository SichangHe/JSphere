# Analysis of selected YouTube scripts API calls

Note: The `may_be_interaction` tags here are confusing.
They should have been per-line instead of per-API-type.

## Overview

```rust
let mut logs = read_logs("headless_browser/target/youtube.com/0").unwrap();
let mut aggregate = RecordAggregate::default();
for entry in &logs[2].records {
    let (line, record) = entry.clone();
    if let Err(err) = aggregate.add(line, record) {
        println!("{line}: {err}");
    }
}

for (id, script) in &aggregate.scripts {
    println!(
        "{id} line#{} source~{}kB used {} APIs {:?} {:?}",
        script.line,
        script.source.len() / 1024,
        script.api_calls.len(),
        script.injection_type,
        script.name,
    );
}

18 line#796 source~11kB used 18 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/www-tampering.vflset/www-tampering.js")
36 line#1090 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
14 line#1112 source~8466kB used 2362 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/desktop_polymer.vflset/desktop_polymer.js")
35 line#1078 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
10 line#372 source~0kB used 0 APIs Not Url("https://www.youtube.com/")
64 line#95189 source~0kB used 1 APIs Injected Eval { parent_script_id: 50 }
17 line#782 source~5kB used 7 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/www-i18n-constants-en_US.vflset/www-i18n-constants.js")
26 line#986 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
48 line#89858 source~0kB used 0 APIs Not Url("https://www.youtube.com/")
56 line#94977 source~0kB used 4 APIs Injected Eval { parent_script_id: 50 }
30 line#1021 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
25 line#947 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
21 line#482 source~77kB used 459 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/webcomponents-sd.vflset/webcomponents-sd.js")
11 line#374 source~2kB used 15 APIs Not Url("https://www.youtube.com/")
19 line#717 source~9kB used 29 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/scheduler.vflset/scheduler.js")
33 line#1054 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
45 line#89653 source~0kB used 4 APIs Not Url("https://www.youtube.com/")
41 line#89054 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
65 line#260337 source~277kB used 214 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/www-searchbox.vflset/www-searchbox.js")
8 line#355 source~3kB used 6 APIs Not Url("https://www.youtube.com/")
34 line#1066 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
9 line#363 source~0kB used 5 APIs Not Url("https://www.youtube.com/")
32 line#1048 source~0kB used 2 APIs Not Url("https://www.youtube.com/")
31 line#1036 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
6 line#348 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
23 line#607 source~445kB used 6 APIs Not Url("https://www.youtube.com/")
46 line#89728 source~0kB used 14 APIs Not Url("https://www.youtube.com/")
50 line#92474 source~11kB used 5 APIs Injected Empty
28 line#1009 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
55 line#94972 source~0kB used 0 APIs Injected Empty
49 line#89863 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
24 line#705 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
58 line#94996 source~0kB used 4 APIs Injected Eval { parent_script_id: 50 }
7 line#351 source~0kB used 2 APIs Not Url("https://www.youtube.com/")
22 line#595 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
()
13 line#951 source~14kB used 21 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/network.vflset/network.js")
27 line#998 source~0kB used 3 APIs Not Url("https://www.youtube.com/")
42 line#89187 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
37 line#1101 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
47 line#89775 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
16 line#591 source~5kB used 1 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/intersection-observer.min.vflset/intersection-observer.min.js")
43 line#89498 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
20 line#467 source~2kB used 8 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/custom-elements-es5-adapter.vflset/custom-elements-es5-adapter.js")
61 line#95117 source~227kB used 135 APIs Injected Eval { parent_script_id: 50 }
15 line#413 source~50kB used 37 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/web-animations-next-lite.min.vflset/web-animations-next-lite.min.js")
44 line#89581 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
12 line#831 source~37kB used 46 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/spf.vflset/spf.js")
```

## Selected scripts inspection

`https://www.youtube.com/s/desktop/72b8c307/jsbin/www-tampering.vflset/www-tampering.js`
is part of the [Closure Library](https://github.com/google/closure-library) to
detect if the page is tempered.
The API calls is clearly mainly for **extensional features**,
gathering information from `userAgent` and doing math:

```rust
for (api_call, lines) in &aggregate.scripts[&18].api_calls {
    println!("{} times: {api_call:?}", lines.len());
}

1 times: ApiCall { api_type: Set, this: "Window", attr: Some("ytbin"), may_be_interaction: false }
7 times: ApiCall { api_type: Get, this: "Window", attr: Some("navigator"), may_be_interaction: false }
1 times: ApiCall { api_type: Function, this: "Navigator", attr: Some("get userAgentData"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("CLOSURE_FLAGS"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("execScript"), may_be_interaction: false }
6 times: ApiCall { api_type: Get, this: "Navigator", attr: Some("userAgent"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("ytbin"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Set"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Navigator", attr: Some("userAgentData"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Object"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("WeakMap"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Math"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("window"), may_be_interaction: false }
2 times: ApiCall { api_type: Get, this: "Window", attr: Some("Symbol"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Map"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("String"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Array"), may_be_interaction: false }
4 times: ApiCall { api_type: Get, this: "Window", attr: Some("yt"), may_be_interaction: false }
```

---

`https://www.youtube.com/s/desktop/72b8c307/jsbin/desktop_polymer.vflset/desktop_polymer.js`
contains the
[Polymer](https://polymer-library.polymer-project.org/3.0/docs/devguide/feature-overview)
code that generates HTML.
These are mainly event-related APIs for **frontend processing** and APIs for
**DOM element generation** (perhaps a bit of **UX enhancement** as well):

```rust
for (api_call, lines) in &aggregate.scripts[&14].api_calls {
    if lines.len() > 2000 {
        println!("{} times: {api_call:?}", lines.len());
    }
}

2480 times: ApiCall { api_type: Get, this: "Event", attr: Some("pageY"), may_be_interaction: false }
3031 times: ApiCall { api_type: Get, this: "c", attr: Some("polymerController"), may_be_interaction: false }
8817 times: ApiCall { api_type: Get, this: "Window", attr: Some("Reflect"), may_be_interaction: false }
45032 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("tagName"), may_be_interaction: false }
7143 times: ApiCall { api_type: Function, this: "HTMLBodyElement", attr: Some("appendChild"), may_be_interaction: false }
2434 times: ApiCall { api_type: Get, this: "Event", attr: Some("type"), may_be_interaction: false }
2480 times: ApiCall { api_type: Get, this: "Event", attr: Some("target"), may_be_interaction: false }
3803 times: ApiCall { api_type: Function, this: "DocumentFragment", attr: Some("get children"), may_be_interaction: false }
7143 times: ApiCall { api_type: Get, this: "HTMLBodyElement", attr: Some("isConnected"), may_be_interaction: false }
2480 times: ApiCall { api_type: Get, this: "Event", attr: Some("pageX"), may_be_interaction: false }
21792 times: ApiCall { api_type: Function, this: "HTMLDivElement", attr: Some("querySelectorAll"), may_be_interaction: false }
6449 times: ApiCall { api_type: Get, this: "DocumentFragment", attr: Some("children"), may_be_interaction: false }
21780 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("isConnected"), may_be_interaction: false }
2065 times: ApiCall { api_type: Get, this: "Event", attr: Some("keyCode"), may_be_interaction: false }
22409 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("usePatchedLifecycles"), may_be_interaction: false }
10226 times: ApiCall { api_type: Get, this: "DocumentFragment", attr: Some("isConnected"), may_be_interaction: false }
10717 times: ApiCall { api_type: Function, this: "HTMLBodyElement", attr: Some("removeChild"), may_be_interaction: false }
2863 times: ApiCall { api_type: Get, this: "c", attr: Some("loggingStatus"), may_be_interaction: false }
10187 times: ApiCall { api_type: Function, this: "DocumentFragment", attr: Some("appendChild"), may_be_interaction: false }
```

---

The script with context id `23` on line `#607` embedded in
the HTML only sets a large 440kB JSON for various string templates for
the UI (e.g., `Downloading 1 video...`), thus kind of counts as
**DOM element generation**:

```rust
for (api_call, lines) in &aggregate.scripts[&23].api_calls {
    println!("{} times: {api_call:?}", lines.len());
}

1 times: ApiCall { api_type: Get, this: "Window", attr: Some("innerWidth"), may_be_interaction: false }
1 times: ApiCall { api_type: Set, this: "Window", attr: Some("ytplayer"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("yt"), may_be_interaction: false }
2 times: ApiCall { api_type: Get, this: "Window", attr: Some("ytcfg"), may_be_interaction: false }
1 times: ApiCall { api_type: Set, this: "Window", attr: Some("ytcfg"), may_be_interaction: false }
1 times: ApiCall { api_type: Get, this: "Window", attr: Some("innerHeight"), may_be_interaction: false }
```
