# Execution

## Crawling

- [x] Test VV8.
    - Docker just works.
    - Log format in `tests/README.md`. Need parser.
        They have `post-processor/` but too specific.
        - [x] Write log parser library in Rust.
    - [x] Does <https://github.com/wspr-ncsu/visiblev8-crawler> work?
        - Over-engineered.
            Would prefer simpler single script than this monstrosity of SQLite,
            Celery, Mongo, and PostgreSQL.
        - Runs Puppeteer eventually (`crawler.js`).
            ⇒ Let's just use Puppeteer's successor, Playwright.
            - [x] Figure out Playwright.
    - [x] Prevent being blocked by USC OIT: Ask John/ add link to
        research description page in `User-Agent`.
- [x] Make Playwright and monkey testing work.
    - Mounting: write directly to `headless_browser/target/` on host.
        - Need sysadmin capability & root in Docker to
            run Playwright & create directory, or else spurious error.
        - Need `sudo setenforce 0` for Fedora due to SELinux.
    - File management: each site has own directory by
        `encodeURIComponent(url)`, under which;
        - share browser cache in `user_data/`;
        - each (`N` out of 0~4) trial launch separate VV8 and write:
            - `$N/vv8-*.log`
            - `$N.har`
            - `reachable$N.json`
    - Disable content security policy (CSP) for `eval`.
    - [x] ~~Prevent navigation.~~ Go back in browser history immediately when
        navigating.
        - [x] ~~Browser bug: sometimes go back too much to
            `about:blank`.~~ Detect if page has horde on `load` event, and
            reload if not.
        - ~~[ ] Fewer navigation when headless??~~
        - Some sites (e.g., YouTube) change URL w/o navigation;
            cannot do anything about them.
    - [x] Visit 3 + 9 clicked pages like Snyder did.
    - [x] Some secondary URLs' host name vary by `www.` prefix, e.g.,
        google.com.
    - Split out each visit to separate browser page, so that
        each VV8 log can be split by when gremlins is injected into "loading"
        vs "interacting".
    - [x] Save space: remove `user_data/` after all trials.
    - [x] Crawl only 100 first

## Analyze API call traces

- [x] Separate site load & interaction
    - [x] Make single gremlins injection split each VV8 log into a part w/o
        interaction and a part w/ interaction: separate browser page for
        each load.
    - [x] When aggregating record, split by gremlins injection in VV8 log.
- [x] Find anchor APIs, the most popular APIs overall and per script.
    - Filter out most internal, user-defined, and injected calls.
    - Analysis of API popularity in `popular_api_calls_analysis.md`.
        - Tail-heavy distribution: It takes 1.75% (318) APIs to cover 80% of
            all API calls, and 3.74% (678.0) APIs to cover 90%.
            ![api_calls_cdf](https://github.com/user-attachments/assets/33d37479-a446-4ecc-b7b2-a7da703f3630)
        - Many calls before interaction begin.
        - DOM & event APIs dominate absolute counts.
        - Popularity per script is useless.
        - APIs called out in the proposal are somewhat popular.
    - Pick manually among 678 APIs that make up 90% of calls, details in
        `notable_apis.md`.
- [ ] Figure out frontend interaction/ DOM element generation API
    classification
    - `HTMLDocument.createElement`
        before interaction is clearly **DOM element generation**.
    - Various `addEventListener` calls are **frontend processing**.
    - More potential heuristics in `notable_apis.md`.
    - [ ] We only somewhat know what spheres a script belongs to, but
        how do we know it does not belong to another sphere?
        - We can probably only claim we detect which sphere.
- [ ] Split script to fine-grained!!
    - [ ] `eval` per ~~function~~ chunk of code.
        - [ ] Need to `eval` each function before calling it.

### Log file interpretation

VV8 creates a log file per thread, roughly equivalent to
a browser page we create plus some junk background workers.
Each of `$N/vv8-*.log` contains:

- Before gremlins injection:
    - JS contexts created & their source code.
    - API calls in each context.
        - Guaranteed not for interactions.
- After gremlins injection:
    - All of the above, but may be for interactions.

### Observations when manually inspecting aggregated logs for YouTube

Details in `youtube_scripts_api_calls_overview.md`.

- Strong indicators: popular APIs like `addEventListener` and `appendChild`
    strongly indicate specific spheres.
- API pollution: ~~getting and setting custom attributes on `window`, etc.
    are recorded, but they are not browser APIs.~~
    `Function`s generally seem more useful because we can and
    do filter out user-defined ones.
    - Largely dealt with by filtering by API names (alphanumeric or space,
        at least 3 characters for `this`, 2 characters for `attr`,
        at most 3 consecutive number).
- Useless information: ~~getting and setting from `window`, calling `Array`,
    etc. generally means nothing.
    API types (function, get, etc.) also seem useless once we consider `this`
    and `attr`.~~
    - Just track anchor APIs and pick Function over Get for anchor APIs.
- Difficult scripts: some scripts only call a few APIs, so
    they are difficult to classify.
    - [ ] Do we care about every script or just big ones or just ones that
        call many APIs?
    - [ ] Many scripts are in the HTML, so how to
        aggregate their stats over the 5 trials?
- [ ] Aggregate multiple runs of same scripts.

### Classification heuristics

By manually inspecting the 678 most popular APIs that make up 90% of
all API calls in the top 100 sites, we spot "anchor" APIs (list in
`notable_apis.md`).

#### Certain indicators

- **Frontend processing**
    - Get `.*Event`, `Location` (some attributes),
        `HTML(Input|TextArea)Element.(value|checked)`
    - Function `addEventListener`, `getBoundingClientRect`
    - Set `textContent` and anything on `URLSearchParams`, `DOMRect`,
        `DOMRectReadOnly`
- **DOM element generation**, before interaction begins
    - Function `createElement`, `createElementNS`, `createTextNode`,
        `appendChild`, `insertBefore`, `CSSStyleDeclaration.setProperty`
    - Set `CSSStyleDeclaration`, `style`
- **UX enhancement**
    - Function `removeAttribute`, `matchMedia`, `removeChild`,
        `requestAnimationFrame`, `cancelAnimationFrame`, `FontFaceSet.load`,
        `MediaQueryList.matches`
    - Set `hidden`, `disabled`
- **Extensional features**
    - `Performance`, `PerformanceTiming`, `PerformanceResourceTiming`,
        `Navigator.sendBeacon`

#### Intermediate indicators

- `XMLHttpRequest` (and `Window.fetch`): send/fetch data from server, one of:
    - Form submission, CRUD → **frontend processing**.
    - Auth, tracking, telemetry → **extensional features**.
    - Load data onto page → **DOM element generation**
        (but will be detected through other API calls)?
- `SVGGraphicsElement` subclasses and canvas elements: graphics for
    **UX enhancement**, but you can render them and send SVG, so
    maybe **DOM element generation**?
- `CSSStyleRule`, `CSSRuleList`: **UX enhancement** or
    **DOM element generation**.
- `Window.scrollY`: **UX enhancement** or **frontend processing**.

#### Uncertain indicators

- `querySelector[All]`, `getElement[s]By.*`: get a node, but then what?
- `.*Element`'s `contains`, `matches`: search for a node or string, but then
    what?
- `Storage`, `HTMLDocument.cookie`: local storage, but then what?
- `DOMTokenList`: store/retrieve info on node, but then what?
- `IntersectionObserverEntry`: viewport and visibility, but then what?
- `ShadowRoot`: web components, but then what?
- `Crypto.getRandomValues`
- `frames`: iframes

#### Classification results

Of the 40116 scripts we analyzed (3192.7MB, details in `script_features.py`):

- Size: 9B~8.7MB, average 80kB, median 2.2kB.
    - Many small scripts.
- No significant correlation between anything.
- Coverage: 67% classified by count, 93% by size.
- Coverage growth potential: 7% by count, 1% by size.
- Half (1296.1MB, 40.60%) scripts by size fall into all sure categories.
    Count 1473 (3.67%).
    - [ ] Look for bloated sites.
    - [ ] What next if we can split it up?
        - [ ] What user impact from size? Aggregate per page?
        - [ ] Chrome execution time of script.

| Feature                | Count | Percentage (%) | Size (MB) | Size Percentage (%) |
| ---------------------- | ----- | -------------- | --------- | ------------------- |
| Total Scripts          | 40116 | -              | 3192.7    | -                   |
| Frontend Processing    | 14129 | 35.22          | 2864.3    | 89.72               |
| DOM Element Generation | 8196  | 20.43          | 2248.9    | 70.44               |
| UX Enhancement         | 4496  | 11.21          | 1840.7    | 57.65               |
| Extensional Features   | 4915  | 12.25          | 1888.1    | 59.14               |
| Silent Scripts         | 10260 | 25.58          | 28.1      | 0.88                |
| Has Request            | 4205  | 10.48          | 1432.1    | 44.86               |
| Queries Element        | 13640 | 34.00          | 2731.6    | 85.56               |
| Uses Storage           | 4571  | 11.39          | 1641.0    | 51.40               |
| No Sure Category       | 13148 | 32.77          | 221.1     | 6.93                |
| No Category            | 10178 | 25.37          | 179.7     | 5.63                |

| Feature Combination        | Frontend Processing              | DOM Element Generation           | UX Enhancement                  | Extensional Features            | Has Request                     | Queries Element                 |
| -------------------------- | -------------------------------- | -------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- |
| **DOM Element Generation** | 6602 (16.46%), 2197.1MB (68.82%) | -                                | -                               | -                               | -                               | -                               |
| **UX Enhancement**         | 3840 (9.57%), 1821.5MB (57.05%)  | 3125 (7.79%), 1613.2MB (50.53%)  | -                               | -                               | -                               | -                               |
| **Extensional Features**   | 4229 (10.54%), 1841.1MB (57.67%) | 2703 (6.74%), 1562.9MB (48.95%)  | 1844 (4.60%), 1440.5MB (45.12%) | -                               | -                               | -                               |
| **Has Request**            | 3981 (9.92%), 1428.9MB (44.76%)  | 2338 (5.83%), 1192.9MB (37.36%)  | 1459 (3.64%), 1162.6MB (36.42%) | 1755 (4.37%), 1226.1MB (38.40%) | -                               | -                               |
| **Queries Element**        | 9379 (23.38%), 2648.1MB (82.94%) | 6846 (17.07%), 2152.1MB (67.41%) | 3754 (9.36%), 1773.7MB (55.55%) | 3508 (8.74%), 1800.3MB (56.39%) | 3627 (9.04%), 1410.1MB (44.17%) | -                               |
| **Uses Storage**           | 4335 (10.81%), 1633.2MB (51.15%) | 2728 (6.80%), 1362.7MB (42.68%)  | 1669 (4.16%), 1278.9MB (40.06%) | 2093 (5.22%), 1372.2MB (42.98%) | 2424 (6.04%), 1106.1MB (34.64%) | 3722 (9.28%), 1596.9MB (50.02%) |

| Feature Combination                                                     | Scripts Count (%) | Size (MB) (%)     |
| ----------------------------------------------------------------------- | ----------------- | ----------------- |
| **Frontend Processing & DOM Element Generation & UX Enhancement**       | 2813 (7.01%)      | 1604.9MB (50.27%) |
| **Frontend Processing & DOM Element Generation & Extensional Features** | 2679 (6.68%)      | 1533.0MB (48.02%) |
| **Frontend Processing & UX Enhancement & Extensional Features**         | 1814 (4.52%)      | 1439.2MB (45.08%) |
| **DOM Element Generation & UX Enhancement & Extensional Features**      | 1482 (3.69%)      | 1296.6MB (40.61%) |

![script_size_cdf](https://github.com/user-attachments/assets/193b415e-6209-4506-81fd-6f70972b458d)

## Deferred

- Would like
    - [ ] Clean up the APIs better.
    - [ ] Separate out the 5 trials.
    - [ ] Save space: compress logs.
    - [ ] Proper logging.
    - [ ] Checkpointing and resuming.
- Just thoughts
    - [ ] If top 1000 sites yield poor results, try sampling other sites.
    - [ ] Targeted event listener tests instead of chaos testing?
