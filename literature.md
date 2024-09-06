<!-- toc -->
<!-- markdownlint-disable line-length -->
# Literature around JS Monitoring

## [A Symbolic Execution Framework for JavaScript](https://webblaze.cs.berkeley.edu/2010/kudzu/kudzu.pdf), 2010 S&P

## [An empirical study of privacy-violating information flows in JavaScript web applications](https://dl.acm.org/doi/pdf/10.1145/1866307.1866339), 2010 CCS

## [Modeling the HTML DOM and browser API in static analysis of JavaScript web applications](https://dl.acm.org/doi/pdf/10.1145/2025113.2025125), 2011 ESEC/FSE

## 🤷 [JSFlow: Tracking Information Flow in JavaScript and its APIs](https://www.cse.chalmers.se/~andrei/sac14.pdf), 2014 SAC

run JS in JS. track user data flow, decide if sent

## [Online Tracking: A 1-million-site Measurement and Analysis](https://dl.acm.org/doi/pdf/10.1145/2976749.2978313), 2016 CCS

## ⭐ [Browser Feature Usage on the Modern Web](https://dl.acm.org/doi/pdf/10.1145/2987443.2987466), 2016 IMC

browser add feature but not remove.
browser feature: n:1 map to web standard; found in Firefox WebIDL file.
browser extension for instrumentation and enough 5-round user interaction.
HTML&DOM API most prominent; Beacon for tracking; hardware access, storage.
[dataset: Web API usage in
the Alexa 10k](https://www.cs.uic.edu/~ckanich/datasets/web_api_usage.psql.gz)

## 🙅 [JSgraph: Enabling Reconstruction of Web Attacks via Efficient Tracking of Live In-Browser JavaScript Executions](https://www.researchgate.net/profile/Phani-Vadrevu/publication/323248874_JSgraph_Enabling_Reconstruction_of_Web_Attacks_via_Efficient_Tracking_of_Live_In-Browser_JavaScript_Executions/links/5c8fc4ce45851564fae68400/JSgraph-Enabling-Reconstruction-of-Web-Attacks-via-Efficient-Tracking-of-Live-In-Browser-JavaScript-Executions.pdf), 2018 NDSS

instrument Blink&V8 via hook. record DOM change+navigation.
reconstruct web attack, flowchart viz

## ⭐ [VisibleV8: In-browser Monitoring of JavaScript in the Wild](https://dl.acm.org/doi/pdf/10.1145/3355369.3355599), 2019 IMC

[VisibleV8](https://github.com/wspr-ncsu/visiblev8), maintained, instrument V8.
Tracking JS w/ JS can be spotted.

## [Hiding in Plain Site: Detecting JavaScript Obfuscation through Concealed Browser API Usage](https://dl-acm-org.libproxy2.usc.edu/doi/pdf/10.1145/3419394.3423616), 2020 IMC

## [Jalangi: A Selective Record-Replay and Dynamic Analysis Framework for JavaScript](https://people.eecs.berkeley.edu/~ksen/papers/jalangi.pdf), 2013 ESEC/FSE

## 👎 [UXJs: Tracking and Analyzing Web Usage Information With a Javascript Oriented Approach](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=9020143), 2020 IEEE Access

track user to analyze UX. poorly written.
