# JSphere: Classification of The Use of JavaScript on The Web

This project aims to classify the use of JavaScript (JS) on
the web into common functionalities called *spheres*.
Our methods are documented in various markdown files on
the top level this repository, data are posted in Issues and Releases,
the preliminary results are in [the
report](https://github.com/SichangHe/JSphere/releases/download/final-report/jsphere_final_report_11221845.pdf),
and we have [a
poster](https://github.com/SichangHe/JSphere/releases/download/poster-patch1/JSphere-_Classify_Use_of_JS_on_The_Web_Sichang_He.pdf).

In a nutshell, we crawl top websites and collect logs of
API calls per JS script using VisibleV8, then apply heuristics to
classify each script into spheres.
The main problem is that many scripts are large and fall into multiple spheres,
so we rewrite them into scripts containing smaller blocks of `eval` calls
(the `eval` trick).

We have decided to pause this project due to its limited value and
various problems, but if you are interested, feel free to reach out to
@SichangHe.
