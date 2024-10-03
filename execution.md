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
- [ ] Analyze API call traces & try heuristics.
    - [ ] Crawl only 100 first
    - [ ] Separate site load & interaction: split by gremlins injection in
        VV8 log.
    - [ ] Figure out frontend interaction/ DOM element generation API
        classification

Deferred:

- Would like
    - [ ] Separate out the 5 trials.
    - [ ] Save space: compress logs.
    - [ ] Proper logging.
    - [ ] Checkpointing and resuming.
- Just thoughts
    - [ ] If top 1000 sites yield poor results, try sampling other sites.
    - [ ] Targeted event listener tests instead of chaos testing?
