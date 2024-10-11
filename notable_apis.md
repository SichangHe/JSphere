# Notable APIs

Out of 400 most popular APIs:

```py
           api_type                       this                     attr  appear  appear_interact    total  interact  %total/total  %interact/interact  avg%total/script  avg%interact/script  %interact/total
16281      Function             HTMLDivElement                  matches     843              835  1115182   1064906      4.807023            6.144259          2.282807             2.758132        95.491678
3621            Get            TransitionEvent                   target     326              326   884580    883460      3.460662            5.166294          5.826075             6.594800        99.873386
9483       Function             HTMLDivElement            querySelector    1871             1647   847881    808260      1.416274            2.079385          2.040353             1.344933        95.327057
3378       Function      CustomElementRegistry                      get     101               71   828723    806370     12.442614           13.151448          5.779473             2.220260        97.302718
14414           Get                      Event                   target    2002             1903   824110    783286      1.179062            1.482671          4.650736             5.382586        95.046292
16594      Function                Performance                      now    2764             2340   624855    498159      0.960439            1.144829          3.490532             3.096365        79.723936
13516           Get                     Window                 location    9423             7181   579071    319716      0.664399            0.615618          6.606676             4.230041        55.211882
16209      Function             HTMLDivElement         querySelectorAll    2294             2227   574049    442116      0.767773            0.923417          1.696780             1.783361        77.017119
5904            Get             HTMLDivElement                classList    2137             1910   435096    351005      0.811707            0.916675          2.908658             2.905556        80.673001
17431           Get               HTMLDocument                 nodeType    1153              969   419956    348949      0.773276            0.978419          1.682256             1.831237        83.091800
11333      Function             HTMLDivElement                  closest    1111             1109   415799     62022      1.477813            0.420875          2.660322             3.038853        14.916342
5142            Get                      Event                  keyCode    1147             1147   376969    361243      0.682080            0.925483          2.624004             9.471046        95.828304
14908           Get                      Event                      key     790              786   344674    329328      0.900894            1.128496          2.078672             4.175591        95.547677
4078       Function             HTMLDivElement                 contains     542              535   303535    254118      0.702358            0.960562          1.509068             3.241954        83.719505
5498            Get             HTMLDivElement                className     904              870   299901    263160      0.837205            1.027364          2.385866             2.627550        87.748957
2457            Get                     Window         getComputedStyle    1535             1310   295456    159215      0.592931            0.438401          1.151197             0.846097        53.887889
2014       Function               HTMLDocument            createElement    9320             6330   286107    122524      0.296257            0.219127          2.612151             0.967649        42.824538
9545            Get                      Event                    which     455              454   263921    248376      0.621834            0.818845          1.011871             1.339680        94.109980
7048       Function             HTMLDivElement         addEventListener    2514             2184   252068    107180      0.391858            0.234839          2.477123             1.046851        42.520272
9862            Get          HTMLAnchorElement                 nodeType    1250             1203   250886    102360      0.416466            0.238107          0.954481             0.410062        40.799407
7499            Get                 MouseEvent                   target    2602             2602   243446    243446      0.353644            0.459806          2.971607             4.680082       100.000000
3346            Get                    DOMRect                      top    1266             1213   227425    144601      0.468570            0.443659          1.414995             1.919121        63.581840
5732       Function               HTMLDocument         querySelectorAll    4647             3765   223991    187374      0.332157            0.412884          1.507670             0.883315        83.652468
8406            Get                     Window              performance    3257             2539   223517    126555      0.347078            0.293616          2.802016             1.382159        56.619854
4999            Get                  ImageData                     data      22               12   218417     17777     14.651612           16.882722          6.550062             2.413431         8.139018
16481           Get                    DOMRect                     left    1177             1134   212885    126981      0.441333            0.387885          1.458221             1.986245        59.647697
11541      Function               DOMTokenList                 contains    1919             1724   210971    141308      0.421512            0.391151          2.304020             2.127485        66.979822
3329            Get                      Event                  ctrlKey     543              533   209527    208734      0.494948            0.654059          1.262094             3.066172        99.621528
14621           Get                      Event                timeStamp    1033              944   203949    199608      0.405411            0.522149          0.740702             0.852084        97.871527
4138            Get                      Event           changedTouches     412              408   195658    195448      0.507606            0.648649          1.343745             1.961513        99.892670
10053           Get            HTMLSpanElement                  tagName     702              663   193630     81431      0.472738            0.266883          1.569983             0.315915        42.054950
2996            Get               HTMLDocument                   cookie    5578             4147   172695    110544      0.324422            0.336975          7.789128             2.641675        64.011118
7105            Get                      Event         defaultPrevented     714              690   171461    167435      0.374097            0.499074          0.737214             0.976114        97.651944
6714            Get            HTMLSpanElement                    style     548              504   167025     11671      0.517220            0.051895          3.090145             1.050911         6.987577
968             Get          HTMLAnchorElement                     href    2456             2328   145107    135169      0.502295            0.942538          1.435041             1.251417        93.151261
4177            Get                Performance                   timing    1679             1332   143633    127130      0.302955            0.382869          2.240215             0.829030        88.510301
14823      Function                     Window         getComputedStyle    1697             1384   143326     75800      0.299979            0.220471          1.873741             2.419006        52.886427
7305            Get            HTMLMetaElement                  dataset     335              295   142890    130639      0.982850            3.175198          1.974473             0.559279        91.426272
12098           Get          PerformanceTiming          navigationStart    1421             1228   136193    124766      0.302260            0.397229          1.608191             0.654052        91.609701
14284           Get             MutationRecord                   target     114              109   136183    124456      2.137970            2.359855          2.534340             4.659148        91.388793
1861            Get          HTMLAnchorElement         addEventListener    1370             1178   131340     29593      0.307599            0.098327          7.717213             0.833458        22.531597
10400           Get                      Event                  metaKey     528              518   128645    128019      0.305513            0.402858          1.198076             3.016747        99.513390
4750            Get                      Event                 shiftKey     491              481   126416    125790      0.300380            0.396070          0.798485             1.127302        99.504810
15693           Get                     Window                  history    1452             1223   123512     37555      0.255723            0.114506          0.727469             0.699028        30.405952
5048            Get                      Event                   altKey     556              551   123345    122726      0.288138            0.378780          1.216686             2.985656        99.498156
2211            Get                     Window         addEventListener    7893             6191   122537     31256      0.140030            0.056707          2.405811             0.710843        25.507398
13441           Get  IntersectionObserverEntry       boundingClientRect     135              118   121778    115749      2.683412            2.996992          0.959645             1.765307        95.049188
15065           Get                      Event            relatedTarget     354              340   120531    119802      0.354351            0.449621          0.857684             1.087789        99.395176
595        Function          HTMLAnchorElement               isSameNode      30               30   117855    117855      8.029145           12.948267          7.101826            11.841353       100.000000
911        Function                HTMLElement             getAttribute     902              860   117772     31042      0.206437            0.074248          0.942646             0.938351        26.357708
12704      Function                    Storage                  setItem    2530             2151   117494    100433      0.229494            0.285617          1.399357             0.855013        85.479259
4182            Get                      Event                  touches     104              104   117488    117488      1.273323            1.823082          4.985049             5.382803       100.000000
3753            Get             HTMLDivElement    getBoundingClientRect    1300             1148   115034     89611      0.252748            0.299641          1.880810             2.221885        77.899578
3222            Get                      Event                   button     237              228   115014    114410      0.373357            0.467717          1.213677             1.483833        99.474847
8221            Get                      Event              pointerType     215              211   113740    113504      0.392012            0.482340          1.327292             1.639816        99.792509
18              Get                      Event                 charCode     234              234   111544    110954      0.343765            0.432244          1.156061             1.442831        99.471061
3947       Function          HTMLAnchorElement             setAttribute    1354             1154   110406     80822      0.276005            0.419018          1.176040             0.787740        73.204355
15997           Get             HTMLDivElement                  dataset    1019              941   110241     58327      0.305932            0.209428          2.886125             1.568396        52.908627
7327            Get               HTMLDocument          createElementNS     797              672   110043     29138      0.713621            0.383323          1.456620             0.289284        26.478740
15619      Function               HTMLDocument            querySelector    5256             3878   109894     70588      0.143162            0.159666          5.420111             2.722504        64.232806
14249           Get                HTMLElement                 contains     156              155   109845      6882      0.529747            0.077596          1.327992             0.179596         6.265192
16323           Get        CSSStyleDeclaration                 position     341              315   106935     93720      0.345195            0.415523          0.474251             0.340467        87.642026
2370            Get               HTMLDocument         addEventListener    6238             5288   106708     34235      0.119114            0.059167          1.832010             0.636335        32.082880
4579            Get  PerformanceResourceTiming                     name     459              421   104968     48263      0.501391            0.351048          7.462511             6.226703        45.978774
11476      Function           DocumentFragment              appendChild     555              540   103875     94235      0.567692            0.809485          2.425293             3.739579        90.719615
17561           Get             HTMLDivElement      removeEventListener     269              261   102308     93036      0.367874            0.461578          0.433881             0.630124        90.937170
14811      Function           HTMLInputElement                  matches     120              120   101906    101899      0.937924            1.010790          1.194562             1.553083        99.993131
2818            Get  IntersectionObserverEntry           isIntersecting     835              815   100920     74725      0.674087            0.814893          5.613972             7.372370        74.043797
10958           Get             MutationRecord            attributeName      89               81   100443     98200      1.816932            1.910443         13.742685            17.799135        97.766893
15809      Function          HTMLAnchorElement          removeAttribute     373              347    99233     96946      1.153120            1.474503          0.726152             0.792383        97.695323
8141            Get                      Event                pointerId     203              199    98769     98559      0.355878            0.442541          1.309350             1.638151        99.787383
9253            Get                      Event                    state     203              199    98769     98559      0.355878            0.442541          1.309350             1.638151        99.787383
15723           Get                      Event                    pageX     337              333    95672     95055      0.270339            0.381892          0.936991             1.368982        99.355088
17872           Get                      Event                    pageY     337              333    95672     95055      0.270339            0.381892          0.936991             1.368982        99.355088
1914       Function            HTMLBodyElement              appendChild    2017             1641    95122     87854      0.192521            0.238969          2.019357             1.951309        92.359286
66              Get                    DOMRect                   bottom     718              690    94763     38693      0.584749            0.580383          1.550073             2.244249        40.831337
1215            Get             HTMLDivElement              textContent     815              784    93982     72828      0.622264            0.822394          1.921985             1.384557        77.491435
15126           Get                     Window                  Reflect     815              650    93695       985      0.227729            0.003498          1.616386             0.718477         1.051283
6681            Get               HTMLDocument     getElementsByTagName    4894             3152    91115     76951      0.158297            0.196486          2.076936             0.360218        84.454810
6007       Function             HTMLDivElement              appendChild    2328             2052    87416     23624      0.157654            0.065366          2.490404             1.678324        27.024801
14338           Get                      Event                  clientY     227              223    86343     85736      0.274052            0.346012          1.155634             1.443879        99.296990
7370            Get                      Event                  clientX     223              219    86333     85726      0.274112            0.346119          1.174707             1.468122        99.296908
4883            Get          HTMLAnchorElement                classList     871              842    84332     70097      0.201348            0.278285          2.291487             2.019763        83.120286
16115           Get                 MouseEvent                     type     755              755    83349     83349      0.168377            0.221242          1.248696             1.422853       100.000000
6772            Get               HTMLDocument                   hidden    1603             1537    82147     47474      0.200568            0.175928          1.534644             2.676095        57.791520
8011       Function                EventTarget            dispatchEvent     110              110    81800     63914      0.311552            0.299519          0.360584             0.373508        78.134474
12711      Function               HTMLDocument           getElementById    5559             3690    81282     42177      0.114240            0.095513          6.735331             2.271519        51.889717
11100      Function             HTMLDivElement    getBoundingClientRect    1295             1148    81101     61989      0.178199            0.207279          1.526008             1.561731        76.434323
2723       Function                    Storage                  getItem    4445             3465    80359     53636      0.111631            0.125812          2.384386             1.275023        66.745480
17488           Get          HTMLAnchorElement                 disabled      42               42    79569     79569      2.102839            2.148920          1.905932             1.917607       100.000000
8714   Construction                      Event                     None     641              543    79374     63053      0.198452            0.214734          1.748308             0.696653        79.437851
5616       Function          HTMLAnchorElement         addEventListener    1346             1174    77789     18943      0.184291            0.063770          6.796528             0.760201        24.351772
611             Get                HTMLElement         addEventListener     755              743    77573      2900      0.456644            0.026392          1.805401             1.324329         3.738414
17667           Get                Performance               timeOrigin     638              498    77460     75360      0.467205            0.675298          0.726314             0.243126        97.288923
9166            Get                     Window    requestAnimationFrame    1735             1609    77177     30706      0.153209            0.090460          2.655344             3.087896        39.786465
2338            Get                      Event                  screenY     208              204    76925     76328      0.269005            0.342615          1.238773             1.549703        99.223919
9977            Get                      Event                  screenX     208              204    76925     76328      0.269005            0.342615          1.238773             1.549703        99.223919
2418       Function            HTMLBodyElement              removeChild     667              517    76466     75216      0.460771            0.746417          1.423947             0.993174        98.365287
10247           Get            HTMLBodyElement              constructor      37               37    75365     32587      2.267393            2.680637          2.514466             2.597025        43.238904
14409      Function               DOMTokenList                      add    2140             1859    75038     50171      0.119709            0.129215          2.026993             1.599572        66.860791
1353            Get                    DOMRect                    width     898              766    73558     50213      0.191047            0.175964          1.478908             1.038934        68.263139
8987            Get                    DOMRect                    right     721              696    72803     18396      0.448942            0.269434          0.867479             1.108576        25.268189
17217           Get                     Window               matchMedia    1611             1379    72404     20964      0.157922            0.062416          2.640280             2.069632        28.954201
9493            Set                      Event                     flow     121              121    72147     57173      0.262724            0.259411          0.292955             0.308683        79.245152
4787            Get           HTMLImageElement    getBoundingClientRect     471              462    71338     58793      0.581605            0.671657          0.709196             0.731832        82.414702
3085            Get                      Event                  offsetX     155              155    70920     70340      0.249699            0.317938          0.758509             0.929270        99.182177
4424            Get                      Event                  offsetY     155              155    70920     70340      0.249699            0.317938          0.758509             0.929270        99.182177
14697           Get              HTMLLIElement            querySelector     324              316    68679     57442      0.438484            0.410091          1.165981             0.755493        83.638376
4801            Get          HTMLAnchorElement              textContent     834              818    68587     22234      0.426822            0.236131          1.026544             0.598604        32.417222
568             Get                     Window      removeEventListener    2851             2478    67894     22285      0.106554            0.051886          0.643697             0.698827        32.823224
12336           Get                HTMLElement                       id     396              376    66643      6243      0.211400            0.026531          0.862097             0.147936         9.367826
16137           Get                   Location                   search    5601             4460    65008     34421      0.089337            0.081936          2.977207             2.503777        52.948868
10354           Get                   Location                     hash    1782             1382    64491     49026      0.136625            0.146484          1.765293             0.619653        76.019910
9312            Get               HTMLDocument      removeEventListener    1123             1024    64243     25996      0.226914            0.159079          0.461634             0.592738        40.465109
7772       Function                    Storage               removeItem    1630             1325    62618     55509      0.145805            0.179347          1.016465             0.985584        88.647034
12900           Get  IntersectionObserverEntry                   target     515              496    62370     50038      0.595738            0.825574          6.585918             9.794942        80.227674
13380           Get           HTMLImageElement                      src     324              278    61949     55192      0.248963            0.279343          1.549264             0.817876        89.092641
13971      Function        CSSStyleDeclaration         getPropertyValue     877              850    60107     18237      0.150438            0.063671          0.519474             0.272330        30.340892
12778      Function               HTMLDocument     getElementsByTagName    4775             3038    60070     46347      0.104988            0.118652          2.101945             0.346168        77.154986
5032            Get                 MouseEvent                  clientY     504              504    59862     59862      0.150060            0.198041          0.564462             0.695423       100.000000
15651           Get                 MouseEvent                  clientX     502              502    59859     59859      0.150075            0.198069          0.566498             0.697981       100.000000
16479           Get          HTMLScriptElement                 contains      50               50    59428      4725      0.497370            0.195014          0.440591             0.120095         7.950798
5017            Get               HTMLDocument              createEvent     946              769    58567     20951      0.453316            0.292947          1.299261             0.678529        35.772705
12149           Get                     Window     cancelAnimationFrame     753              709    57477     16721      0.369145            0.239573          0.606008             0.692131        29.091637
18119      Function                     Window         addEventListener    7166             5668    56988     12036      0.087308            0.031169          1.998809             0.587056        21.120236
1619       Function               DOMTokenList                   remove    1455             1297    56450     33813      0.093652            0.088424          1.097433             1.080078        59.899026
17146           Get                 MouseEvent                  ctrlKey     568              568    54139     54139      0.134587            0.176825          0.225626             0.324791       100.000000
12805           Get              HTMLLIElement                classList     432              379    54046     24570      0.364803            0.213858          1.165796             0.336717        45.461274
6363            Get           HTMLInputElement                    value     959              918    53080     43990      0.116852            0.140776          3.371986             3.226430        82.874906
4864       Function        CSSStyleDeclaration              setProperty     844              733    52840     21599      0.344912            0.211022          3.304432             2.357075        40.876230
13983           Get             XMLHttpRequest               readyState    1799             1460    52660     41546      0.117972            0.138164          2.416760             1.615187        78.894797
11621           Get          HTMLScriptElement         querySelectorAll     255              254    52491      7958      0.222868            0.065104          0.889439             0.412583        15.160694
17248           Get             AnimationEvent                   target     156              154    51350     26463      0.946958            0.695481          1.293656             2.294568        51.534567
7970            Get            HTMLBodyElement         querySelectorAll     899              887    49554     47400      0.104660            0.162933          0.451424             0.528431        95.653227
16722           Get                    DOMRect                   height     848              728    48913     33326      0.132691            0.115341          0.943817             0.621586        68.133216
1007       Function            HTMLHtmlElement                 contains     239              227    48804     19490      0.149274            0.077270          0.346510             0.126978        39.935251
1586       Function                HTMLElement                 contains     156              155    48695      5210      0.234840            0.058744          0.499611             0.158083        10.699250
10761           Get              HTMLLIElement                  matches     194              194    48675     38829      0.448194            0.417750          0.121070             0.148470        79.771957
13396           Get                 MouseEvent                timeStamp     743              743    48631     48631      0.109854            0.142058          0.730755             1.041972       100.000000
8125            Get                 MouseEvent         defaultPrevented     717              717    48346     48346      0.113253            0.151701          0.240732             0.434295       100.000000
5205       Function             HTMLDivElement      removeEventListener     260              252    47554     43494      0.170548            0.215572          0.371203             0.479496        91.462338
6411       Function          HTMLAnchorElement    getBoundingClientRect     315              308    45499     18954      0.178495            0.126211          0.733821             0.767323        41.658058
9289       Function              HTMLLIElement            querySelector     324              316    44104     34549      0.281584            0.246653          1.151900             0.741847        78.335298
10020           Set          HTMLAnchorElement                     href    2781             2633    43452     29806      0.078498            0.084109          0.583468             0.409084        68.595232
10485      Function                Performance               get timing    1518             1263    42977     34680      0.093326            0.108573          2.111314             0.486240        80.694325
8749       Function            HTMLBodyElement         querySelectorAll     909              897    42696     40672      0.086075            0.131413          0.442494             0.518009        95.259509
10978      Function             HTMLDivElement          removeAttribute     960              905    42597     28256      0.141140            0.149708          0.946574             0.483958        66.333310
```

- Get `.*Event`, `Location` (some attributes), `HTMLInputElement.value` and
    Function `addEventListener` indicate **frontend processing**
    (maybe UX enhancement?).
- Function `createElement`, `createElementNS`, `appendChild`,
    `CSSStyleDeclaration.setProperty`
    before interaction begins indicate **DOM element generation**.
- Function `removeAttribute`, `matchMedia`, `removeChild`,
    `requestAnimationFrame`, `cancelAnimationFrame` and Set `hidden`,
    `disabled` indicate **UX enhancement**.
- `Performance` and `PerformanceTiming` are **extensional features**.

Intermediate conclusions:

- `XMLHttpRequest` (and `fetch`): send/fetch data from server, one of:
    - Form submission, CRUD → **frontend processing**.
    - Auth, tracking, telemetry → **extensional features**.
    - Load data onto page → **DOM element generation**
        (but will be detected through other API calls)?

TODO: What do these mean?

- `querySelector[All]`, `getElement[s]By.*`: get a node, but then what?
- `contains`: search for a node or string, but then what?
- `DOMRect`
- `Storage`: local storage, but then what?
- `DOMTokenList`: store/retrieve info on node, but then what?
- `IntersectionObserverEntry`
- `getBoundingClientRect`
