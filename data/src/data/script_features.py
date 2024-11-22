import itertools

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.axes import Axes
from matplotlib.figure import Figure
from matplotlib_set_diagrams import EulerDiagram

from data import CsvFile, smart_sample

script_features_csv = CsvFile(
    "script_features3.csv.gz",
    "https://github.com/SichangHe/JSphere/releases/download/data-issue-5/script_features3.csv.gz",
)

df = pd.read_csv(script_features_csv.path, sep="\t", engine="pyarrow")
all_columns = [
    "subdomain_rank",
    "size",
    "rewritten",
    "total_call",
    "silent",
    "sure_frontend_processing",
    "sure_dom_element_generation",
    "sure_ux_enhancement",
    "sure_extensional_featuers",
    "has_request",
    "queries_element",
    "uses_storage",
]
category_columns = all_columns[4:]
sure_columns = category_columns[:5]

df["silent"] = (df["total_call"] <= 0).astype(np.int32)

df.describe()
"""
                 id          size    total_call  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers   has_request  queries_element  uses_storage        silent
count  2.102795e+07  2.102795e+07  2.102795e+07              2.102795e+07                 2.102795e+07         2.102795e+07               2.102795e+07  2.102795e+07     2.102795e+07  2.102795e+07  2.102795e+07
mean   7.812512e+03  1.244209e+03  1.701549e+01              1.608682e-02                 3.437615e-03         1.261939e-03               1.552552e-03  7.999352e-04     5.746826e-03  1.240301e-03  8.356882e-01
std    7.367579e+03  3.022778e+04  1.165218e+03              1.258095e-01                 5.853031e-02         3.550136e-02               3.937184e-02  2.827181e-02     7.558969e-02  3.519607e-02  3.705582e-01
min    3.000000e+00  1.000000e+00  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  0.000000e+00
25%    2.526000e+03  2.000000e+01  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  1.000000e+00
50%    5.635000e+03  4.800000e+01  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  1.000000e+00
75%    1.089500e+04  8.800000e+01  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  1.000000e+00
max    5.748600e+04  6.071970e+06  1.091761e+06              1.000000e+00                 1.000000e+00         1.000000e+00               1.000000e+00  1.000000e+00     1.000000e+00  1.000000e+00  1.000000e+00
"""

# Silent script reason.
df_silent = df[df["silent"] > 0]
size_silent = df_silent["size"].sum()
df_smaller_silent = df_silent[df_silent["size"] <= 1000]
size_smaller_silent = df_smaller_silent["size"].sum()
print(
    f"""{len(df_smaller_silent)} ({len(df_smaller_silent) * 100.0 / len(df_silent):.2f}%) \
silent scripts are smaller than 1kB, \
{size_smaller_silent / 1_000_000:.1f}MB \
({size_smaller_silent * 100.0 / size_silent:.2f}%)."""
)
"""
17289267 (98.39%) silent scripts are smaller than 1kB, 1288.1MB (10.02%).
"""

# Large scripts.
df_large = df[df["size"] > 10_000]
size_large = df_large["size"].sum()
print(
    f"{len(df_large)} ({len(df_large) * 100.0 / len(df):.2f}%) scripts larger than 10kB, \
{size_large / 1_000_000:.1f}MB ({size_large * 100.0 / df['size'].sum():.2f}%)."
)
"""
146979 (0.70%) scripts larger than 10kB, 23510.3MB (89.86%)
"""

# Subdomain rank
df_subdomains = pd.read_csv(
    "../headless_browser/input_urls.csv",
    names=["rank", "subdomain"],
    engine="pyarrow",
)
subdomain_ranks = dict(zip(df_subdomains["subdomain"], df_subdomains["rank"]))
df["subdomain_rank"] = df["subdomain"].map(lambda s: subdomain_ranks[s])

# Scripts rewritten.
df_rewritten = df[df["rewritten"] > 0]
df_rewritten.describe()
"""
                 id          size    total_call  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers   has_request  queries_element  uses_storage        silent
count  2.083600e+07  2.083600e+07  2.083600e+07              2.083600e+07                 2.083600e+07         2.083600e+07               2.083600e+07  2.083600e+07     2.083600e+07  2.083600e+07  2.083600e+07
mean   7.836371e+03  1.119352e+03  1.606595e+01              1.541894e-02                 2.984689e-03         1.086197e-03               1.356018e-03  6.992704e-04     4.926472e-03  1.100403e-03  8.384010e-01
std    7.373476e+03  2.567862e+04  1.023712e+03              1.232120e-01                 5.455072e-02         3.293960e-02               3.679918e-02  2.643447e-02     7.001573e-02  3.315407e-02  3.680825e-01
min    3.000000e+00  1.000000e+00  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  0.000000e+00
25%    2.546000e+03  2.000000e+01  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  1.000000e+00
50%    5.654000e+03  4.700000e+01  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  1.000000e+00
75%    1.090900e+04  8.600000e+01  0.000000e+00              0.000000e+00                 0.000000e+00         0.000000e+00               0.000000e+00  0.000000e+00     0.000000e+00  0.000000e+00  1.000000e+00
max    5.748600e+04  5.488592e+06  1.091761e+06              1.000000e+00                 1.000000e+00         1.000000e+00               1.000000e+00  1.000000e+00     1.000000e+00  1.000000e+00  1.000000e+00
"""

# Scripts not rewritten.
df_not_rewritten = df[df["rewritten"] <= 0]
df_not_rewritten.describe()
"""
                  id          size    total_call  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers    has_request  queries_element   uses_storage         silent
count  191950.000000  1.919500e+05  1.919500e+05             191950.000000                191950.000000        191950.000000              191950.000000  191950.000000    191950.000000  191950.000000  191950.000000
mean     5222.649054  1.479730e+04  1.200871e+02                  0.088586                     0.052602             0.020339                   0.022886       0.011727         0.094796       0.016426       0.541219
std      6170.646657  1.683314e+05  5.913536e+03                  0.284145                     0.223239             0.141156                   0.149541       0.107655         0.292933       0.127108       0.498299
min         3.000000  8.000000e+00  0.000000e+00                  0.000000                     0.000000             0.000000                   0.000000       0.000000         0.000000       0.000000       0.000000
25%       100.000000  1.080000e+02  0.000000e+00                  0.000000                     0.000000             0.000000                   0.000000       0.000000         0.000000       0.000000       0.000000
50%      3048.000000  2.520000e+02  0.000000e+00                  0.000000                     0.000000             0.000000                   0.000000       0.000000         0.000000       0.000000       1.000000
75%      9539.000000  8.650000e+02  2.000000e+00                  0.000000                     0.000000             0.000000                   0.000000       0.000000         0.000000       0.000000       1.000000
max     57433.000000  6.071970e+06  1.007990e+06                  1.000000                     1.000000             1.000000                   1.000000       1.000000         1.000000       1.000000       1.000000
"""

# Rewritten vs not rewritten.
n_rewritten = len(df_rewritten)
n_not_rewritten = len(df_not_rewritten)
n_total = n_rewritten + n_not_rewritten
size_rewritten = df_rewritten["size"].sum()
size_not_rewritten = df_not_rewritten["size"].sum()
size_total = size_rewritten + size_not_rewritten
print(
    f"{n_rewritten} ({n_rewritten * 100.0 / n_total:.2f}%) rewritten scripts, \
{size_rewritten / 1_000_000:.1f}MB ({size_rewritten * 100.0 / size_total:.2f}%)."
)
"""
20836004 (99.09%) rewritten scripts, 23322.8MB (89.14%).
"""

# Basic counts.
n_scripts = len(df)
total_size = df["size"].sum()
n_silent = df["silent"].sum()
n_sure_frontend_processing = df["sure_frontend_processing"].sum()
n_sure_dom_element_generation = df["sure_dom_element_generation"].sum()
n_sure_ux_enhancement = df["sure_ux_enhancement"].sum()
n_sure_extensional_featuers = df["sure_extensional_featuers"].sum()
n_has_request = df["has_request"].sum()
n_queries_element = df["queries_element"].sum()
n_uses_storage = df["uses_storage"].sum()
size_silent = df[df["silent"] == 1]["size"].sum()
size_sure_frontend_processing = df[df["sure_frontend_processing"] == 1]["size"].sum()
size_sure_dom_element_generation = df[df["sure_dom_element_generation"] == 1][
    "size"
].sum()
size_sure_ux_enhancement = df[df["sure_ux_enhancement"] == 1]["size"].sum()
size_sure_extensional_featuers = df[df["sure_extensional_featuers"] == 1]["size"].sum()
size_has_request = df[df["has_request"] == 1]["size"].sum()
size_queries_element = df[df["queries_element"] == 1]["size"].sum()
size_uses_storage = df[df["uses_storage"] == 1]["size"].sum()
print(f"""{n_scripts} scripts in total ({total_size / 1_000_000:.1f}MB).
{n_silent} ({n_silent * 100.0 / n_scripts:.2f}%) silent, {size_silent /1_000_000:.1f}MB ({size_silent * 100.0 / total_size:.2f}%),
{n_sure_frontend_processing} ({n_sure_frontend_processing * 100.0 / n_scripts:.2f}%) sure_frontend_processing, {size_sure_frontend_processing /1_000_000:.1f}MB ({size_sure_frontend_processing * 100.0 / total_size:.2f}%),
{n_sure_dom_element_generation} ({n_sure_dom_element_generation * 100.0 / n_scripts:.2f}%) sure_dom_element_generation, {size_sure_dom_element_generation /1_000_000:.1f}MB ({size_sure_dom_element_generation * 100.0 / total_size:.2f}%),
{n_sure_ux_enhancement} ({n_sure_ux_enhancement * 100.0 / n_scripts:.2f}%) sure_ux_enhancement, {size_sure_ux_enhancement /1_000_000:.1f}MB ({size_sure_ux_enhancement * 100.0 / total_size:.2f}%),
{n_sure_extensional_featuers} ({n_sure_extensional_featuers * 100.0 / n_scripts:.2f}%) sure_extensional_featuers, {size_sure_extensional_featuers /1_000_000:.1f}MB ({size_sure_extensional_featuers * 100.0 / total_size:.2f}%),
{n_has_request} ({n_has_request * 100.0 / n_scripts:.2f}%) has_request, {size_has_request /1_000_000:.1f}MB ({size_has_request * 100.0 / total_size:.2f}%),
{n_queries_element} ({n_queries_element * 100.0 / n_scripts:.2f}%) queries_element, {size_queries_element /1_000_000:.1f}MB ({size_queries_element * 100.0 / total_size:.2f}%),
{n_uses_storage} ({n_uses_storage * 100.0 / n_scripts:.2f}%) uses_storage, {size_uses_storage /1_000_000:.1f}MB ({size_uses_storage * 100.0 / total_size:.2f}%).
""")
"""
21027954 scripts in total (26163.2MB).
17572814 (83.57%) silent, 12850.4MB (49.12%),
338273 (1.61%) sure_frontend_processing, 9469.6MB (36.19%),
72286 (0.34%) sure_dom_element_generation, 6250.1MB (23.89%),
26536 (0.13%) sure_ux_enhancement, 5392.0MB (20.61%),
32647 (0.16%) sure_extensional_featuers, 5617.2MB (21.47%),
16821 (0.08%) has_request, 4318.8MB (16.51%),
120844 (0.57%) queries_element, 7719.9MB (29.51%),
26081 (0.12%) uses_storage, 5142.6MB (19.66%).
"""

# Combinations.
for name1, name2 in itertools.combinations(category_columns[1:], 2):
    subset = df[(df[name1] == 1) & (df[name2] == 1)]
    n_all = subset.shape[0]
    size_subset = subset["size"].sum()
    print(
        f"{n_all} ({n_all * 100.0 / n_scripts:.2f}%) \
scripts have both {name1} and {name2}. Size: {size_subset / 1_000_000:.1f}MB \
({size_subset * 100.0 / total_size:.2f}%)"
    )
"""
20763 (0.10%) scripts have both sure_frontend_processing and sure_dom_element_generation. Size: 5924.2MB (22.64%)
15544 (0.07%) scripts have both sure_frontend_processing and sure_ux_enhancement. Size: 5229.6MB (19.99%)
13557 (0.06%) scripts have both sure_frontend_processing and sure_extensional_featuers. Size: 5540.2MB (21.18%)
10514 (0.05%) scripts have both sure_frontend_processing and has_request. Size: 4276.4MB (16.35%)
33064 (0.16%) scripts have both sure_frontend_processing and queries_element. Size: 7174.1MB (27.42%)
13332 (0.06%) scripts have both sure_frontend_processing and uses_storage. Size: 5067.7MB (19.37%)
12910 (0.06%) scripts have both sure_dom_element_generation and sure_ux_enhancement. Size: 4537.7MB (17.34%)
6207 (0.03%) scripts have both sure_dom_element_generation and sure_extensional_featuers. Size: 4006.9MB (15.31%)
5694 (0.03%) scripts have both sure_dom_element_generation and has_request. Size: 3081.3MB (11.78%)
29577 (0.14%) scripts have both sure_dom_element_generation and queries_element. Size: 5575.6MB (21.31%)
7018 (0.03%) scripts have both sure_dom_element_generation and uses_storage. Size: 3569.3MB (13.64%)
5369 (0.03%) scripts have both sure_ux_enhancement and sure_extensional_featuers. Size: 3667.5MB (14.02%)
4519 (0.02%) scripts have both sure_ux_enhancement and has_request. Size: 3041.1MB (11.62%)
15820 (0.08%) scripts have both sure_ux_enhancement and queries_element. Size: 4875.0MB (18.63%)
5109 (0.02%) scripts have both sure_ux_enhancement and uses_storage. Size: 3400.2MB (13.00%)
4926 (0.02%) scripts have both sure_extensional_featuers and has_request. Size: 3572.3MB (13.65%)
7871 (0.04%) scripts have both sure_extensional_featuers and queries_element. Size: 4812.3MB (18.39%)
5215 (0.02%) scripts have both sure_extensional_featuers and uses_storage. Size: 3815.2MB (14.58%)
7730 (0.04%) scripts have both has_request and queries_element. Size: 3857.2MB (14.74%)
6573 (0.03%) scripts have both has_request and uses_storage. Size: 3583.0MB (13.69%)
9930 (0.05%) scripts have both queries_element and uses_storage. Size: 4640.1MB (17.74%)
"""

# 3-combinations.
for name1, name2, name3 in itertools.combinations(sure_columns[1:], 3):
    subset = df[(df[name1] == 1) & (df[name2] == 1) & (df[name3] == 1)]
    n_all = subset.shape[0]
    size_subset = subset["size"].sum()
    print(
        f"{n_all} ({n_all * 100.0 / n_scripts:.2f}%) \
scripts have all {name1}, {name2}, and {name3}. Size: {size_subset / 1_000_000:.1f}MB \
({size_subset * 100.0 / total_size:.2f}%)"
    )
"""
10291 (0.05%) scripts have all sure_frontend_processing, sure_dom_element_generation, and sure_ux_enhancement. Size: 4483.3MB (17.14%)
6022 (0.03%) scripts have all sure_frontend_processing, sure_dom_element_generation, and sure_extensional_featuers. Size: 3975.0MB (15.19%)
5241 (0.02%) scripts have all sure_frontend_processing, sure_ux_enhancement, and sure_extensional_featuers. Size: 3664.5MB (14.01%)
4078 (0.02%) scripts have all sure_dom_element_generation, sure_ux_enhancement, and sure_extensional_featuers. Size: 3235.9MB (12.37%)
"""

# 4-combination.
subset = df[df[sure_columns[1:]].all(axis=1)]
n_all = subset.shape[0]
size_subset = subset["size"].sum()
print(
    f"{n_all} ({n_all * 100.0 / n_scripts:.2f}%) \
scripts have all sure categories. Size: {size_subset / 1_000_000:.1f}MB \
({size_subset * 100.0 / total_size:.2f}%)"
)
print(subset.describe())
"""
4061 (0.02%) scripts have all sure categories. Size: 3235.2MB (12.37%)
                 id          size    total_call  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers  has_request  queries_element  uses_storage  silent
count   4061.000000  4.061000e+03  4.061000e+03                    4061.0                       4061.0               4061.0                     4061.0  4061.000000      4061.000000   4061.000000  4061.0
mean     589.822458  7.966478e+05  1.005670e+04                       1.0                          1.0                  1.0                        1.0     0.479192         0.801773      0.515390     0.0
std     1778.411100  1.269591e+06  4.406802e+04                       0.0                          0.0                  0.0                        0.0     0.499628         0.398713      0.499825     0.0
min        5.000000  3.074000e+03  3.200000e+01                       1.0                          1.0                  1.0                        1.0     0.000000         0.000000      0.000000     0.0
25%       17.000000  1.299960e+05  2.530000e+02                       1.0                          1.0                  1.0                        1.0     0.000000         1.000000      0.000000     0.0
50%       50.000000  2.107060e+05  1.011000e+03                       1.0                          1.0                  1.0                        1.0     0.000000         1.000000      1.000000     0.0
75%      283.000000  8.386520e+05  6.946000e+03                       1.0                          1.0                  1.0                        1.0     1.000000         1.000000      1.000000     0.0
max    34388.000000  5.987415e+06  1.091761e+06                       1.0                          1.0                  1.0                        1.0     1.000000         1.000000      1.000000     0.0
"""
# NOTE: The large median size shows we did not split them.

# Does not seem to have strong correlations between features.
df[all_columns].corr()  # type: ignore[reportCallIssue]
"""
                             subdomain_rank      size  rewritten  total_call    silent  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers  has_request  queries_element  uses_storage
subdomain_rank                     1.000000  0.004444   0.010444   -0.001309 -0.003998                 -0.011032                     0.005252            -0.003425                   0.000585    -0.000978        -0.015328      0.003195
size                               0.004444  1.000000  -0.043035    0.056608 -0.038269                  0.113154                     0.165579             0.237483                   0.222832     0.239167         0.157545      0.228421
rewritten                          0.010444 -0.043035   1.000000   -0.008490  0.076273                 -0.055310                    -0.080623            -0.051576                  -0.052007    -0.037097        -0.113071     -0.041413
total_call                        -0.001309  0.056608  -0.008490    1.000000 -0.032933                  0.025988                     0.052352             0.081589                   0.054885     0.035398         0.029932      0.020719
silent                            -0.003998 -0.038269   0.076273   -0.032933  1.000000                 -0.288366                    -0.132454            -0.080164                  -0.088930    -0.063810        -0.171456     -0.079473
sure_frontend_processing          -0.011032  0.113154  -0.055310    0.025988 -0.288366                  1.000000                     0.126581             0.160958                   0.125115     0.136956         0.155620      0.138677
sure_dom_element_generation        0.005252  0.165579  -0.080623    0.052352 -0.132454                  0.126581                     1.000000             0.293375                   0.125775     0.161977         0.313452      0.159940
sure_ux_enhancement               -0.003425  0.237483  -0.051576    0.081589 -0.080164                  0.160958                     0.293375             1.000000                   0.181268     0.213109         0.277648      0.193194
sure_extensional_featuers          0.000585  0.222832  -0.052007    0.054885 -0.088930                  0.125115                     0.125775             0.181268                   1.000000     0.209339         0.122774      0.177579
has_request                       -0.000978  0.239167  -0.037097    0.035398 -0.063810                  0.136956                     0.161977             0.213109                   0.209339     1.000000         0.169864      0.313140
queries_element                   -0.015328  0.157545  -0.113071    0.029932 -0.171456                  0.155620                     0.313452             0.277648                   0.122774     0.169864         1.000000      0.174820
uses_storage                       0.003195  0.228421  -0.041413    0.020719 -0.079473                  0.138677                     0.159940             0.193194                   0.177579     0.313140         0.174820      1.000000
"""

# Count how many script are not in any "sure" category.
no_sure_scripts = df[(df[sure_columns] == 0).all(axis=1)]
size_no_sure_scripts = no_sure_scripts["size"].sum()
print(
    f"{len(no_sure_scripts)} scripts ({len(no_sure_scripts) * 100.0 / n_scripts:.2f}%) \
are not in any 'sure' categories, \
{size_no_sure_scripts / 1_000_000:.1f}MB ({size_no_sure_scripts * 100.0 / total_size:.2f}%)."
)
no_categories_scripts = df[(df[category_columns] == 0).all(axis=1)]
size_no_categories_scripts = no_categories_scripts["size"].sum()
print(
    f"{len(no_categories_scripts)} scripts \
({len(no_categories_scripts) * 100.0 / n_scripts:.2f}%) \
are not in any categories at all, \
{size_no_categories_scripts / 1_000_000:.1f}MB ({size_no_categories_scripts * 100.0 / total_size:.2f}%)."
)
"""
3038177 scripts (14.45%) are not in any 'sure' categories, 3366.6MB (12.87%).
2948586 scripts (14.02%) are not in any categories at all, 2997.4MB (11.46%).
"""

# No sure categories investigation.
print(no_sure_scripts.describe())
larger_no_sure_scripts = no_sure_scripts[no_sure_scripts["size"] > 10_000]
active_no_sure_scripts = no_sure_scripts[no_sure_scripts["total_call"] > 100]
n_smaller_no_sure_scripts = len(no_sure_scripts) - len(larger_no_sure_scripts)
size_larger_no_sure_scripts = larger_no_sure_scripts["size"].sum()
size_smaller_no_sure_scripts = size_no_sure_scripts - size_larger_no_sure_scripts
n_inactive_no_sure_scripts = len(no_sure_scripts) - len(active_no_sure_scripts)
size_active_no_sure_scripts = active_no_sure_scripts["size"].sum()
size_inactive_no_sure_scripts = size_no_sure_scripts - size_active_no_sure_scripts
no_sure_not_rewritten = no_sure_scripts[no_sure_scripts["rewritten"] <= 0]
n_no_sure_not_rewritten = len(no_sure_not_rewritten)
size_no_sure_not_rewritten = no_sure_not_rewritten["size"].sum()
print(f"""Among contexts w/o sure categories:
{n_smaller_no_sure_scripts} ({n_smaller_no_sure_scripts * 100.0 / len(no_sure_scripts):.2f}%) \
contexts are smaller than 10kB, size: \
{size_smaller_no_sure_scripts / 1_000_000:.1f}MB \
({size_smaller_no_sure_scripts * 100.0 / size_no_sure_scripts:.2f}%).
{n_inactive_no_sure_scripts} ({n_inactive_no_sure_scripts * 100.0 / len(no_sure_scripts):.2f}%) \
contexts have less than 100 total calls, size: \
{size_inactive_no_sure_scripts / 1_000_000:.1f}MB \
({size_inactive_no_sure_scripts * 100.0 / size_no_sure_scripts:.2f}%).
{n_no_sure_not_rewritten} ({n_no_sure_not_rewritten * 100.0 / len(no_sure_scripts):.2f}%) \
contexts are not rewritten, size: \
{size_no_sure_not_rewritten / 1_000_000:.1f}MB \
({size_no_sure_not_rewritten * 100.0 / size_no_sure_scripts:.2f}%).""")
"""
                 id          size    total_call  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers   has_request  queries_element  uses_storage     silent
count  3.038177e+06  3.038177e+06  3.038177e+06                 3038177.0                    3038177.0            3038177.0                  3038177.0  3.038177e+06     3.038177e+06  3.038177e+06  3038177.0
mean   7.487046e+03  1.108100e+03  8.803613e+01                       0.0                          0.0                  0.0                        0.0  2.030494e-03     2.355689e-02  4.033998e-03        0.0
std    8.289290e+03  2.254338e+04  1.584245e+03                       0.0                          0.0                  0.0                        0.0  4.501524e-02     1.516640e-01  6.338554e-02        0.0
min    3.000000e+00  1.000000e+00  1.000000e+00                       0.0                          0.0                  0.0                        0.0  0.000000e+00     0.000000e+00  0.000000e+00        0.0
25%    1.371000e+03  3.900000e+01  1.000000e+00                       0.0                          0.0                  0.0                        0.0  0.000000e+00     0.000000e+00  0.000000e+00        0.0
50%    4.830000e+03  7.400000e+01  2.000000e+00                       0.0                          0.0                  0.0                        0.0  0.000000e+00     0.000000e+00  0.000000e+00        0.0
75%    1.041100e+04  1.300000e+02  8.000000e+00                       0.0                          0.0                  0.0                        0.0  0.000000e+00     0.000000e+00  0.000000e+00        0.0
max    5.748500e+04  6.071970e+06  3.072610e+05                       0.0                          0.0                  0.0                        0.0  1.000000e+00     1.000000e+00  1.000000e+00        0.0
Among contexts w/o sure categories:
3002440 (98.82%) contexts are smaller than 10kB, size: 584.7MB (17.37%).
2836855 (93.37%) contexts have less than 100 total calls, size: 3284.8MB (97.57%).
63278 (2.08%) contexts are not rewritten, size: 666.7MB (19.80%).
"""

# Plot the distribution of script sizes.
fig: Figure
ax: Axes
fig, ax = plt.subplots(figsize=(16, 9))
ax.ecdf(df["size"], linewidth=4, label="All Contexts")
ax.ecdf(
    df[df["silent"] == 1]["size"],
    linewidth=4,
    label="Silent Contexts",
)
ax.ecdf(
    df[df["sure_frontend_processing"] == 1]["size"],
    linewidth=4,
    label="Frontend Processing",
)
ax.ecdf(
    df[df["sure_dom_element_generation"] == 1]["size"],
    linewidth=4,
    label="DOM Generation",
)
ax.ecdf(
    df[df["sure_ux_enhancement"] == 1]["size"],
    linewidth=4,
    label="UX Enhancement",
)
ax.ecdf(
    df[df["sure_extensional_featuers"] == 1]["size"],
    linewidth=4,
    label="Extensional Features",
)
ax.set_xscale("log")
ax.set_xlabel("Sizes of Execution Context Source Code (bytes)", fontsize=36)
ax.set_ylabel("Cumulative Fraction of\nContexts in Each Category", fontsize=36)
ax.tick_params(axis="both", labelsize=32)
ax.grid()
ax.legend(fontsize=30, loc="best")
fig.savefig("script_size_cdf2.pdf", bbox_inches="tight")
fig.savefig("script_size_cdf2.png", bbox_inches="tight")
fig.show()

# Per-subdomain aggregation.
dict_size = {column: df[column] * df["size"] for column in sure_columns}
for column in ("subdomain_rank", "size", "rewritten", "total_call"):
    dict_size[column] = df[column]
df_size = pd.DataFrame(dict_size)
df_subdomain = df_size.groupby("subdomain_rank").sum()
assert type(df_subdomain) is pd.DataFrame
for column in sure_columns:
    df_subdomain[f"%{column}"] = df_subdomain[column] * 100.0 / df_subdomain["size"]
percentages = [f"%{column}" for column in sure_columns[1:]] + ["%silent"]
df_subdomain["%total"] = sum(df_subdomain[f"%{column}"] for column in sure_columns[1:])
df_subdomain.sort_values(
    by=["%total"] + percentages,
    ascending=[False] + [False for _ in sure_columns[1:]] + [True],
    ignore_index=True,
    inplace=True,
)
indexes, values = smart_sample(
    tuple(df_subdomain[column] for column in percentages),  # type: ignore[reportArgumentType]
)
SPHERE_LABELS = [
    "Frontend Processing",
    "DOM Generation",
    "UX Enhancement",
    "Extensional Features",
    "Silent",
]
SPHERE_COLORS = ["cyan", "red", "purple", "#dfdf6f", "gray"]
fig, ax = plt.subplots(figsize=(16, 9))
ax.stackplot(
    indexes,
    values,
    labels=SPHERE_LABELS,
    colors=["cyan", "red", "purple", "#dfdf6f", "gray"],
)
ax.set_xlabel("Subdomains, Ordered by Spheres Usage", fontsize=36)
ax.set_ylabel("Percentages of Code Sizes", fontsize=36)
ax.tick_params(axis="both", labelsize=32)
ax.grid()
ax.legend(fontsize=30, loc="best")
fig.savefig("subdomain_spheres_size_stacked.pdf", bbox_inches="tight")
fig.savefig("subdomain_spheres_size_stacked.png", bbox_inches="tight")


subset_sizes = {}
for subset_id in itertools.product([0, 1], repeat=4):
    if subset_id == (0, 0, 0, 0):
        continue
    condition = (df[sure_columns[1:]].values == subset_id).all(axis=1)  # type: ignore[reportAttributeAccessIssue]
    subset_size = df[condition]["size"].sum()
    subset_sizes[subset_id] = subset_size
fig, ax = plt.subplots(figsize=(16, 9))
EulerDiagram(
    subset_sizes,
    set_labels=["               ", "", "", ""],
    set_colors=SPHERE_COLORS[:4],  # type: ignore[reportArgumentType]
    ax=ax,
    subset_label_formatter=lambda _subset, size: f" {size * 100.0 / total_size:.2f}%",
)
ax.stackplot([], [[], [], [], []], colors=SPHERE_COLORS[:4], labels=SPHERE_LABELS)
ax.legend(fontsize=24, loc="upper left", bbox_to_anchor=(-0.3, 0.2))
fig.savefig("spheres_venn.pdf", bbox_inches="tight")
fig.savefig("spheres_venn.png", bbox_inches="tight")
plt.show()
