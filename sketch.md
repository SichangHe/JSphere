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
