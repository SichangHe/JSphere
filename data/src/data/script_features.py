import itertools

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.axes import Axes
from matplotlib.figure import Figure

from data import CsvFile

script_features_csv = CsvFile(
    "script_features2.csv.gz",
    "https://github.com/user-attachments/files/17381468/script_features2.csv.gz",
)

df = pd.read_csv(script_features_csv.path, sep="\t", engine="pyarrow")
all_columns = [
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
category_columns = all_columns[1:]
sure_columns = all_columns[1:6]

df["silent"] = (df["total_call"] <= 0).astype(np.int32)

df.describe()
"""
                 id          size     total_call  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers   has_request  queries_element  uses_storage        silent
count  40116.000000  4.011600e+04   40116.000000              40116.000000                 40116.000000         40116.000000               40116.000000  40116.000000     40116.000000  40116.000000  40116.000000
mean      74.541206  7.958582e+04     687.395054                  0.352204                     0.204308             0.112075                   0.122520      0.104821         0.340014      0.113945      0.255758
std      120.871663  3.303808e+05    8439.449922                  0.477663                     0.403200             0.315463                   0.327889      0.306326         0.473719      0.317748      0.436292
min        3.000000  9.000000e+00       0.000000                  0.000000                     0.000000             0.000000                   0.000000      0.000000         0.000000      0.000000      0.000000
25%       19.000000  3.340000e+02       0.000000                  0.000000                     0.000000             0.000000                   0.000000      0.000000         0.000000      0.000000      0.000000
50%       43.000000  2.217000e+03       5.000000                  0.000000                     0.000000             0.000000                   0.000000      0.000000         0.000000      0.000000      0.000000
75%       81.000000  3.211175e+04      41.000000                  1.000000                     0.000000             0.000000                   0.000000      0.000000         1.000000      0.000000      1.000000
max     1279.000000  8.669659e+06  538050.000000                  1.000000                     1.000000             1.000000                   1.000000      1.000000         1.000000      1.000000      1.000000
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
40116 scripts in total (3192.7MB).
10260 (25.58%) silent, 28.1MB (0.88%),
14129 (35.22%) sure_frontend_processing, 2864.3MB (89.72%),
8196 (20.43%) sure_dom_element_generation, 2248.9MB (70.44%),
4496 (11.21%) sure_ux_enhancement, 1840.7MB (57.65%),
4915 (12.25%) sure_extensional_featuers, 1888.1MB (59.14%),
4205 (10.48%) has_request, 1432.1MB (44.86%),
13640 (34.00%) queries_element, 2731.6MB (85.56%),
4571 (11.39%) uses_storage, 1641.0MB (51.40%).
"""

# Combinations.
for name1, name2 in itertools.combinations(all_columns[2:], 2):
    subset = df[(df[name1] == 1) & (df[name2] == 1)]
    n_both = subset.shape[0]
    size_subset = subset["size"].sum()
    print(
        f"{n_both} ({n_both * 100.0 / n_scripts:.2f}%) \
scripts have both {name1} and {name2}. Size: {size_subset / 1_000_000:.1f}MB \
({size_subset * 100.0 / total_size:.2f}%)"
    )
"""
6602 (16.46%) scripts have both sure_frontend_processing and sure_dom_element_generation. Size: 2197.1MB (68.82%)
3840 (9.57%) scripts have both sure_frontend_processing and sure_ux_enhancement. Size: 1821.5MB (57.05%)
4229 (10.54%) scripts have both sure_frontend_processing and sure_extensional_featuers. Size: 1841.1MB (57.67%)
3981 (9.92%) scripts have both sure_frontend_processing and has_request. Size: 1428.9MB (44.76%)
9379 (23.38%) scripts have both sure_frontend_processing and queries_element. Size: 2648.1MB (82.94%)
4335 (10.81%) scripts have both sure_frontend_processing and uses_storage. Size: 1633.2MB (51.15%)
3125 (7.79%) scripts have both sure_dom_element_generation and sure_ux_enhancement. Size: 1613.2MB (50.53%)
2703 (6.74%) scripts have both sure_dom_element_generation and sure_extensional_featuers. Size: 1562.9MB (48.95%)
2338 (5.83%) scripts have both sure_dom_element_generation and has_request. Size: 1192.9MB (37.36%)
6846 (17.07%) scripts have both sure_dom_element_generation and queries_element. Size: 2152.1MB (67.41%)
2728 (6.80%) scripts have both sure_dom_element_generation and uses_storage. Size: 1362.7MB (42.68%)
1844 (4.60%) scripts have both sure_ux_enhancement and sure_extensional_featuers. Size: 1440.5MB (45.12%)
1459 (3.64%) scripts have both sure_ux_enhancement and has_request. Size: 1162.6MB (36.42%)
3754 (9.36%) scripts have both sure_ux_enhancement and queries_element. Size: 1773.7MB (55.55%)
1669 (4.16%) scripts have both sure_ux_enhancement and uses_storage. Size: 1278.9MB (40.06%)
1755 (4.37%) scripts have both sure_extensional_featuers and has_request. Size: 1226.1MB (38.40%)
3508 (8.74%) scripts have both sure_extensional_featuers and queries_element. Size: 1800.3MB (56.39%)
2093 (5.22%) scripts have both sure_extensional_featuers and uses_storage. Size: 1372.2MB (42.98%)
3627 (9.04%) scripts have both has_request and queries_element. Size: 1410.1MB (44.17%)
2424 (6.04%) scripts have both has_request and uses_storage. Size: 1106.1MB (34.64%)
3722 (9.28%) scripts have both queries_element and uses_storage. Size: 1596.9MB (50.02%)
"""

# Does not seem to have strong correlations between features.
df[["size"] + all_columns].corr()  # type: ignore[reportCallIssue]
"""
                                 size  total_call    silent  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers  has_request  queries_element  uses_storage
size                         1.000000    0.243324 -0.136351                  0.274836                     0.298781             0.354677                   0.344473     0.270313         0.262180      0.303291
total_call                   0.243324    1.000000 -0.047748                  0.089739                     0.139279             0.141431                   0.132914     0.108605         0.078656      0.112162
silent                      -0.136351   -0.047748  1.000000                 -0.432251                    -0.297049            -0.208269                  -0.219049    -0.200598        -0.420764     -0.210220
sure_frontend_processing     0.274836    0.089739 -0.432251                  1.000000                     0.480895             0.373300                   0.397579     0.425916         0.504006      0.447577
sure_dom_element_generation  0.298781    0.139279 -0.297049                  0.480895                     1.000000             0.432430                   0.320328     0.298486         0.529782      0.349092
sure_ux_enhancement          0.354677    0.141431 -0.208269                  0.373300                     0.432430             1.000000                   0.311650     0.254798         0.371204      0.287664
sure_extensional_featuers    0.344473    0.132914 -0.219049                  0.397579                     0.320328             0.311650                   1.000000     0.307705         0.294791      0.366788
has_request                  0.270313    0.108605 -0.200598                  0.425916                     0.298486             0.254798                   0.307705     1.000000         0.377455      0.498098
queries_element              0.262180    0.078656 -0.420764                  0.504006                     0.529782             0.371204                   0.294791     0.377455         1.000000      0.359011
uses_storage                 0.303291    0.112162 -0.210220                  0.447577                     0.349092             0.287664                   0.366788     0.498098         0.359011      1.000000
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
13148 scripts (32.77%) are not in any 'sure' categories, 221.1MB (6.93%).
10178 scripts (25.37%) are not in any categories at all, 179.7MB (5.63%).
"""

# Plot the distribution of script sizes.
# Calculate cumulative weights for each category as fractions of all scripts
total_scripts = len(df["size"])
# All Scripts
all_cdf_data = np.asarray(df["size"])
all_cdf_order = np.argsort(all_cdf_data)
all_cdf_data = all_cdf_data[all_cdf_order]
all_cum_weights = (1 + np.arange(len(all_cdf_data))) / total_scripts
all_cdf_data = np.concatenate((all_cdf_data, np.asarray((all_cdf_data[-1],))))
all_cum_weights = np.concatenate((all_cum_weights, np.asarray((1,))))
# Silent Scripts
silent_cdf_data = np.asarray(df[df["silent"] == 1]["size"])
silent_cdf_order = np.argsort(silent_cdf_data)
silent_cdf_data = silent_cdf_data[silent_cdf_order]
silent_cum_weights = (1 + np.arange(len(silent_cdf_data))) / total_scripts
# Frontend Processing Scripts
frontend_cdf_data = np.asarray(df[df["sure_frontend_processing"] == 1]["size"])
frontend_cdf_order = np.argsort(frontend_cdf_data)
frontend_cdf_data = frontend_cdf_data[frontend_cdf_order]
frontend_cum_weights = (1 + np.arange(len(frontend_cdf_data))) / total_scripts
# DOM Element Generation Scripts
dom_cdf_data = np.asarray(df[df["sure_dom_element_generation"] == 1]["size"])
dom_cdf_order = np.argsort(dom_cdf_data)
dom_cdf_data = dom_cdf_data[dom_cdf_order]
dom_cum_weights = (1 + np.arange(len(dom_cdf_data))) / total_scripts
# UX Enhancement Scripts
ux_cdf_data = np.asarray(df[df["sure_ux_enhancement"] == 1]["size"])
ux_cdf_order = np.argsort(ux_cdf_data)
ux_cdf_data = ux_cdf_data[ux_cdf_order]
ux_cum_weights = (1 + np.arange(len(ux_cdf_data))) / total_scripts
# Extensional Features Scripts
extensional_cdf_data = np.asarray(df[df["sure_extensional_featuers"] == 1]["size"])
extensional_cdf_order = np.argsort(extensional_cdf_data)
extensional_cdf_data = extensional_cdf_data[extensional_cdf_order]
extensional_cum_weights = (1 + np.arange(len(extensional_cdf_data))) / total_scripts
fig: Figure
ax: Axes
fig, ax = plt.subplots(figsize=(16, 9))
fig.tight_layout()
ax.plot(all_cdf_data, all_cum_weights, linewidth=4, label="All Scripts")
ax.plot(silent_cdf_data, silent_cum_weights, linewidth=4, label="Silent Scripts")
ax.plot(
    frontend_cdf_data,
    frontend_cum_weights,
    linewidth=4,
    label="Frontend Processing Scripts",
)
ax.plot(
    dom_cdf_data, dom_cum_weights, linewidth=4, label="DOM Element Generation"
)
ax.plot(ux_cdf_data, ux_cum_weights, linewidth=4, label="UX Enhancement")
ax.plot(
    extensional_cdf_data,
    extensional_cum_weights,
    linewidth=4,
    label="Extensional Features",
)
ax.set_xscale("log")
ax.set_yscale("log")
ax.set_xlabel("Script Size (bytes)", fontsize=36)
ax.set_ylabel("Cumulative Fraction of Scripts", fontsize=36)
ax.tick_params(axis="both", labelsize=32)
ax.grid()
ax.legend(fontsize=30, loc="best")
fig.savefig("script_size_cdf.png", bbox_inches="tight")
fig.show()
