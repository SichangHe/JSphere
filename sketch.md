# Sketch of JSphere the Project

Study why websites use JS.
Specifically, what the JS is for: intention, use, application, etc.
(spheres),
that may or may not be replaceable by plain html/css or
moving the functionality to the backend.

Spheres may overlap, producing a Venn diagram.

## Hypothesis

Many websites ship way too much JS,
but they are kind of stuck with the situation due to the lack of alternatives.

## Deeper motivation

I believe front-end JS is overused.
Many websites ship multiple MiB of JS to their clients (e.g.
Facebook), but JS is designed for scripting, not systems.
Current mitigations to this issue is to compile from TS, etc.,
but JS is not designed as a compilation target—we introduced WASM for this.

WASM cannot replace JS, but I hope it will in the future.
WASM cannot replace JS because it lacks JS features:

- Browser APIs, including DOM manipulation.
    This renders WASM a mere "number cruncher",
    and is hard to fix because most browser APIs are powerful and
    complex JS "string functions".
- Be compiled from app languages and remain small (e.g. Elm, Clojure).
    This will be fixed now that we have WasmGC.
- Outstanding tooling. This comes gradually with a big ecosystem.
- Low learning curve and extreme dynamism.
    However, developers can be happy with static languages (e.g.
    Kotlin, Go), though humans have inertia.

To mitigate the first problem,
we need to understand what front-end JS is used for.
Why do websites need JS in the first place?

## JS functionality spheres

- Frontend processing (essential)
    - Form validation, sanitization, and submission
    - UI dynamic interaction
    - Domain-specific logic
- HTML generation (maybe replaceable by SSR)
    - Dynamic content rendering
- UX enhancements (maybe replaceable by CSS)
    - Animations and effects
- Extensional features (bloated and hard to replace)
    - Authentication and authorization (or SSO)
    - Third-party integrations
        - Social media sharing and embedding
        - Payment gateways and APIs
        - Analytics and tracking (Google Analytics/AdSense/tracking)
- Boilerplate (avoidable by writing vanilla compatible JS)
    - Frontend frameworks (React)
    - Browser compatibility workarounds (JQuery, PollyFill)

TODO:

- [ ] Manually check out the JS in a few websites.
- [ ] How to go from browser APIs to intent?

## Survey methods

- Scraping
- Open source codebases
- Public browser extension (but IRB :o)
- Web archives
- ~~Questionnaire for developers~~—social science :(

## Analysis methods

- Static analysis. E.g., concolic execution.
    - Pros: detects dead code.
    - Cons: slow, cannot handle extreme JS dynamism,
        does not reflect real-world usage.
- Script injection. E.g., browser extension, proxy.
    - Pros: easy, mostly compliant, reveals real-world usage, could scale.
    - Cons: some scripts know (evasion), no idea which portions are useful,
        may need IRB.
- Browser modification~~—too much work~~. Presumably VisibleV8.
    - Pros: most compliant, real-world usage.
    - Cons: resource heavy?
- ML. Presumably by fine-tuning LLM.
    - Pros: guesses intention. Reads comments, docs, commit messages.
    - Cons: who labels? Where to get GPUs?

---

Credit:
LLaMa 3.1 generated some of the listing entries (I manually cleaned them).
