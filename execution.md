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
- [ ] Make Playwright and monkey testing work.
    - Mounting: write directly to `headless_browser/target/` on host.
        - Need sysadmin capability & root in Docker to
            run Playwright & create directory, or else spurious error.
    - File management: each site has own directory by
        `encodeURIComponent(url)`, under which;
        - share browser cache in `user_data/`;
        - each (`N` out of 0~4) trial launch separate VV8 and write:
            - `$N/vv8-*.log`
            - `$N.har`
            - `reachable$N.json`
    - [x] ~~Prevent navigation.~~ Go back in browser history immediately when
        navigating.
        - [ ] Browser bug: sometimes go back too much to `about:blank`.
        - [ ] Fewer navigation when headless??
    - [ ] Visit 3 + 9 clicked pages like Snyder did.
- [ ] Analyze API call traces & try heuristics.

Deferred:

- [ ] If top 1000 sites yield poor results, try sampling other sites.
- [ ] Targeted event listener tests instead of chaos testing?
