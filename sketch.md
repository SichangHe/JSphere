<!-- toc -->
# Sketch of JSphere the Project

Study why websites use JS.
Specifically, what the JS is for: intention, use, application, etc.
(spheres), that may or may not be replaceable by plain html/css or
moving the functionality to the backend.

Spheres may overlap, producing a Venn diagram.

## Problems

1. Many websites ship way too much JS than needed.
1. Running JS takes too many resources on the client side than needed.

## Hypotheses

- Web developers are kind of stuck with the front-end situation due to
    the lack of alternatives.
- Web developers ship lots of dead JS code (problem 1).
    - Shipping libraries without tree shaking.
    - Shipping the whole app instead of only the necessary parts.
    - ~~Preemptive loading.~~ I don't think so.
- Misalignment between developer intention and actual JS shipped.
- Large amounts of JS is used for bulk transformation of JSON data to
    DOM nodes, a common protocol in SPAs.

## Deeper motivation

I believe front-end JS is overused.
Many websites ship multiple MiB of JS to their clients (e.g.
Facebook), but JS is designed for scripting, not systems.
Current mitigations to this issue is to compile from TS, etc., but
JS is not designed as a compilation target—we introduced WASM for this.

WASM cannot replace JS, but I hope it will in the future.
WASM cannot replace JS because it lacks JS features:

- Browser APIs, including DOM manipulation.
    This renders WASM a mere "number cruncher", and is hard to fix because
    most browser APIs are powerful and complex JS "string functions".
- Be compiled from app languages and remain small (e.g. Elm, Clojure).
    This will be fixed now that we have WasmGC.
- Outstanding tooling. This comes gradually with a big ecosystem.
- Low learning curve and extreme dynamism.
    However, developers can be happy with static languages (e.g.
    Kotlin, Go), though humans have inertia.

To mitigate the first problem, we need to
understand what front-end JS is used for.
Why do websites need JS in the first place?

## JS functionality spheres

- Frontend processing (essential)
    - Form validation, sanitization, and submission
    - UI dynamic interaction
    - Domain-specific logic
- HTML generation (maybe replaceable by SSR)
    - Dynamic content rendering
    - Style application
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
    - Only need to check most used APIs, which [contribute to most API
        calls](literature.html#-browser-feature-usage-on-the-modern-web-2016-imc).

## Survey methods

- Scraping
- Open source codebases
- Public browser extension (but IRB :o)
- Web archives
- ~~Questionnaire for developers~~—social science :(

Implication: only open web, no login.

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

## Anticipated implications

Towards better user experiences online.

- Developer: alert them of common tendencies to
    overuse JS → optimize website.
- Browser vendor: design & recommend to guide developer—teach them to
    utilize backend & HTML/CSS features.
    - Perhaps add features that remove the need for common bloat patterns.
- People who block JS: more educated decisions when blocking.

## Development

Track the evolution of JS usage in websites. Where are we going?
Are we getting more JS unnecessary? Are we on a slope to JS hell?
