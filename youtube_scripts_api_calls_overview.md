# Analysis of selected YouTube scripts API calls

## Overview

```rust
let mut logs = read_logs("headless_browser/target/youtube.com/0").unwrap();
let i_log = logs
    .iter()
    .enumerate()
    .max_by_key(|(_, LogFile { records, .. })| records.len())
    .map(|(i, _)| i)
    .unwrap();

// Aggregate API calls.
let mut aggregate = RecordAggregate::default();
for entry in &logs[i_log].records {
    let (line, record) = entry.clone();
    if let Err(err) = aggregate.add(line as u32, record) {
        println!("{line}: {err}");
    }
}

let mut ids = aggregate.scripts.keys().copied().collect::<Vec<_>>();
ids.sort_unstable();
for id in &ids {
    let script = &aggregate.scripts[id];
    println!(
        "{id} line#{} source~{}kB used {} APIs {:?} {:?}",
        script.line,
        script.source.len() / 1024,
        script.api_calls.len(),
        script.injection_type,
        script.name,
    );
}

6 line#348 source~0kB used 0 APIs Not Url("https://www.youtube.com/")
7 line#351 source~0kB used 2 APIs Not Url("https://www.youtube.com/")
8 line#355 source~3kB used 6 APIs Not Url("https://www.youtube.com/")
9 line#363 source~0kB used 5 APIs Not Url("https://www.youtube.com/")
10 line#372 source~0kB used 0 APIs Not Url("https://www.youtube.com/")
11 line#374 source~2kB used 14 APIs Not Url("https://www.youtube.com/")
12 line#831 source~37kB used 44 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/spf.vflset/spf.js")
13 line#951 source~14kB used 19 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/network.vflset/network.js")
14 line#1112 source~8466kB used 1147 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/desktop_polymer.vflset/desktop_polymer.js")
15 line#413 source~50kB used 37 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/web-animations-next-lite.min.vflset/web-animations-next-lite.min.js")
16 line#591 source~5kB used 1 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/intersection-observer.min.vflset/intersection-observer.min.js")
17 line#782 source~5kB used 1 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/www-i18n-constants-en_US.vflset/www-i18n-constants.js")
18 line#796 source~11kB used 17 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/www-tampering.vflset/www-tampering.js")
19 line#717 source~9kB used 28 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/scheduler.vflset/scheduler.js")
20 line#467 source~2kB used 8 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/custom-elements-es5-adapter.vflset/custom-elements-es5-adapter.js")
21 line#482 source~77kB used 168 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/webcomponents-sd.vflset/webcomponents-sd.js")
22 line#595 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
23 line#607 source~445kB used 6 APIs Not Url("https://www.youtube.com/")
24 line#705 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
25 line#947 source~0kB used 0 APIs Not Url("https://www.youtube.com/")
26 line#986 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
27 line#998 source~0kB used 3 APIs Not Url("https://www.youtube.com/")
28 line#1009 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
30 line#1021 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
31 line#1036 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
32 line#1048 source~0kB used 2 APIs Not Url("https://www.youtube.com/")
33 line#1054 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
34 line#1066 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
35 line#1078 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
36 line#1090 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
37 line#1101 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
41 line#89054 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
42 line#89187 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
43 line#89498 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
44 line#89581 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
45 line#89653 source~0kB used 4 APIs Not Url("https://www.youtube.com/")
46 line#89728 source~0kB used 14 APIs Not Url("https://www.youtube.com/")
47 line#89775 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
48 line#89858 source~0kB used 0 APIs Not Url("https://www.youtube.com/")
49 line#89863 source~0kB used 1 APIs Not Url("https://www.youtube.com/")
50 line#92474 source~11kB used 5 APIs Injected Empty
55 line#94972 source~0kB used 0 APIs Injected Empty
56 line#94977 source~0kB used 4 APIs Injected Eval { parent_script_id: 50 }
58 line#94996 source~0kB used 4 APIs Injected Eval { parent_script_id: 50 }
61 line#95117 source~227kB used 126 APIs Injected Eval { parent_script_id: 50 }
64 line#95189 source~0kB used 0 APIs Interaction Eval { parent_script_id: 50 }
65 line#260337 source~277kB used 202 APIs Not Url("https://www.youtube.com/s/desktop/72b8c307/jsbin/www-searchbox.vflset/www-searchbox.js")
```

## Selected scripts inspection

`https://www.youtube.com/s/desktop/72b8c307/jsbin/www-tampering.vflset/www-tampering.js`
is part of the [Closure Library](https://github.com/google/closure-library) to
detect if the page is tempered.
The API calls is clearly mainly for **extensional features**,
gathering information from `userAgent` and doing math:

```rust
for (api_call, lines) in &aggregate.scripts[&18].api_calls {
    println!(
        "{}/{} times: {api_call:?}",
        lines.n_may_interact(),
        lines.len()
    );
}

0/2 times: ApiCall { api_type: Get, this: "Window", attr: Some("Symbol") }
0/4 times: ApiCall { api_type: Get, this: "Window", attr: Some("yt") }
0/1 times: ApiCall { api_type: Get, this: "Navigator", attr: Some("userAgentData") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Object") }
0/6 times: ApiCall { api_type: Get, this: "Navigator", attr: Some("userAgent") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("execScript") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("String") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("window") }
0/7 times: ApiCall { api_type: Get, this: "Window", attr: Some("navigator") }
0/1 times: ApiCall { api_type: Function, this: "Navigator", attr: Some("get userAgentData") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("WeakMap") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Array") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Set") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Math") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("ytbin") }
0/1 times: ApiCall { api_type: Set, this: "Window", attr: Some("ytbin") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Map") }
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
    if lines.len() > 1000 {
        println!(
            "{}/{} times: {api_call:?}",
            lines.n_may_interact(),
            lines.len()
        );
    }
}

21747/22409 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("usePatchedLifecycles") }
21740/21792 times: ApiCall { api_type: Function, this: "HTMLDivElement", attr: Some("querySelectorAll") }
10185/10187 times: ApiCall { api_type: Function, this: "DocumentFragment", attr: Some("appendChild") }
2433/2434 times: ApiCall { api_type: Get, this: "Event", attr: Some("type") }
43621/45032 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("tagName") }
7139/7143 times: ApiCall { api_type: Function, this: "HTMLBodyElement", attr: Some("appendChild") }
10185/10226 times: ApiCall { api_type: Get, this: "DocumentFragment", attr: Some("isConnected") }
21754/21780 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("isConnected") }
6303/6449 times: ApiCall { api_type: Get, this: "DocumentFragment", attr: Some("children") }
3786/3803 times: ApiCall { api_type: Function, this: "DocumentFragment", attr: Some("get children") }
2478/2480 times: ApiCall { api_type: Get, this: "Event", attr: Some("pageY") }
7139/7143 times: ApiCall { api_type: Get, this: "HTMLBodyElement", attr: Some("isConnected") }
0/8817 times: ApiCall { api_type: Get, this: "Window", attr: Some("Reflect") }
2478/2480 times: ApiCall { api_type: Get, this: "Event", attr: Some("target") }
2478/2480 times: ApiCall { api_type: Get, this: "Event", attr: Some("pageX") }
2064/2065 times: ApiCall { api_type: Get, this: "Event", attr: Some("keyCode") }
10717/10717 times: ApiCall { api_type: Function, this: "HTMLBodyElement", attr: Some("removeChild") }
```

Interestingly, most of these calls are done after interaction began,
probably during YouTube's navigation-less page switching.
I.e., YouTube does not load a new page when you click a link, but
instead swaps out the content of the current page and changes the URL.

---

The script with context id `23` on line `#607` embedded in
the HTML only sets a large 440kB JSON for various string templates for
the UI (e.g., `Downloading 1 video...`), thus kind of counts as
**DOM element generation**:

```rust
for (api_call, lines) in &aggregate.scripts[&23].api_calls {
    println!(
        "{}/{} times: {api_call:?}",
        lines.n_may_interact(),
        lines.len()
    );
}

0/1 times: ApiCall { api_type: Set, this: "Window", attr: Some("ytcfg") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("innerWidth") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("innerHeight") }
0/1 times: ApiCall { api_type: Set, this: "Window", attr: Some("ytplayer") }
0/2 times: ApiCall { api_type: Get, this: "Window", attr: Some("ytcfg") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("yt") }
```

---

`https://www.youtube.com/s/desktop/72b8c307/jsbin/network.vflset/network.js`
only calls a few APIs, but hits the ones we are interested in for
**frontend processing**, **DOM element generation**, and
**extensional features**.
It seems to contain a portion of [the structured page fragments (SPF)
library](https://youtube.github.io/spfjs/) used for
dynamic content fetching and rendering.

```rust
for (api_call, lines) in &aggregate.scripts[&13].api_calls {
    println!(
        "{}/{} times: {api_call:?}",
        lines.n_may_interact(),
        lines.len()
    );
}

0/2 times: ApiCall { api_type: Function, this: "Window", attr: Some("addEventListener") }
0/2 times: ApiCall { api_type: Get, this: "Window", attr: Some("Symbol") }
0/1 times: ApiCall { api_type: Function, this: "Window", attr: Some("postMessage") }
0/4 times: ApiCall { api_type: Get, this: "Window", attr: Some("removeEventListener") }
0/2 times: ApiCall { api_type: Get, this: "Window", attr: Some("spf") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Array") }
0/2 times: ApiCall { api_type: Get, this: "Window", attr: Some("postMessage") }
0/1 times: ApiCall { api_type: Get, this: "HTMLDivElement", attr: Some("style") }
0/1 times: ApiCall { api_type: Get, this: "HTMLDocument", attr: Some("createElement") }
0/2 times: ApiCall { api_type: Function, this: "Window", attr: Some("removeEventListener") }
0/1 times: ApiCall { api_type: Function, this: "HTMLDocument", attr: Some("createElement") }
0/4 times: ApiCall { api_type: Get, this: "Window", attr: Some("addEventListener") }
0/1 times: ApiCall { api_type: Get, this: "Performance", attr: Some("timing") }
0/1 times: ApiCall { api_type: Function, this: "Performance", attr: Some("get timing") }
0/1 times: ApiCall { api_type: Get, this: "Window", attr: Some("Math") }
0/1 times: ApiCall { api_type: Set, this: "Window", attr: Some("spf") }
0/2 times: ApiCall { api_type: Get, this: "MessageEvent", attr: Some("data") }
0/1 times: ApiCall { api_type: Get, this: "Performance", attr: Some("now") }
0/3 times: ApiCall { api_type: Get, this: "Window", attr: Some("performance") }
```

---

Script with ID `27` on line `#998` only loads fonts (**UX enhancements**).

```rust
for (api_call, lines) in &aggregate.scripts[&27].api_calls {
    println!(
        "{}/{} times: {api_call:?}",
        lines.n_may_interact(),
        lines.len()
    );
}

0/2 times: ApiCall { api_type: Function, this: "FontFaceSet", attr: Some("load") }
0/3 times: ApiCall { api_type: Get, this: "FontFaceSet", attr: Some("load") }
0/4 times: ApiCall { api_type: Get, this: "HTMLDocument", attr: Some("fonts") }

println!("{}", &aggregate.scripts[&27].source);
if (document.fonts && document.fonts.load) {document.fonts.load("400 10pt Roboto", ""); document.fonts.load("500 10pt Roboto", "");}
```
