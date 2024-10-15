# Analysis of popular API calls

We aggregated data for all API calls, filtering out user-defined functions and
other irrelevant data as possible.
Results are in `data/api_calls.csv` and analyzed in
`data/src/data/api_calls.py`.

## Columns

- `api_type`: The type of API call—Get, Set, Function, or Construction.
- `this`: The object the API is called on, may be empty for static functions.
- `attr`: The attribute or method being called, may be empty.
- `appear`: How many scripts the API call appears in.
- `appear_interact`: How many scripts the API call appears in
    after interaction started.
- `total`: How many times the API call is made.
- `interact`: How many times the API call is made after interaction started.
- `%total/total`: The percentage out of all API calls in
    the scripts the API appear in.
- `%interact/interact`: The percentage out of
    all API calls after interaction in the scripts the API appear in.
- `avg%total/script`: The average percentage per script.
- `avg%interact/script`: The average percentage per script after interaction.
- `%interact/total`: The percentage of calls after interaction out of
    all calls.

Overall, data are tail-heavy, aligning with prior observations:

```py
In [2]: df.describe()
Out[2]: 
             appear  appear_interact         total      interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
count  18120.000000     18120.000000  1.812000e+04  1.812000e+04  18120.000000        15662.000000      18120.000000         18120.000000     18120.000000
mean      83.331733        71.206733  6.331973e+03  3.842462e+03      0.927087            0.530690          1.367818             0.515940        39.876583
std      348.429012       279.559604  8.239731e+04  5.046730e+04      6.230344            3.780852          6.853030             2.822503        40.950548
min        1.000000         0.000000  1.000000e+00  0.000000e+00      0.000087            0.000000          0.000088             0.000000         0.000000
25%        4.000000         2.000000  5.000000e+00  0.000000e+00      0.007226            0.000000          0.016281             0.000000         0.000000
50%        7.000000         5.000000  2.300000e+01  5.000000e+00      0.036847            0.008031          0.095799             0.005917        23.913043
75%       35.000000        30.000000  2.650000e+02  8.225000e+01      0.178863            0.092942          0.512494             0.167178        83.026494
max     9957.000000      7181.000000  6.542023e+06  3.267748e+06    100.000000          100.000000        100.000000           100.000000       100.000000
```

## Call distribution

From the CCDF of number of calls per API, we can see that 0.1% of APIs (18)
are called over 1,000,000 times, massively outnumbering other APIs.
There is also a 2-4 time gap between total API calls and
API calls after interaction began, signalling a large number of
API calls before interaction (precisely,
45,109,934 before vs 69,625,413 after).

![api_calls_cdf](https://github.com/user-attachments/assets/53ccaead-292a-47c9-a878-6d613024de19)

Note: this graph uses the `total` and `interact` columns.

To find how many APIs need to be investigated to cover 90% of all API calls,
we plot the CDF of the fractions of API calls vs fractions of APIs:

![api_calls_cdf](https://github.com/user-attachments/assets/33d37479-a446-4ecc-b7b2-a7da703f3630)

It takes 1.75% (318) APIs to cover 80% of all API calls, and 3.74% (678.0)
APIs to cover 90%.


## Top 20 API calls overall

As a rough look, we sample the top 20 API calls based on various metrics.

The most called APIs are mainly DOM-related, including many "get" calls on on
`HTMLDocument` or `HTMLDivElement` and a few functions.
The results are similar for calls made after interaction began.

```py
In [3]: df.nlargest(20, "appear")
Out[3]: 
       api_type          this              attr  appear  appear_interact   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
12035       Get  HTMLDocument     createElement    9957             6827  386183    160286      0.383050            0.272003          2.670769             0.975292        41.505193
13516       Get        Window          location    9423             7181  579071    319716      0.664399            0.615618          6.606676             4.230041        55.211882
2014   Function  HTMLDocument     createElement    9320             6330  286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
2211        Get        Window  addEventListener    7893             6191  122537     31256      0.140030            0.056707          2.405811             0.710843        25.507398
18119  Function        Window  addEventListener    7166             5668   56988     12036      0.087308            0.031169          1.998809             0.587056        21.120236
241         Get     Navigator         userAgent    6996             5088  142782     58271      0.173377            0.112728          5.145219             2.053937        40.811167
5125        Get        Window          document    6890             5156  280870    131302      0.349732            0.245301          2.341958             1.213727        46.748318
9201   Function        Window        setTimeout    6789             5622  774630    688808      0.847538            1.324614          3.571197             3.203018        88.920904
1990        Get  HTMLDocument              body    6479             5167  364548    234641      0.378641            0.399859          2.522424             1.552503        64.364912
2370        Get  HTMLDocument  addEventListener    6238             5288  106708     34235      0.119114            0.059167          1.832010             0.636335        32.082880
15595       Get        Window         navigator    6201             4558  268025     98575      0.384988            0.216489          4.785670             1.907738        36.778286
2129        Get  HTMLDocument   documentElement    6129             4566  348638    220531      0.365681            0.365297          3.225033             1.109748        63.255009
14494  Function  HTMLDocument  addEventListener    5870             5040   38962     10686      0.045599            0.019454          1.434622             0.627379        27.426723
7915        Get      Location              href    5824             4561  210402    135381      0.291802            0.297886          2.584136             2.093848        64.343970
16137       Get      Location            search    5601             4460   65008     34421      0.089337            0.081936          2.977207             2.503777        52.948868
14177       Get  HTMLDocument    getElementById    5600             3731  145667     67289      0.202675            0.151724          6.768832             2.289762        46.193716
2996        Get  HTMLDocument            cookie    5578             4147  172695    110544      0.324422            0.336975          7.789128             2.641675        64.011118
12711  Function  HTMLDocument    getElementById    5559             3690   81282     42177      0.114240            0.095513          6.735331             2.271519        51.889717
13966       Get  HTMLDocument     querySelector    5470             4069  214306    135242      0.261517            0.286668          5.343761             2.736037        63.106959
15619  Function  HTMLDocument     querySelector    5256             3878  109894     70588      0.143162            0.159666          5.420111             2.722504        64.232806

In [4]: df.nlargest(20, "appear_interact")
Out[4]: 
       api_type          this              attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
13516       Get        Window          location    9423             7181   579071    319716      0.664399            0.615618          6.606676             4.230041        55.211882
12035       Get  HTMLDocument     createElement    9957             6827   386183    160286      0.383050            0.272003          2.670769             0.975292        41.505193
2014   Function  HTMLDocument     createElement    9320             6330   286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
2211        Get        Window  addEventListener    7893             6191   122537     31256      0.140030            0.056707          2.405811             0.710843        25.507398
18119  Function        Window  addEventListener    7166             5668    56988     12036      0.087308            0.031169          1.998809             0.587056        21.120236
9201   Function        Window        setTimeout    6789             5622   774630    688808      0.847538            1.324614          3.571197             3.203018        88.920904
2370        Get  HTMLDocument  addEventListener    6238             5288   106708     34235      0.119114            0.059167          1.832010             0.636335        32.082880
1990        Get  HTMLDocument              body    6479             5167   364548    234641      0.378641            0.399859          2.522424             1.552503        64.364912
5125        Get        Window          document    6890             5156   280870    131302      0.349732            0.245301          2.341958             1.213727        46.748318
241         Get     Navigator         userAgent    6996             5088   142782     58271      0.173377            0.112728          5.145219             2.053937        40.811167
14494  Function  HTMLDocument  addEventListener    5870             5040    38962     10686      0.045599            0.019454          1.434622             0.627379        27.426723
2129        Get  HTMLDocument   documentElement    6129             4566   348638    220531      0.365681            0.365297          3.225033             1.109748        63.255009
7915        Get      Location              href    5824             4561   210402    135381      0.291802            0.297886          2.584136             2.093848        64.343970
15595       Get        Window         navigator    6201             4558   268025     98575      0.384988            0.216489          4.785670             1.907738        36.778286
16137       Get      Location            search    5601             4460    65008     34421      0.089337            0.081936          2.977207             2.503777        52.948868
8169        Get      Location          hostname    4968             4176   136629     68568      0.429844            0.370961          4.515706             3.713880        50.185539
2996        Get  HTMLDocument            cookie    5578             4147   172695    110544      0.324422            0.336975          7.789128             2.641675        64.011118
13966       Get  HTMLDocument     querySelector    5470             4069   214306    135242      0.261517            0.286668          5.343761             2.736037        63.106959
7130        Get      NodeList            length    4664             4065  2382138   1072590      2.861152            1.943079          3.927897             1.756873        45.026359
15619  Function  HTMLDocument     querySelector    5256             3878   109894     70588      0.143162            0.159666          5.420111             2.722504        64.232806

In [5]: df.nlargest(20, "total")
Out[5]: 
       api_type                   this           attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
10159       Get         HTMLDivElement     parentNode    2965             2640  6542023   3267748      7.269719            6.034085          3.250519             3.723290        49.950115
10200       Get         HTMLDivElement       nodeType    2014             1800  4208131   3091512      5.603724            5.771592          3.311296             2.459127        73.465203
12998       Get        HTMLBodyElement     parentNode    1665             1501  3365475   1217366      4.883114            2.911233          1.474360             1.232955        36.172190
7130        Get               NodeList         length    4664             4065  2382138   1072590      2.861152            1.943079          3.927897             1.756873        45.026359
12987       Get         HTMLDivElement   getAttribute    2037             1865  2048964    771237      2.767731            1.546469          2.962922             2.441469        37.640339
17434       Get         HTMLDivElement       nodeName    1443             1384  1931993   1450429      2.994059            3.124005          4.088068             4.737432        75.074237
1340        Get         HTMLDivElement   hasAttribute     858              830  1766442   1005093      3.688406            2.609303          2.078833             1.705360        56.899292
14607       Get         MutationRecord     addedNodes     432              423  1509702    775421      5.358348            4.852424          7.431751             9.234233        51.362521
16368       Get         HTMLDivElement       contains     542              535  1143362   1053742      2.645657            3.983127          2.107908             6.223987        92.161713
14386       Get         MutationRecord           type     339              331  1130505    470080      4.330352            3.197764          2.887015             3.495311        41.581417
1488        Get         HTMLDivElement  parentElement    1652             1584  1119639    646139      1.859494            1.433435          3.000702             2.827354        57.709583
6767   Function         HTMLDivElement   getAttribute    2039             1867  1117674    508505      1.509619            1.019614          2.401499             2.032517        45.496719
16281  Function         HTMLDivElement        matches     843              835  1115182   1064906      4.807023            6.144259          2.282807             2.758132        95.491678
7543        Get            Performance            now    3207             2534  1071387    900360      1.621756            2.036715          4.229508             3.661958        84.036861
17164       Get         HTMLDivElement        tagName    2146             2058  1063408    740653      1.584709            1.610988          2.923359             2.710166        69.648996
9359        Get         HTMLDivElement        matches     715              707  1061215   1007261      5.876682            7.905329          2.152317             2.651707        94.915828
4046        Get  CustomElementRegistry            get     137               89  1051466   1011774     11.754951           12.657662          4.568745             1.805876        96.225080
9514        Get         HTMLDivElement  querySelector    1871             1647  1030328    988630      1.721028            2.543417          2.069165             1.374590        95.952939
16355       Get        HTMLBodyElement       nodeType    1094              926   969560    909957      1.680494            2.101329          0.870327             0.668667        93.852572
2513        Get         MutationRecord   removedNodes     108              107   947656    302503      5.658883            4.521003          5.596039             5.110085        31.921182

In [6]: df.nlargest(20, "interact")
Out[6]: 
       api_type                   this           attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
10159       Get         HTMLDivElement     parentNode    2965             2640  6542023   3267748      7.269719            6.034085          3.250519             3.723290        49.950115
10200       Get         HTMLDivElement       nodeType    2014             1800  4208131   3091512      5.603724            5.771592          3.311296             2.459127        73.465203
17434       Get         HTMLDivElement       nodeName    1443             1384  1931993   1450429      2.994059            3.124005          4.088068             4.737432        75.074237
12998       Get        HTMLBodyElement     parentNode    1665             1501  3365475   1217366      4.883114            2.911233          1.474360             1.232955        36.172190
7130        Get               NodeList         length    4664             4065  2382138   1072590      2.861152            1.943079          3.927897             1.756873        45.026359
16281  Function         HTMLDivElement        matches     843              835  1115182   1064906      4.807023            6.144259          2.282807             2.758132        95.491678
16368       Get         HTMLDivElement       contains     542              535  1143362   1053742      2.645657            3.983127          2.107908             6.223987        92.161713
4046        Get  CustomElementRegistry            get     137               89  1051466   1011774     11.754951           12.657662          4.568745             1.805876        96.225080
9359        Get         HTMLDivElement        matches     715              707  1061215   1007261      5.876682            7.905329          2.152317             2.651707        94.915828
1340        Get         HTMLDivElement   hasAttribute     858              830  1766442   1005093      3.688406            2.609303          2.078833             1.705360        56.899292
9514        Get         HTMLDivElement  querySelector    1871             1647  1030328    988630      1.721028            2.543417          2.069165             1.374590        95.952939
16355       Get        HTMLBodyElement       nodeType    1094              926   969560    909957      1.680494            2.101329          0.870327             0.668667        93.852572
7543        Get            Performance            now    3207             2534  1071387    900360      1.621756            2.036715          4.229508             3.661958        84.036861
3621        Get        TransitionEvent         target     326              326   884580    883460      3.460662            5.166294          5.826075             6.594800        99.873386
17442       Get        HTMLBodyElement       nodeName    1117             1092   905159    878087      1.588063            2.115985          0.662423             0.761367        97.009144
12774       Get        HTMLHtmlElement       nodeName     777              754   896397    854629      1.931199            2.493193          0.726602             0.848152        95.340457
9483   Function         HTMLDivElement  querySelector    1871             1647   847881    808260      1.416274            2.079385          2.040353             1.344933        95.327057
3378   Function  CustomElementRegistry            get     101               71   828723    806370     12.442614           13.151448          5.779473             2.220260        97.302718
14414       Get                  Event         target    2002             1903   824110    783286      1.179062            1.482671          4.650736             5.382586        95.046292
14607       Get         MutationRecord     addedNodes     432              423  1509702    775421      5.358348            4.852424          7.431751             9.234233        51.362521
```

From the relatively low `%interact/total` of some most popular APIs (e.g.,
43% for `createElement`), we can already see a large number of
DOM manipulations being done before any interaction.

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
In [7]: df[df["api_type"] == "Function"].nlargest(20, "appear")  # type: ignore[reportArgumentType]
Out[7]: 
       api_type             this                  attr  appear  appear_interact   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
2014   Function     HTMLDocument         createElement    9320             6330  286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
18119  Function           Window      addEventListener    7166             5668   56988     12036      0.087308            0.031169          1.998809             0.587056        21.120236
9201   Function           Window            setTimeout    6789             5622  774630    688808      0.847538            1.324614          3.571197             3.203018        88.920904
14494  Function     HTMLDocument      addEventListener    5870             5040   38962     10686      0.045599            0.019454          1.434622             0.627379        27.426723
12711  Function     HTMLDocument        getElementById    5559             3690   81282     42177      0.114240            0.095513          6.735331             2.271519        51.889717
15619  Function     HTMLDocument         querySelector    5256             3878  109894     70588      0.143162            0.159666          5.420111             2.722504        64.232806
12778  Function     HTMLDocument  getElementsByTagName    4775             3038   60070     46347      0.104988            0.118652          2.101945             0.346168        77.154986
5732   Function     HTMLDocument      querySelectorAll    4647             3765  223991    187374      0.332157            0.412884          1.507670             0.883315        83.652468
2723   Function          Storage               getItem    4445             3465   80359     53636      0.111631            0.125812          2.384386             1.275023        66.745480
1029   Function           Window          clearTimeout    4064             3570  122973     97912      0.181246            0.218990          1.177498             2.771284        79.620730
16594  Function      Performance                   now    2764             2340  624855    498159      0.960439            1.144829          3.490532             3.096365        79.723936
8423   Function           Window   removeEventListener    2715             2396   12394      7457      0.020448            0.018160          0.505042             0.459469        60.166209
16575  Function        Navigator     get userAgentData    2575             2003    8612      3716      0.019608            0.011080          0.995214             0.463714        43.149094
17624  Function  HTMLHeadElement           appendChild    2559             1888   17051      7303      0.040659            0.022542          1.667455             0.622105        42.830333
16461  Function  HTMLHtmlElement          getAttribute    2550             2173   54549     13001      0.088869            0.032554          0.661737             0.118803        23.833617
12704  Function          Storage               setItem    2530             2151  117494    100433      0.229494            0.285617          1.399357             0.855013        85.479259
7048   Function   HTMLDivElement      addEventListener    2514             2184  252068    107180      0.391858            0.234839          2.477123             1.046851        42.520272
6007   Function   HTMLDivElement           appendChild    2328             2052   87416     23624      0.157654            0.065366          2.490404             1.678324        27.024801
16209  Function   HTMLDivElement      querySelectorAll    2294             2227  574049    442116      0.767773            0.923417          1.696780             1.783361        77.017119
14409  Function     DOMTokenList                   add    2140             1859   75038     50171      0.119709            0.129215          2.026993             1.599572        66.860791

In [8]: df[df["api_type"] == "Function"].nlargest(20, "appear_interact")  # type: ignore[reportArgumentType]
Out[8]: 
       api_type             this                  attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
2014   Function     HTMLDocument         createElement    9320             6330   286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
18119  Function           Window      addEventListener    7166             5668    56988     12036      0.087308            0.031169          1.998809             0.587056        21.120236
9201   Function           Window            setTimeout    6789             5622   774630    688808      0.847538            1.324614          3.571197             3.203018        88.920904
14494  Function     HTMLDocument      addEventListener    5870             5040    38962     10686      0.045599            0.019454          1.434622             0.627379        27.426723
15619  Function     HTMLDocument         querySelector    5256             3878   109894     70588      0.143162            0.159666          5.420111             2.722504        64.232806
5732   Function     HTMLDocument      querySelectorAll    4647             3765   223991    187374      0.332157            0.412884          1.507670             0.883315        83.652468
12711  Function     HTMLDocument        getElementById    5559             3690    81282     42177      0.114240            0.095513          6.735331             2.271519        51.889717
1029   Function           Window          clearTimeout    4064             3570   122973     97912      0.181246            0.218990          1.177498             2.771284        79.620730
2723   Function          Storage               getItem    4445             3465    80359     53636      0.111631            0.125812          2.384386             1.275023        66.745480
12778  Function     HTMLDocument  getElementsByTagName    4775             3038    60070     46347      0.104988            0.118652          2.101945             0.346168        77.154986
8423   Function           Window   removeEventListener    2715             2396    12394      7457      0.020448            0.018160          0.505042             0.459469        60.166209
16594  Function      Performance                   now    2764             2340   624855    498159      0.960439            1.144829          3.490532             3.096365        79.723936
16209  Function   HTMLDivElement      querySelectorAll    2294             2227   574049    442116      0.767773            0.923417          1.696780             1.783361        77.017119
7048   Function   HTMLDivElement      addEventListener    2514             2184   252068    107180      0.391858            0.234839          2.477123             1.046851        42.520272
16461  Function  HTMLHtmlElement          getAttribute    2550             2173    54549     13001      0.088869            0.032554          0.661737             0.118803        23.833617
12704  Function          Storage               setItem    2530             2151   117494    100433      0.229494            0.285617          1.399357             0.855013        85.479259
6007   Function   HTMLDivElement           appendChild    2328             2052    87416     23624      0.157654            0.065366          2.490404             1.678324        27.024801
16575  Function        Navigator     get userAgentData    2575             2003     8612      3716      0.019608            0.011080          0.995214             0.463714        43.149094
17624  Function  HTMLHeadElement           appendChild    2559             1888    17051      7303      0.040659            0.022542          1.667455             0.622105        42.830333
6767   Function   HTMLDivElement          getAttribute    2039             1867  1117674    508505      1.509619            1.019614          2.401499             2.032517        45.496719

In [9]: df[df["api_type"] == "Function"].nlargest(20, "total")  # type: ignore[reportArgumentType]
Out[9]: 
       api_type                   this              attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
6767   Function         HTMLDivElement      getAttribute    2039             1867  1117674    508505      1.509619            1.019614          2.401499             2.032517        45.496719
16281  Function         HTMLDivElement           matches     843              835  1115182   1064906      4.807023            6.144259          2.282807             2.758132        95.491678
9483   Function         HTMLDivElement     querySelector    1871             1647   847881    808260      1.416274            2.079385          2.040353             1.344933        95.327057
3378   Function  CustomElementRegistry               get     101               71   828723    806370     12.442614           13.151448          5.779473             2.220260        97.302718
9201   Function                 Window        setTimeout    6789             5622   774630    688808      0.847538            1.324614          3.571197             3.203018        88.920904
16594  Function            Performance               now    2764             2340   624855    498159      0.960439            1.144829          3.490532             3.096365        79.723936
2831   Function         HTMLDivElement      hasAttribute     858              830   596653    412168      1.246269            1.070484          2.153890             2.032827        69.080018
16209  Function         HTMLDivElement  querySelectorAll    2294             2227   574049    442116      0.767773            0.923417          1.696780             1.783361        77.017119
11333  Function         HTMLDivElement           closest    1111             1109   415799     62022      1.477813            0.420875          2.660322             3.038853        14.916342
15923  Function      HTMLAnchorElement      getAttribute    1630             1553   353941    184154      0.464089            0.381401          1.700309             2.157078        52.029576
4078   Function         HTMLDivElement          contains     542              535   303535    254118      0.702358            0.960562          1.509068             3.241954        83.719505
2014   Function           HTMLDocument     createElement    9320             6330   286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
7048   Function         HTMLDivElement  addEventListener    2514             2184   252068    107180      0.391858            0.234839          2.477123             1.046851        42.520272
5732   Function           HTMLDocument  querySelectorAll    4647             3765   223991    187374      0.332157            0.412884          1.507670             0.883315        83.652468
11541  Function           DOMTokenList          contains    1919             1724   210971    141308      0.421512            0.391151          2.304020             2.127485        66.979822
2490   Function                   Text          contains      51               51   187765      5018      1.569764            0.206079          1.265214             0.071572         2.672490
16718  Function      HTMLScriptElement      getAttribute    2065             1544   151950     50237      0.378190            0.168485          6.170167             2.245830        33.061533
12692  Function             TreeWalker          nextNode     139              124   144231     71645      1.507849            0.865876          4.913585             3.978987        49.673787
14823  Function                 Window  getComputedStyle    1697             1384   143326     75800      0.299979            0.220471          1.873741             2.419006        52.886427
4797   Function         HTMLDivElement      setAttribute    2075             1803   124080     65231      0.200152            0.153838          0.799871             0.543422        52.571728

In [10]: df[df["api_type"] == "Function"].nlargest(20, "interact")  # type: ignore[reportArgumentType]
Out[10]: 
       api_type                   this              attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
16281  Function         HTMLDivElement           matches     843              835  1115182   1064906      4.807023            6.144259          2.282807             2.758132        95.491678
9483   Function         HTMLDivElement     querySelector    1871             1647   847881    808260      1.416274            2.079385          2.040353             1.344933        95.327057
3378   Function  CustomElementRegistry               get     101               71   828723    806370     12.442614           13.151448          5.779473             2.220260        97.302718
9201   Function                 Window        setTimeout    6789             5622   774630    688808      0.847538            1.324614          3.571197             3.203018        88.920904
6767   Function         HTMLDivElement      getAttribute    2039             1867  1117674    508505      1.509619            1.019614          2.401499             2.032517        45.496719
16594  Function            Performance               now    2764             2340   624855    498159      0.960439            1.144829          3.490532             3.096365        79.723936
16209  Function         HTMLDivElement  querySelectorAll    2294             2227   574049    442116      0.767773            0.923417          1.696780             1.783361        77.017119
2831   Function         HTMLDivElement      hasAttribute     858              830   596653    412168      1.246269            1.070484          2.153890             2.032827        69.080018
4078   Function         HTMLDivElement          contains     542              535   303535    254118      0.702358            0.960562          1.509068             3.241954        83.719505
5732   Function           HTMLDocument  querySelectorAll    4647             3765   223991    187374      0.332157            0.412884          1.507670             0.883315        83.652468
15923  Function      HTMLAnchorElement      getAttribute    1630             1553   353941    184154      0.464089            0.381401          1.700309             2.157078        52.029576
11541  Function           DOMTokenList          contains    1919             1724   210971    141308      0.421512            0.391151          2.304020             2.127485        66.979822
2014   Function           HTMLDocument     createElement    9320             6330   286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
595    Function      HTMLAnchorElement        isSameNode      30               30   117855    117855      8.029145           12.948267          7.101826            11.841353       100.000000
7048   Function         HTMLDivElement  addEventListener    2514             2184   252068    107180      0.391858            0.234839          2.477123             1.046851        42.520272
14811  Function       HTMLInputElement           matches     120              120   101906    101899      0.937924            1.010790          1.194562             1.553083        99.993131
12704  Function                Storage           setItem    2530             2151   117494    100433      0.229494            0.285617          1.399357             0.855013        85.479259
1029   Function                 Window      clearTimeout    4064             3570   122973     97912      0.181246            0.218990          1.177498             2.771284        79.620730
15809  Function      HTMLAnchorElement   removeAttribute     373              347    99233     96946      1.153120            1.474503          0.726152             0.792383        97.695323
11476  Function       DocumentFragment       appendChild     555              540   103875     94235      0.567692            0.809485          2.425293             3.739579        90.719615
```

<details>
<summary>
The top 20 function calls on the other 4 metrics are also less intuitive.
They are mostly internal, workers, canvas, etc., and they do not appear much.
</summary>

```py
In [12]: df[df["api_type"] == "Function"].nlargest(20, "%total/total")  # type: ignore[reportArgumentType]
Out[12]: 
       api_type                        this                 attr  appear  appear_interact   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
4048   Function                      Object                query       7                0       7         0    100.000000                 NaN        100.000000             0.000000         0.000000
5873   Function  DedicatedWorkerGlobalScope        importScripts      15                0      15         0    100.000000                 NaN        100.000000             0.000000         0.000000
10648  Function  KeyboardLayoutMap Iterator                 next       1                0      50         0     94.339623                 NaN         94.339623             0.000000         0.000000
8245   Function                   Navigator  joinAdInterestGroup      22                0      80         0     25.559105                 NaN         33.441558             0.000000         0.000000
978    Function                HTMLDocument             evaluate       5                2     790         0     17.665474            0.000000         17.901950             0.000000         0.000000
14861  Function                 FontFaceSet                  add      18                4      18         4     16.666667           16.666667         16.666667             3.703704        22.222222
15873  Function                    FontFace                 load      18                4      18         4     16.666667           16.666667         16.666667             3.703704        22.222222
16387  Function             HTMLLinkElement   insertAdjacentHTML      29               29      29        29     16.666667           16.666667         16.666667            16.666667       100.000000
2636   Function              HTMLDivElement          isEqualNode       4                4     350       245     14.583333           13.424658         10.373686            10.092331        70.000000
9888   Function             HTMLBodyElement          get dataset      11                0      11         0     14.285714                 NaN         14.285714             0.000000         0.000000
11149  Function                      Window                close       7                0       7         0     14.285714                 NaN         14.285714             0.000000         0.000000
3378   Function       CustomElementRegistry                  get     101               71  828723    806370     12.442614           13.151448          5.779473             2.220260        97.302718
6954   Function                      Window                 find       1                1     290       266     11.435331           10.901639         11.435331            10.901639        91.724138
7442   Function  DedicatedWorkerGlobalScope                 btoa       5                0       5         0     10.000000                 NaN         10.000000             0.000000         0.000000
13750  Function                DOMException             get name       4                4       5         5      9.433962            9.433962          9.318182             9.318182       100.000000
8856   Function  DedicatedWorkerGlobalScope          postMessage      53                0     998         0      9.239030                 NaN         14.201290             0.000000         0.000000
595    Function           HTMLAnchorElement           isSameNode      30               30  117855    117855      8.029145           12.948267          7.101826            11.841353       100.000000
3325   Function    CanvasRenderingContext2D                 save       5                5    4700      4252      7.365501            7.344330          8.110019             8.297614        90.468085
4235   Function    CanvasRenderingContext2D              restore       5                5    4700      4252      7.365501            7.344330          8.110019             8.297614        90.468085
2952   Function             HTMLBodyElement       getClientRects      12                0      12         0      6.666667                 NaN         14.423077             0.000000         0.000000

In [13]: df[df["api_type"] == "Function"].nlargest(20, "%interact/interact")  # type: ignore[reportArgumentType]
Out[13]: 
       api_type                          this                      attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
4306   Function      CanvasRenderingContext2D              putImageData       7                7     1378      1146      0.600666           27.501800          7.636882            19.591959        83.164006
2788   Function              BroadcastChannel       removeEventListener       3                2        3         2      0.603622           25.000000          0.666398            16.666667        66.666667
5443   Function  PerformanceObserverEntryList          getEntriesByName       4                4       10        10      2.036660           23.255814          2.005391            28.875812       100.000000
14861  Function                   FontFaceSet                       add      18                4       18         4     16.666667           16.666667         16.666667             3.703704        22.222222
15873  Function                      FontFace                      load      18                4       18         4     16.666667           16.666667         16.666667             3.703704        22.222222
16387  Function               HTMLLinkElement        insertAdjacentHTML      29               29       29        29     16.666667           16.666667         16.666667            16.666667       100.000000
2636   Function                HTMLDivElement               isEqualNode       4                4      350       245     14.583333           13.424658         10.373686            10.092331        70.000000
3378   Function         CustomElementRegistry                       get     101               71   828723    806370     12.442614           13.151448          5.779473             2.220260        97.302718
595    Function             HTMLAnchorElement                isSameNode      30               30   117855    117855      8.029145           12.948267          7.101826            11.841353       100.000000
6954   Function                        Window                      find       1                1      290       266     11.435331           10.901639         11.435331            10.901639        91.724138
4237   Function                IDBTransaction       removeEventListener      13                5      702        21      0.578583            9.589041          3.134371             3.592959         2.991453
1527   Function             HTMLCanvasElement             dispatchEvent       5                5        5         5      2.659574            9.433962          2.702381            10.952381       100.000000
13750  Function                  DOMException                  get name       4                4        5         5      9.433962            9.433962          9.318182             9.318182       100.000000
46     Function               HTMLFormElement             checkValidity       5                5       35        35      2.800000            9.333333          2.905555            13.967387       100.000000
3325   Function      CanvasRenderingContext2D                      save       5                5     4700      4252      7.365501            7.344330          8.110019             8.297614        90.468085
4235   Function      CanvasRenderingContext2D                   restore       5                5     4700      4252      7.365501            7.344330          8.110019             8.297614        90.468085
1661   Function                           URL              get protocol      90               90     5352      1824      0.524881            6.625740          0.728693             0.645742        34.080717
16281  Function                HTMLDivElement                   matches     843              835  1115182   1064906      4.807023            6.144259          2.282807             2.758132        95.491678
15075  Function                  MessageEvent  stopImmediatePropagation       1                1        1         1      0.564972            5.882353          0.564972             5.882353       100.000000
7786   Function           DialogHelperElement             querySelector       5                5      540       495      4.846962            5.586277          4.874266             5.632438        91.666667

In [14]: df[df["api_type"] == "Function"].nlargest(20, "avg%total/script")  # type: ignore[reportArgumentType]
Out[14]: 
       api_type                          this                 attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
4048   Function                        Object                query       7                0      7         0    100.000000                 NaN        100.000000             0.000000         0.000000
5873   Function    DedicatedWorkerGlobalScope        importScripts      15                0     15         0    100.000000                 NaN        100.000000             0.000000         0.000000
10648  Function    KeyboardLayoutMap Iterator                 next       1                0     50         0     94.339623                 NaN         94.339623             0.000000         0.000000
8245   Function                     Navigator  joinAdInterestGroup      22                0     80         0     25.559105                 NaN         33.441558             0.000000         0.000000
6982   Function                   FontFaceSet                 load     110               52    735       116      0.429920            2.183735         21.941940             5.717374        15.782313
13606  Function      ServiceWorkerGlobalScope                fetch      25                0   4307         0      3.182920                 NaN         19.438611             0.000000         0.000000
12027  Function      ServiceWorkerGlobalScope        importScripts      11                0     36         0      0.944386                 NaN         18.684029             0.000000         0.000000
978    Function                  HTMLDocument             evaluate       5                2    790         0     17.665474            0.000000         17.901950             0.000000         0.000000
11792  Function                         Image         setAttribute     175               85    628       204      0.101835            0.037405         17.618164             4.888760        32.484076
16387  Function               HTMLLinkElement   insertAdjacentHTML      29               29     29        29     16.666667           16.666667         16.666667            16.666667       100.000000
14861  Function                   FontFaceSet                  add      18                4     18         4     16.666667           16.666667         16.666667             3.703704        22.222222
15873  Function                      FontFace                 load      18                4     18         4     16.666667           16.666667         16.666667             3.703704        22.222222
17399  Function  PerformanceObserverEntryList     getEntriesByType      38               38   3650      3159      4.730062            5.344725         15.360827            19.455392        86.547945
2952   Function               HTMLBodyElement       getClientRects      12                0     12         0      6.666667                 NaN         14.423077             0.000000         0.000000
11149  Function                        Window                close       7                0      7         0     14.285714                 NaN         14.285714             0.000000         0.000000
9888   Function               HTMLBodyElement          get dataset      11                0     11         0     14.285714                 NaN         14.285714             0.000000         0.000000
8856   Function    DedicatedWorkerGlobalScope          postMessage      53                0    998         0      9.239030                 NaN         14.201290             0.000000         0.000000
15223  Function             TrustedTypePolicy         createScript     225              166   5909      3701      0.046810            0.041957         12.566570             7.982096        62.633271
6954   Function                        Window                 find       1                1    290       266     11.435331           10.901639         11.435331            10.901639        91.724138
2636   Function                HTMLDivElement          isEqualNode       4                4    350       245     14.583333           13.424658         10.373686            10.092331        70.000000

In [15]: df[df["api_type"] == "Function"].nlargest(20, "avg%interact/script")  # type: ignore[reportArgumentType]
Out[15]: 
       api_type                          this                 attr  appear  appear_interact   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
5443   Function  PerformanceObserverEntryList     getEntriesByName       4                4      10        10      2.036660           23.255814          2.005391            28.875812       100.000000
4306   Function      CanvasRenderingContext2D         putImageData       7                7    1378      1146      0.600666           27.501800          7.636882            19.591959        83.164006
17399  Function  PerformanceObserverEntryList     getEntriesByType      38               38    3650      3159      4.730062            5.344725         15.360827            19.455392        86.547945
3938   Function             HTMLAnchorElement  removeEventListener     163              163   13043     11362      0.092295            0.108022          5.412695            16.769294        87.111861
2788   Function              BroadcastChannel  removeEventListener       3                2       3         2      0.603622           25.000000          0.666398            16.666667        66.666667
16387  Function               HTMLLinkElement   insertAdjacentHTML      29               29      29        29     16.666667           16.666667         16.666667            16.666667       100.000000
46     Function               HTMLFormElement        checkValidity       5                5      35        35      2.800000            9.333333          2.905555            13.967387       100.000000
595    Function             HTMLAnchorElement           isSameNode      30               30  117855    117855      8.029145           12.948267          7.101826            11.841353       100.000000
1527   Function             HTMLCanvasElement        dispatchEvent       5                5       5         5      2.659574            9.433962          2.702381            10.952381       100.000000
6954   Function                        Window                 find       1                1     290       266     11.435331           10.901639         11.435331            10.901639        91.724138
1336   Function                        Window         getSelection     103              103    8064      8064      0.517555            0.579214          9.106014            10.571244       100.000000
2636   Function                HTMLDivElement          isEqualNode       4                4     350       245     14.583333           13.424658         10.373686            10.092331        70.000000
2536   Function             HTMLAnchorElement                 blur      16               16      17        17      0.001361            0.001822          9.398725             9.830911       100.000000
13871  Function                     Selection             toString      95               95    4873      4873      0.350078            0.381274          8.209906             9.385576       100.000000
3469   Function                  DOMException          get message       8                5      15        11      0.007231            0.020454          9.319476             9.318414        73.333333
13750  Function                  DOMException             get name       4                4       5         5      9.433962            9.433962          9.318182             9.318182       100.000000
11893  Function              BroadcastChannel                close       6                4       8         2      0.045961            0.510204          0.348012             8.333333        25.000000
3325   Function      CanvasRenderingContext2D                 save       5                5    4700      4252      7.365501            7.344330          8.110019             8.297614        90.468085
4235   Function      CanvasRenderingContext2D              restore       5                5    4700      4252      7.365501            7.344330          8.110019             8.297614        90.468085
15223  Function             TrustedTypePolicy         createScript     225              166    5909      3701      0.046810            0.041957         12.566570             7.982096        62.633271
```

</details>

## Top 20 API Set calls

There are some interesting popular "set" calls as well,
despite the many internal functions.

```py
In [16]: df[df["api_type"] == "Set"].nlargest(20, "appear")  # type: ignore[reportArgumentType]
Out[16]: 
      api_type                 this                attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
15422      Set    HTMLScriptElement                 src    4145             2406  15143      6913      0.033048            0.019939          2.485560             0.417693        45.651456
11866      Set    HTMLScriptElement               async    3037             1612   8652      2926      0.023194            0.010426          2.714181             0.277729        33.818770
8172       Set         HTMLDocument              cookie    2810             2376  25002     15393      0.057419            0.058849          5.065215             0.855618        61.567075
10020      Set    HTMLAnchorElement                href    2781             2633  43452     29806      0.078498            0.084109          0.583468             0.409084        68.595232
15256      Set    HTMLScriptElement              onload    2311             1711  15091      7425      0.035689            0.023283          1.407092             0.675300        49.201511
11456      Set  CSSStyleDeclaration             display    2158             1870  29629     20599      0.057507            0.064276          1.980954             1.334224        69.523102
3257       Set    HTMLScriptElement                type    1977             1171   4850      2048      0.059195            0.034339          2.318651             0.435811        42.226804
11781      Set       HTMLDivElement           innerHTML    1938             1811  16250      5709      0.036140            0.021380          0.966634             0.606579        35.132308
299        Set               Window           dataLayer    1859             1061   1911       405      0.028186            0.011752          9.510403             0.102686        21.193093
7094       Set       XMLHttpRequest  onreadystatechange    1780             1455  15562     11971      0.039432            0.041042          0.740359             0.471672        76.924560
12681      Set                Image                 src    1693             1131   6466      3467      0.016076            0.011726          4.572729             1.848441        53.618930
13778      Set    HTMLScriptElement             onerror    1586             1291  12757      5854      0.033671            0.019983          0.744364             0.615878        45.888532
2347       Set       XMLHttpRequest     withCredentials    1564             1254   8258      6551      0.019977            0.023260          0.648240             0.361858        79.329135
14550      Set  CSSStyleDeclaration               width    1292             1097  19640      8521      0.065403            0.042337          1.446305             0.382616        43.385947
17552      Set     HTMLImageElement                 src    1202              837  15598      5529      0.059533            0.037416          3.087841             1.070676        35.446852
258        Set  CSSStyleDeclaration            position    1192              969  21109      2744      0.052430            0.009619          0.507048             0.181102        12.999195
2148       Set    HTMLIFrameElement                 src    1106              838   1383       543      0.011561            0.008270          0.710719             0.609099        39.262473
8985       Set       HTMLDivElement                  id    1084              916   4409       709      0.013589            0.003192          0.643126             0.349976        16.080744
17444      Set          MessagePort           onmessage    1043              886   1228       133      0.003000            0.000449          0.391508             0.161973        10.830619
13010      Set  CSSStyleDeclaration              height    1003              833  29251     24464      0.069698            0.081981          0.304656             0.070588        83.634748

In [17]: df[df["api_type"] == "Set"].nlargest(20, "appear_interact")  # type: ignore[reportArgumentType]
Out[17]: 
      api_type                 this                attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
10020      Set    HTMLAnchorElement                href    2781             2633  43452     29806      0.078498            0.084109          0.583468             0.409084        68.595232
15422      Set    HTMLScriptElement                 src    4145             2406  15143      6913      0.033048            0.019939          2.485560             0.417693        45.651456
8172       Set         HTMLDocument              cookie    2810             2376  25002     15393      0.057419            0.058849          5.065215             0.855618        61.567075
11456      Set  CSSStyleDeclaration             display    2158             1870  29629     20599      0.057507            0.064276          1.980954             1.334224        69.523102
11781      Set       HTMLDivElement           innerHTML    1938             1811  16250      5709      0.036140            0.021380          0.966634             0.606579        35.132308
15256      Set    HTMLScriptElement              onload    2311             1711  15091      7425      0.035689            0.023283          1.407092             0.675300        49.201511
11866      Set    HTMLScriptElement               async    3037             1612   8652      2926      0.023194            0.010426          2.714181             0.277729        33.818770
7094       Set       XMLHttpRequest  onreadystatechange    1780             1455  15562     11971      0.039432            0.041042          0.740359             0.471672        76.924560
13778      Set    HTMLScriptElement             onerror    1586             1291  12757      5854      0.033671            0.019983          0.744364             0.615878        45.888532
2347       Set       XMLHttpRequest     withCredentials    1564             1254   8258      6551      0.019977            0.023260          0.648240             0.361858        79.329135
3257       Set    HTMLScriptElement                type    1977             1171   4850      2048      0.059195            0.034339          2.318651             0.435811        42.226804
12681      Set                Image                 src    1693             1131   6466      3467      0.016076            0.011726          4.572729             1.848441        53.618930
14550      Set  CSSStyleDeclaration               width    1292             1097  19640      8521      0.065403            0.042337          1.446305             0.382616        43.385947
299        Set               Window           dataLayer    1859             1061   1911       405      0.028186            0.011752          9.510403             0.102686        21.193093
258        Set  CSSStyleDeclaration            position    1192              969  21109      2744      0.052430            0.009619          0.507048             0.181102        12.999195
8985       Set       HTMLDivElement                  id    1084              916   4409       709      0.013589            0.003192          0.643126             0.349976        16.080744
17444      Set          MessagePort           onmessage    1043              886   1228       133      0.003000            0.000449          0.391508             0.161973        10.830619
2148       Set    HTMLIFrameElement                 src    1106              838   1383       543      0.011561            0.008270          0.710719             0.609099        39.262473
17552      Set     HTMLImageElement                 src    1202              837  15598      5529      0.059533            0.037416          3.087841             1.070676        35.446852
13010      Set  CSSStyleDeclaration              height    1003              833  29251     24464      0.069698            0.081981          0.304656             0.070588        83.634748

In [18]: df[df["api_type"] == "Set"].nlargest(20, "total")  # type: ignore[reportArgumentType]
Out[18]: 
      api_type                 this                attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
9493       Set                Event                flow     121              121  72147     57173      0.262724            0.259411          0.292955             0.308683        79.245152
10020      Set    HTMLAnchorElement                href    2781             2633  43452     29806      0.078498            0.084109          0.583468             0.409084        68.595232
2968       Set                 Text         textContent      42               41  37094     23641      1.142186            0.933173          0.917371             0.731892        63.732679
11456      Set  CSSStyleDeclaration             display    2158             1870  29629     20599      0.057507            0.064276          1.980954             1.334224        69.523102
9902       Set      HTMLSpanElement         textContent     497              463  29552      8465      0.262036            0.134479          1.362292             0.089505        28.644423
13010      Set  CSSStyleDeclaration              height    1003              833  29251     24464      0.069698            0.081981          0.304656             0.070588        83.634748
8172       Set         HTMLDocument              cookie    2810             2376  25002     15393      0.057419            0.058849          5.065215             0.855618        61.567075
4044       Set     HTMLImageElement              onload     510              440  21372     11883      0.361391            0.249478          0.810341             0.577726        55.600786
258        Set  CSSStyleDeclaration            position    1192              969  21109      2744      0.052430            0.009619          0.507048             0.181102        12.999195
12959      Set  CSSStyleDeclaration                left     565              532  20098      2004      0.078073            0.011633          0.940909             0.591199         9.971141
14550      Set  CSSStyleDeclaration               width    1292             1097  19640      8521      0.065403            0.042337          1.446305             0.382616        43.385947
16491      Set  CSSStyleDeclaration          fontFamily     143              116  16992       591      0.161403            0.007508          4.393393             0.188850         3.478107
13647      Set  CSSStyleDeclaration           transform     704              696  16935     14308      0.090705            0.128078          0.874879             0.462369        84.487747
11781      Set       HTMLDivElement           innerHTML    1938             1811  16250      5709      0.036140            0.021380          0.966634             0.606579        35.132308
5856       Set       HTMLDivElement           className     881              726  15672      4497      0.087585            0.033973          1.528997             1.046062        28.694487
131        Set                Event  isDefaultPrevented     191              191  15620     15617      0.351237            2.103407          0.222507             7.115688        99.980794
17552      Set     HTMLImageElement                 src    1202              837  15598      5529      0.059533            0.037416          3.087841             1.070676        35.446852
7094       Set       XMLHttpRequest  onreadystatechange    1780             1455  15562     11971      0.039432            0.041042          0.740359             0.471672        76.924560
15422      Set    HTMLScriptElement                 src    4145             2406  15143      6913      0.033048            0.019939          2.485560             0.417693        45.651456
15256      Set    HTMLScriptElement              onload    2311             1711  15091      7425      0.035689            0.023283          1.407092             0.675300        49.201511

In [19]: df[df["api_type"] == "Set"].nlargest(20, "interact")  # type: ignore[reportArgumentType]
Out[19]: 
      api_type                 this                  attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
9493       Set                Event                  flow     121              121  72147     57173      0.262724            0.259411          0.292955             0.308683        79.245152
10020      Set    HTMLAnchorElement                  href    2781             2633  43452     29806      0.078498            0.084109          0.583468             0.409084        68.595232
13010      Set  CSSStyleDeclaration                height    1003              833  29251     24464      0.069698            0.081981          0.304656             0.070588        83.634748
2968       Set                 Text           textContent      42               41  37094     23641      1.142186            0.933173          0.917371             0.731892        63.732679
11456      Set  CSSStyleDeclaration               display    2158             1870  29629     20599      0.057507            0.064276          1.980954             1.334224        69.523102
131        Set                Event    isDefaultPrevented     191              191  15620     15617      0.351237            2.103407          0.222507             7.115688        99.980794
8172       Set         HTMLDocument                cookie    2810             2376  25002     15393      0.057419            0.058849          5.065215             0.855618        61.567075
13647      Set  CSSStyleDeclaration             transform     704              696  16935     14308      0.090705            0.128078          0.874879             0.462369        84.487747
7094       Set       XMLHttpRequest    onreadystatechange    1780             1455  15562     11971      0.039432            0.041042          0.740359             0.471672        76.924560
4044       Set     HTMLImageElement                onload     510              440  21372     11883      0.361391            0.249478          0.810341             0.577726        55.600786
204        Set                Event  isPropagationStopped      50               50  11723     11723      1.076866            1.692896          0.501635             3.173913       100.000000
11747      Set                Event           nativeEvent      50               50  11723     11723      1.076866            1.692896          0.501635             3.173913       100.000000
15818      Set                Event               persist      50               50  11723     11723      1.076866            1.692896          0.501635             3.173913       100.000000
14550      Set  CSSStyleDeclaration                 width    1292             1097  19640      8521      0.065403            0.042337          1.446305             0.382616        43.385947
9902       Set      HTMLSpanElement           textContent     497              463  29552      8465      0.262036            0.134479          1.362292             0.089505        28.644423
15256      Set    HTMLScriptElement                onload    2311             1711  15091      7425      0.035689            0.023283          1.407092             0.675300        49.201511
15422      Set    HTMLScriptElement                   src    4145             2406  15143      6913      0.033048            0.019939          2.485560             0.417693        45.651456
5704       Set  CSSStyleDeclaration               opacity     212              192   7607      6789      0.047285            0.070397          0.306024             0.537926        89.246746
935        Set    HTMLAnchorElement               onclick     287              274  13304      6744      0.126817            0.105791          0.135959             0.098332        50.691521
2347       Set       XMLHttpRequest       withCredentials    1564             1254   8258      6551      0.019977            0.023260          0.648240             0.361858        79.329135
```

## Specific API of interest

Some APIs clearly indicate developers' intent. We look at them case by case.

`addEventListener` on
various elements all clearly indicate **frontend processing**, regardless of
whether they are called after interaction started.

```py
In [22]: df[(df["attr"] == "addEventListener") & (df["appear"] > 100) & (df["api_type"] == "Function")]
Out[22]: 
       api_type                  this              attr  appear  appear_interact   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
170    Function       HTMLHtmlElement  addEventListener     435              403   10386      2790      0.042678            0.015690          1.014821             0.156781        26.863085
482    Function       HTMLLinkElement  addEventListener     357              203    6291      1129      0.165954            0.097912          1.344452             0.234178        17.946272
926    Function      HTMLUListElement  addEventListener     318              302    1973        73      0.020669            0.000985          0.300937             0.006706         3.699949
1271   Function      HTMLImageElement  addEventListener     585              539   25288     11160      0.128254            0.094256          0.826761             0.479900        44.131604
1593   Function       HTMLSpanElement  addEventListener     346              333    7552       270      0.049295            0.002749          0.135847             0.027511         3.575212
3005   Function  HTMLParagraphElement  addEventListener     101              101    2233         2      0.130516            0.000176          0.138290             0.000166         0.089566
3031   Function     HTMLSelectElement  addEventListener     236              217    1468        21      0.046463            0.001421          0.465725             0.017949         1.430518
3308   Function    NetworkInformation  addEventListener     106              103     119        18      0.021710            0.008249          0.167541             0.024107        15.126050
3772   Function           HTMLElement  addEventListener     750              739   32724      2545      0.183205            0.022435          1.564308             1.332341         7.777167
5077   Function        MediaQueryList  addEventListener     708              671    5206      2308      0.014862            0.008460          0.791159             0.285986        44.333461
5616   Function     HTMLAnchorElement  addEventListener    1346             1174   77789     18943      0.184291            0.063770          6.796528             0.760201        24.351772
7048   Function        HTMLDivElement  addEventListener    2514             2184  252068    107180      0.391858            0.234839          2.477123             1.046851        42.520272
7638   Function      HTMLVideoElement  addEventListener     233              193   13401      2890      0.273275            0.080812          2.216936             0.073431        21.565555
8196   Function           AbortSignal  addEventListener     104              104    8336      8160      0.026733            0.031255          0.176075             0.404642        97.888676
9282   Function     HTMLButtonElement  addEventListener    1475             1215   21572      3449      0.048451            0.011562          1.259833             0.811528        15.988318
11331  Function       HTMLFormElement  addEventListener     384              302    1962        97      0.050651            0.005543          4.696687             0.949741         4.943935
13049  Function        XMLHttpRequest  addEventListener     113               97    1176       715      0.010391            0.019337          0.309974             0.138416        60.799320
13077  Function     HTMLScriptElement  addEventListener     523              481    2340      1130      0.010101            0.013179          1.327969             0.154031        48.290598
13558  Function         HTMLLIElement  addEventListener     390              376    9582       737      0.096313            0.010782          0.262191             0.054946         7.691505
14483  Function       HTMLBodyElement  addEventListener    1021              964   10257      4482      0.027587            0.016387          0.603541             0.057784        43.696987
14494  Function          HTMLDocument  addEventListener    5870             5040   38962     10686      0.045599            0.019454          1.434622             0.627379        27.426723
16637  Function      HTMLInputElement  addEventListener     623              585    4813      1395      0.014064            0.005429          0.332024             0.059557        28.984002
18119  Function                Window  addEventListener    7166             5668   56988     12036      0.087308            0.031169          1.998809             0.587056        21.120236
```

`HTMLDocument.createElement` indicates either **UX enhancement** or
**DOM element generation**.
Since only 43% are called after interaction started, more than half of
them are clearly **DOM element generation**.

```py
In [24]: df[(df["attr"] == "createElement") & (df["api_type"] == "Function")]
Out[24]: 
      api_type          this           attr  appear  appear_interact   total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
2014  Function  HTMLDocument  createElement    9320             6330  286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
```

`Window.requestAnimationFrame` is a clear indication of
**UX enhancement** because it is strictly for animation.
Much more of it is called after interaction started.
Though calling it before interaction might make sense because
the page might be animating before the user interacts.

```py
In [26]: df[(df["attr"] == "requestAnimationFrame") & (df["api_type"] == "Function")]
Out[26]: 
      api_type    this                   attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
9128  Function  Window  requestAnimationFrame    1655             1422  42244     28852      0.092087            0.097062          1.884883             3.626479        68.298457
```

`Navigator.sendBeacon` is a clear indication of
**extensional features** (tracking).
It seems to be called more after interaction started.

```py
In [27]: df[(df["attr"] == "sendBeacon") & (df["api_type"] == "Function")]
Out[27]: 
      api_type       this        attr  appear  appear_interact  total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
1989  Function  Navigator  sendBeacon    1132             1085   4685      3613      0.011954            0.012742          0.395376             3.096326        77.118463
```
