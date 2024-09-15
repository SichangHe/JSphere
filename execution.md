# Execution

## Crawling

- [x] Test VV8.
    - Docker just works.
    - Log format in `tests/README.md`. Need parser.
        They have `post-processor/` but too specific.
        - [ ] Write log parser library in Rust.
    - [x] Does <https://github.com/wspr-ncsu/visiblev8-crawler> work?
        - Over-engineered.
            Would prefer simpler single script than this monstrosity of SQLite,
            Celery, Mongo, and PostgreSQL.
        - Runs Puppeteer eventually (`crawler.js`).
            ⇒ Let's just use Puppeteer's successor, Playwright.
            - [ ] Figure out Playwright.
    - [ ] Prevent being blocked by USC OIT: Ask John/ add link to
        research description page in `User-Agent`.
- [ ] Analyze API call traces & try heuristics.
- [ ] (future) Talk to Jingyuan for not just random monkey tests?