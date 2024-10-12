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

Deferred:

- Would like
    - [ ] Clean up the APIs better.
    - [ ] Separate out the 5 trials.
    - [ ] Save space: compress logs.
    - [ ] Proper logging.
    - [ ] Checkpointing and resuming.
- Just thoughts
    - [ ] If top 1000 sites yield poor results, try sampling other sites.
    - [ ] Targeted event listener tests instead of chaos testing?
