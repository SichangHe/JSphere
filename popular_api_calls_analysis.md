# Analysis of popular API calls

We aggregated data for all API calls, filtering out user-defined functions and
other irrelevant data as possible.
Results are in `data/api_calls.csv` and analyzed in
`data/src/data/api_calls.py`.

## Top 20 API calls overall

As a rough look, we sample the top 20 API calls based on various metrics.

The most called APIs are mainly "get" calls, with some user-defined attributes,
mainly on `HTMLDivElement`.
The results are similar for calls made after interaction began.

```py
In [24]: df.nlargest(20, "total")
Out[24]: 
       api_type                   this           attr    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
26694       Get         HTMLDivElement     parentNode  6542023   2806085      6.219673           12.520053          2.945303             1.245215
4788        Get         HTMLDivElement       nodeType  4208131   1050378      4.605137            7.165469          2.788557             3.360017
13760       Get        HTMLBodyElement     parentNode  3365475   2107266      4.133318           11.224660          1.357662             0.929915
48257  Function                   None       Function  2912341       747     61.614170            0.156155         29.132014             0.021444
11868       Get         HTMLDivElement        __owner  2491667    486742      7.122473            7.859507          6.570782             4.636055
19745       Get               NodeList         length  2382138    167222      2.458055            1.060953          3.704557             0.996694
95033       Get         HTMLDivElement   getAttribute  2048964    440201      2.359711            2.995582          2.855642             1.782295
44786       Get         HTMLDivElement     __jsaction  1961896    207309      5.606078            3.347454          4.475442             2.287779
37363       Get         HTMLDivElement       nodeName  1931993    305962      2.498403            2.537072          3.737286             4.616336
73460       Get         HTMLDivElement   hasAttribute  1766442    746089      3.032816            8.148969          1.838189             1.093399
83193       Get         MutationRecord     addedNodes  1509702    732539      5.048068            8.530620          6.939412             8.448572
63566       Get         HTMLDivElement       contains  1143362     82780      2.266544            0.591240          2.065024             0.256106
60384       Get         MutationRecord           type  1130505    659618      4.067085            8.012173          2.766104             2.508596
81542       Get         HTMLDivElement  parentElement  1119639    455358      1.553652            4.107986          2.821523             2.204144
69462  Function         HTMLDivElement   getAttribute  1117674    254111      1.287087            1.728813          2.311908             1.434719
62754  Function         HTMLDivElement        matches  1115182     34157      4.411318            0.842997          2.225324             0.280521
78066       Get            Performance            now  1071387    110762      1.338734            0.857321          3.854682             2.131188
30963       Get         HTMLDivElement        tagName  1063408    127092      1.303597            0.897831          2.720381             0.951908
33111       Get         HTMLDivElement        matches  1061215     50555      5.584179            1.442774          2.112547             0.295517
48855       Get  CustomElementRegistry            get  1051466     38988      9.605048            5.390160          4.303612             1.430453

In [25]: df.nlargest(20, "interact")
Out[25]: 
       api_type             this              attr    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
26694       Get   HTMLDivElement        parentNode  6542023   2806085      6.219673           12.520053          2.945303             1.245215
13760       Get  HTMLBodyElement        parentNode  3365475   2107266      4.133318           11.224660          1.357662             0.929915
4788        Get   HTMLDivElement          nodeType  4208131   1050378      4.605137            7.165469          2.788557             3.360017
73460       Get   HTMLDivElement      hasAttribute  1766442    746089      3.032816            8.148969          1.838189             1.093399
83193       Get   MutationRecord        addedNodes  1509702    732539      5.048068            8.530620          6.939412             8.448572
60384       Get   MutationRecord              type  1130505    659618      4.067085            8.012173          2.766104             2.508596
85184       Get   MutationRecord      removedNodes   947656    645032      5.246074            8.462904          5.534707             4.886275
11868       Get   HTMLDivElement           __owner  2491667    486742      7.122473            7.859507          6.570782             4.636055
81542       Get   HTMLDivElement     parentElement  1119639    455358      1.553652            4.107986          2.821523             2.204144
95033       Get   HTMLDivElement      getAttribute  2048964    440201      2.359711            2.995582          2.855642             1.782295
85259       Get   HTMLDivElement           closest   542551    417610      1.870400            4.721778          2.734735             0.423078
48490  Function   HTMLDivElement           closest   415799    351749      1.433433            3.977109          2.627362             0.392175
37363       Get   HTMLDivElement          nodeName  1931993    305962      2.498403            2.537072          3.737286             4.616336
69462  Function   HTMLDivElement      getAttribute  1117674    254111      1.287087            1.728813          2.311908             1.434719
44786       Get   HTMLDivElement        __jsaction  1961896    207309      5.606078            3.347454          4.475442             2.287779
56482       Get           Window          location   579071    207004      0.577491            0.960007          5.740022             2.314725
72177  Function   HTMLDivElement      hasAttribute   596653    178208      1.024690            1.946432          2.036070             0.543254
19745       Get         NodeList            length  2382138    167222      2.458055            1.060953          3.704557             0.996694
98618       Get   HTMLDivElement  querySelectorAll   705226    140848      0.860799            0.780235          1.977292             0.570085
30963       Get   HTMLDivElement           tagName  1063408    127092      1.303597            0.897831          2.720381             0.951908
```

From the difference between `total` and `interact`,
we can already see a large number of
DOM queries are done even before any interaction, during page load.

Unfortunately, the top 20s for `%total/total`, `%interact/interact`,
`avg%total/script` and `avg%interact/script` are mostly user-defined junk.
This only shows the custom attributes are highly popular within the scripts
that use them.

## Top 20 API function calls

Since "get" calls do not usually create side effects, we focus on
function calls.

The most popular function calls overall matches our expectations,
mainly focusing on querying and interacting with the DOM.

```py
In [30]: df[df["api_type"] == "Function"].nlargest(20, "total")
Out[30]: 
       api_type                   this              attr    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
48257  Function                   None          Function  2912341       747     61.614170            0.156155         29.132014             0.021444
69462  Function         HTMLDivElement      getAttribute  1117674    254111      1.287087            1.728813          2.311908             1.434719
62754  Function         HTMLDivElement           matches  1115182     34157      4.411318            0.842997          2.225324             0.280521
78250  Function         HTMLDivElement     querySelector   847881     20059      1.214075            0.128487          2.005228             1.309557
21429  Function  CustomElementRegistry               get   828723     21868     11.336468            9.885048          5.451146             1.479581
55425  Function                 Window        setTimeout   774630     46855      0.744934            0.210826          3.143546             2.137113
11720  Function            Performance               now   624855     79418      0.793207            0.618754          3.229281             1.852086
72177  Function         HTMLDivElement      hasAttribute   596653    178208      1.024690            1.946432          2.036070             0.543254
41049  Function         HTMLDivElement  querySelectorAll   574049    117992      0.671127            0.636097          1.625158             0.467564
48490  Function         HTMLDivElement           closest   415799    351749      1.433433            3.977109          2.627362             0.392175
9643   Function      HTMLAnchorElement      getAttribute   353941     69323      0.399908            0.339684          1.651651             0.553678
81654  Function         HTMLDivElement          contains   303535     48157      0.601713            0.343952          1.473645             0.222576
20115  Function           HTMLDocument     createElement   286107     63007      0.249134            0.269950          2.440958             0.531660
27235  Function         HTMLDivElement  addEventListener   252068     35763      0.321476            0.291309          2.321366             0.246075
61526  Function           HTMLDocument  querySelectorAll   223991     18113      0.279736            0.133024          1.416979             0.423509
86089  Function           DOMTokenList          contains   210971     48545      0.349773            0.428830          2.194216             0.851903
66430  Function                   Text          contains   187765      5459      1.569764            0.077603          1.265214             0.314514
48897  Function      HTMLScriptElement      getAttribute   151950     23843      0.309875            0.280908          5.402781             0.451105
88204  Function             TreeWalker          nextNode   144231     70710      1.196873            8.265400          3.927690             2.409134
7170   Function                 Window  getComputedStyle   143326     41359      0.247767            0.374949          1.778287             2.294617

In [31]: df[df["api_type"] == "Function"].nlargest(20, "interact")
Out[31]: 
       api_type               this              attr    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
48490  Function     HTMLDivElement           closest   415799    351749      1.433433            3.977109          2.627362             0.392175
69462  Function     HTMLDivElement      getAttribute  1117674    254111      1.287087            1.728813          2.311908             1.434719
72177  Function     HTMLDivElement      hasAttribute   596653    178208      1.024690            1.946432          2.036070             0.543254
41049  Function     HTMLDivElement  querySelectorAll   574049    117992      0.671127            0.636097          1.625158             0.467564
11720  Function        Performance               now   624855     79418      0.793207            0.618754          3.229281             1.852086
88204  Function         TreeWalker          nextNode   144231     70710      1.196873            8.265400          3.927690             2.409134
9643   Function  HTMLAnchorElement      getAttribute   353941     69323      0.399908            0.339684          1.651651             0.553678
20115  Function       HTMLDocument     createElement   286107     63007      0.249134            0.269950          2.440958             0.531660
86089  Function       DOMTokenList          contains   210971     48545      0.349773            0.428830          2.194216             0.851903
81654  Function     HTMLDivElement          contains   303535     48157      0.601713            0.343952          1.473645             0.222576
55425  Function             Window        setTimeout   774630     46855      0.744934            0.210826          3.143546             2.137113
7170   Function             Window  getComputedStyle   143326     41359      0.247767            0.374949          1.778287             2.294617
35708  Function        HTMLElement      getAttribute   117772     36137      0.174705            0.316203          0.859922             0.444117
27235  Function     HTMLDivElement  addEventListener   252068     35763      0.321476            0.291309          2.321366             0.246075
62754  Function     HTMLDivElement           matches  1115182     34157      4.411318            0.842997          2.225324             0.280521
31383  Function       HTMLDocument     querySelector   109894     25620      0.124668            0.136236          5.328826             2.042434
66937  Function   HTMLImageElement      getAttribute    87158     24930      0.144092            0.220834          3.382223             0.397960
34868  Function     HTMLDivElement      setAttribute   124080     24252      0.162503            0.184537          0.726270             1.184591
48897  Function  HTMLScriptElement      getAttribute   151950     23843      0.309875            0.280908          5.402781             0.451105
91741  Function    HTMLHtmlElement          contains    48804     23510      0.116214            0.283085          0.308642             0.232448
```

<details>
<summary>
The top 20 function calls on the other 4 metrics are also less intuitive,
mostly internal or user-defined function, workers, canvas, etc.
</summary>

```py
In [32]: df[df["api_type"] == "Function"].nlargest(20, "%total/total")
Out[32]: 
       api_type                                             this                 attr    total  ...  %total/total  %interact/interact  avg%total/script  avg%interact/script
3429   Function                       DedicatedWorkerGlobalScope        importScripts       15  ...    100.000000                 NaN        100.000000             0.000000
48088  Function                                           Object                query        7  ...    100.000000                 NaN        100.000000             0.000000
42331  Function                       KeyboardLayoutMap Iterator                 next       50  ...     94.339623                 NaN         94.339623             0.000000
48257  Function                                             None             Function  2912341  ...     61.614170            0.156155         29.132014             0.021444
46147  Function                                        Navigator  joinAdInterestGroup       80  ...     25.559105                 NaN         33.441558             0.000000
17226  Function                                  HTMLLinkElement   insertAdjacentHTML       29  ...     16.666667                 NaN         16.666667             0.000000
20717  Function                                      FontFaceSet                  add       18  ...     16.666667                 NaN         16.666667             0.000000
50961  Function                                         FontFace                 load       18  ...     16.666667                 NaN         16.666667             0.000000
31545  Function                                           Window                close        7  ...     14.285714                 NaN         14.285714             0.000000
95966  Function                                  HTMLBodyElement          get dataset       11  ...     14.285714                 NaN         14.285714             0.000000
81085  Function                                   HTMLDivElement          isEqualNode      350  ...     14.204545           19.301471         10.270032             4.825368
70404  Function                                     HTMLDocument             evaluate      790  ...     14.039453            0.000000         14.260404             0.000000
85846  Function                                                f               append       48  ...     12.182741                 NaN         12.182741             0.000000
21429  Function                            CustomElementRegistry                  get   828723  ...     11.336468            9.885048          5.451146             1.479581
98497  Function                                           Window                 find      290  ...     10.254597           20.000000         10.254597            20.000000
35689  Function                       DedicatedWorkerGlobalScope                 btoa        5  ...     10.000000                 NaN         10.000000             0.000000
46338  Function                                     DOMException             get name        5  ...      9.433962                 NaN          9.318182             0.000000
38283  Function                       DedicatedWorkerGlobalScope          postMessage      998  ...      8.820150                 NaN         14.121302             0.000000
34602  Function  include_fragment_element_IncludeFragmentElement         setAttribute       14  ...      8.536585                 NaN          8.523810             0.000000
11497  Function                                                n         getAttribute     1280  ...      8.519135                 NaN          8.182095             0.000000

[20 rows x 9 columns]

In [33]: df[df["api_type"] == "Function"].nlargest(20, "%interact/interact")
Out[33]: 
       api_type                                             this                 attr   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
98497  Function                                           Window                 find     290        24     10.254597           20.000000         10.254597            20.000000
81085  Function                                   HTMLDivElement          isEqualNode     350       105     14.204545           19.301471         10.270032             4.825368
81595  Function                                        Scheduler                yield     287        84      0.387064           15.879017          1.700802             5.510089
20567  Function                         CanvasRenderingContext2D         putImageData    1378       228      0.599055           12.917847          7.577342            10.520555
21429  Function                            CustomElementRegistry                  get  828723     21868     11.336468            9.885048          5.451146             1.479581
4856   Function                         CanvasRenderingContext2D              restore    4700       448      7.363770            9.065156          8.107130             9.005271
66370  Function                         CanvasRenderingContext2D                 save    4700       448      7.363770            9.065156          8.107130             9.005271
82731  Function                         CanvasRenderingContext2D            transform    2561       432      4.012471            8.741400          5.646498             8.683654
93350  Function                                   IDBTransaction  removeEventListener     702        72      0.578316            8.612440          3.134207             2.701273
88204  Function                                       TreeWalker             nextNode  144231     70710      1.196873            8.265400          3.927690             2.409134
6739   Function  include_fragment_element_IncludeFragmentElement     addEventListener      76        10      7.584830            7.874016          7.629141             8.648221
78190  Function                                   ToolTipElement         getAttribute     453       100      3.786043            6.680027          3.783992             7.061765
41984  Function                                MediaCapabilities         decodingInfo     132       113      1.396678            6.457143          1.705877             3.228571
667    Function                                               aH         getAttribute     118       109      0.376384            6.374269          2.210483            18.537415
8666   Function                                  CardSkewElement     addEventListener     108        18      5.908096            5.825243          6.144672             1.374046
3430   Function                                  HTMLMetaElement          isEqualNode    6450      1088      0.383744            5.582636          1.627669             0.467492
89090  Function  include_fragment_element_IncludeFragmentElement         getAttribute     160        10      5.974608            5.000000          7.149585             3.400000
3233   Function                                   HTMLDivElement       get shadowRoot   10068      8718      2.666130            4.213487          2.661660             4.224821
32995  Function                         TrustedTypePolicyFactory     getAttributeType     712        68      3.744019            4.023669          3.745754             0.670611
48490  Function                                   HTMLDivElement              closest  415799    351749      1.433433            3.977109          2.627362             0.392175

In [34]: df[df["api_type"] == "Function"].nlargest(20, "avg%total/script")
Out[34]: 
       api_type                          this                 attr    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
3429   Function    DedicatedWorkerGlobalScope        importScripts       15         0    100.000000                 NaN        100.000000             0.000000
48088  Function                        Object                query        7         0    100.000000                 NaN        100.000000             0.000000
42331  Function    KeyboardLayoutMap Iterator                 next       50         0     94.339623                 NaN         94.339623             0.000000
46147  Function                     Navigator  joinAdInterestGroup       80         0     25.559105                 NaN         33.441558             0.000000
48559  Function                       History                 back     1157         0      0.713167            0.000000         33.303835             0.000000
48257  Function                          None             Function  2912341       747     61.614170            0.156155         29.132014             0.021444
42260  Function                   FontFaceSet                 load      735         0      0.367436            0.000000         21.932160             0.000000
30829  Function                          None                 eval     8444      1024      0.260268            0.276483         19.558789             0.404281
53002  Function      ServiceWorkerGlobalScope                fetch     4307         0      3.147656                 NaN         19.211719             0.000000
48639  Function      ServiceWorkerGlobalScope        importScripts       36         0      0.944386                 NaN         18.684029             0.000000
7180   Function                         Image         setAttribute      628       234      0.086498            0.475243         17.581526             0.033161
17226  Function               HTMLLinkElement   insertAdjacentHTML       29         0     16.666667                 NaN         16.666667             0.000000
20717  Function                   FontFaceSet                  add       18         0     16.666667                 NaN         16.666667             0.000000
50961  Function                      FontFace                 load       18         0     16.666667                 NaN         16.666667             0.000000
50123  Function  PerformanceObserverEntryList     getEntriesByType     3650       463      4.724246            3.102178         15.325988             9.749440
56090  Function               HTMLBodyElement       getClientRects       12         0      6.666667                 NaN         14.423077             0.000000
31545  Function                        Window                close        7         0     14.285714                 NaN         14.285714             0.000000
95966  Function               HTMLBodyElement          get dataset       11         0     14.285714                 NaN         14.285714             0.000000
70404  Function                  HTMLDocument             evaluate      790         0     14.039453            0.000000         14.260404             0.000000
38283  Function    DedicatedWorkerGlobalScope          postMessage      998         0      8.820150                 NaN         14.121302             0.000000

In [35]: df[df["api_type"] == "Function"].nlargest(20, "avg%interact/script")
Out[35]: 
       api_type                                             this                   attr  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
98497  Function                                           Window                   find    290        24     10.254597           20.000000         10.254597            20.000000
667    Function                                               aH           getAttribute    118       109      0.376384            6.374269          2.210483            18.537415
20567  Function                         CanvasRenderingContext2D           putImageData   1378       228      0.599055           12.917847          7.577342            10.520555
50123  Function                     PerformanceObserverEntryList       getEntriesByType   3650       463      4.724246            3.102178         15.325988             9.749440
4856   Function                         CanvasRenderingContext2D                restore   4700       448      7.363770            9.065156          8.107130             9.005271
66370  Function                         CanvasRenderingContext2D                   save   4700       448      7.363770            9.065156          8.107130             9.005271
82731  Function                         CanvasRenderingContext2D              transform   2561       432      4.012471            8.741400          5.646498             8.683654
6739   Function  include_fragment_element_IncludeFragmentElement       addEventListener     76        10      7.584830            7.874016          7.629141             8.648221
4047   Function                     PerformanceObserverEntryList             getEntries  17875      6222      0.043069            0.074542          4.519418             7.576445
78190  Function                                   ToolTipElement           getAttribute    453       100      3.786043            6.680027          3.783992             7.061765
28385  Function                              ReactPartialElement           getAttribute    154        38      0.865023            1.551654          5.664087             5.874171
81595  Function                                        Scheduler                  yield    287        84      0.387064           15.879017          1.700802             5.510089
56967  Function                                           Window        structuredClone    786       182      0.035290            0.072627          3.377635             5.246563
81085  Function                                   HTMLDivElement            isEqualNode    350       105     14.204545           19.301471         10.270032             4.825368
57598  Function                           WebGL2RenderingContext       getActiveUniform    480       440      0.043109            0.210678          0.043988             4.359075
3233   Function                                   HTMLDivElement         get shadowRoot  10068      8718      2.666130            4.213487          2.661660             4.224821
9089   Function                                           Window  requestAnimationFrame  42244      9303      0.080122            0.098018          1.780464             3.936577
32558  Function                                     HTMLDocument            get baseURI  10091      7878      3.361000            3.878877          3.125347             3.714752
79777  Function                                HTMLScriptElement          querySelector  11506      6766      0.200325            3.614374          0.205220             3.596787
2221   Function                                       ShadowRoot                 append     38         5      1.511535            2.500000          1.513443             3.400000
```

</details>

## Top 20 API Set calls

There are some interesting popular "set" calls as well,
despite the many internal functions.

```py
In [36]: df[df["api_type"] == "Set"].nlargest(20, "total")
Out[36]: 
      api_type                 this                    attr   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
64966      Set       HTMLDivElement              __jsaction  345693     30728      0.993148            0.496170          0.757833             0.410322
19408      Set               Window         google_tag_data  147868     23607      2.631992            7.305005          6.195680             2.746880
60294      Set                Event                    flow   72147     14974      0.206194            0.241850          0.240960             0.185889
56136      Set    HTMLAnchorElement                    href   43452      8967      0.066575            0.094568          0.551138             0.205519
1376       Set               Window              __SENTRY__   38014     30453      0.837328            1.712612          4.220709             1.207953
7933       Set                 Text             textContent   37094      1427      0.618528            0.198983          0.553211             0.380464
29909      Set  CSSStyleDeclaration                 display   29629      4249      0.047408            0.033291          1.846784             0.241016
20519      Set      HTMLSpanElement             textContent   29552      5143      0.216936            0.155923          1.338846             0.032910
7343       Set  CSSStyleDeclaration                  height   29251      2610      0.055663            0.023997          0.264178             0.033442
38449      Set         HTMLDocument                  cookie   25002      4779      0.046180            0.044618          4.965452             0.452771
72595      Set               Window  __post_robot_10_0_46__   21954      1800     19.033500           48.283262         18.074851             3.543726
87159      Set     HTMLImageElement                  onload   21372      8806      0.317607            1.250628          0.729805             0.497930
41851      Set  CSSStyleDeclaration                position   21109      1992      0.042567            0.019581          0.471537             0.268283
88463      Set  CSSStyleDeclaration                    left   20098      2010      0.062440            0.027695          0.896591             0.792972
4705       Set  CSSStyleDeclaration                   width   19640      4291      0.053737            0.060370          1.396492             0.470753
35751      Set  CSSStyleDeclaration              fontFamily   16992         0      0.129966            0.000000          4.373444             0.000000
13158      Set  CSSStyleDeclaration               transform   16935      1073      0.071959            0.014526          0.797609             0.138349
19122      Set       HTMLDivElement               innerHTML   16250      1110      0.030477            0.010206          0.915486             0.072562
51967      Set       HTMLDivElement               className   15672       551      0.068671            0.020551          1.471706             0.167497
45025      Set                Event      isDefaultPrevented   15620         3      0.328566            0.004007          0.205655             0.000877

In [37]: df[df["api_type"] == "Set"].nlargest(20, "interact")
Out[37]: 
      api_type                 this                  attr   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script
64966      Set       HTMLDivElement            __jsaction  345693     30728      0.993148            0.496170          0.757833             0.410322
1376       Set               Window            __SENTRY__   38014     30453      0.837328            1.712612          4.220709             1.207953
19408      Set               Window       google_tag_data  147868     23607      2.631992            7.305005          6.195680             2.746880
60294      Set                Event                  flow   72147     14974      0.206194            0.241850          0.240960             0.185889
67047      Set       HTMLDivElement  __incrementalDOMData   14877     11986      0.434026            1.121772          0.696226             1.183086
56136      Set    HTMLAnchorElement                  href   43452      8967      0.066575            0.094568          0.551138             0.205519
87159      Set     HTMLImageElement                onload   21372      8806      0.317607            1.250628          0.729805             0.497930
93676      Set      HTMLSpanElement  __incrementalDOMData    8222      6986      0.239871            0.653821          0.321602             0.450758
86583      Set      HTMLSpanElement            __jsaction    8630      5379      0.025109            0.087321          0.038907             0.071581
65864      Set                 Text  __incrementalDOMData    6528      5307      0.190450            0.496683          0.261814             0.364662
20519      Set      HTMLSpanElement           textContent   29552      5143      0.216936            0.155923          1.338846             0.032910
38449      Set         HTMLDocument                cookie   25002      4779      0.046180            0.044618          4.965452             0.452771
35354      Set    HTMLAnchorElement               onclick   13304      4674      0.093462            0.130412          0.095512             0.064153
4705       Set  CSSStyleDeclaration                 width   19640      4291      0.053737            0.060370          1.396492             0.470753
29909      Set  CSSStyleDeclaration               display   29629      4249      0.047408            0.033291          1.846784             0.241016
11919      Set       HTMLDivElement                 __wiz    7567      3813      0.022047            0.061999          0.036430             0.051660
51999      Set      HTMLSpanElement             innerHTML   13127      3097      0.048104            0.036853          2.537111             0.395774
62328      Set       HTMLDivElement        __jscontroller    6013      2676      0.017185            0.043221          0.032613             0.018291
7343       Set  CSSStyleDeclaration                height   29251      2610      0.055663            0.023997          0.264178             0.033442
87930      Set    HTMLAnchorElement            __jsaction    3891      2425      0.011569            0.039960          0.019182             0.027054
```
