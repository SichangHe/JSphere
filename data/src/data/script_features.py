import pandas as pd

from data import CsvFile

script_features_csv = CsvFile(
    "script_features.csv.gz",
    "https://github.com/user-attachments/files/17351697/script_features.csv.gz",
)

df = pd.read_csv(script_features_csv.path, sep="\t", engine="pyarrow")

df.describe()
"""
                 id          size        silent  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers   has_request  queries_element  uses_storage
count  40116.000000  4.011600e+04  40116.000000              40116.000000                 40116.000000         40116.000000               40116.000000  40116.000000     40116.000000  40116.000000
mean      74.541206  7.958582e+04      0.255758                  0.352204                     0.204308             0.112075                   0.122520      0.104821         0.340014      0.113945
std      120.871663  3.303808e+05      0.436292                  0.477663                     0.403200             0.315463                   0.327889      0.306326         0.473719      0.317748
min        3.000000  9.000000e+00      0.000000                  0.000000                     0.000000             0.000000                   0.000000      0.000000         0.000000      0.000000
25%       19.000000  3.340000e+02      0.000000                  0.000000                     0.000000             0.000000                   0.000000      0.000000         0.000000      0.000000
50%       43.000000  2.217000e+03      0.000000                  0.000000                     0.000000             0.000000                   0.000000      0.000000         0.000000      0.000000
75%       81.000000  3.211175e+04      1.000000                  1.000000                     0.000000             0.000000                   0.000000      0.000000         1.000000      0.000000
max     1279.000000  8.669659e+06      1.000000                  1.000000                     1.000000             1.000000                   1.000000      1.000000         1.000000      1.000000
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
for name1, name2 in [
    ("sure_frontend_processing", "sure_dom_element_generation"),
    ("sure_frontend_processing", "sure_ux_enhancement"),
    ("sure_frontend_processing", "sure_extensional_featuers"),
    ("sure_frontend_processing", "has_request"),
    ("sure_frontend_processing", "queries_element"),
    ("sure_frontend_processing", "uses_storage"),
    ("sure_dom_element_generation", "sure_ux_enhancement"),
    ("sure_dom_element_generation", "sure_extensional_featuers"),
    ("sure_dom_element_generation", "has_request"),
    ("sure_dom_element_generation", "queries_element"),
    ("sure_dom_element_generation", "uses_storage"),
    ("sure_ux_enhancement", "sure_extensional_featuers"),
    ("sure_ux_enhancement", "has_request"),
    ("sure_ux_enhancement", "queries_element"),
    ("sure_ux_enhancement", "uses_storage"),
    ("sure_extensional_featuers", "has_request"),
    ("sure_extensional_featuers", "queries_element"),
    ("sure_extensional_featuers", "uses_storage"),
    ("has_request", "queries_element"),
    ("has_request", "uses_storage"),
    ("queries_element", "uses_storage"),
]:
    n_both = df[(df[name1] == 1) & (df[name2] == 1)].shape[0]
    print(
        f"{n_both} ({n_both * 100.0 / n_scripts:.2f}%) scripts have both {name1} and {name2}."
    )
"""
6602 (16.46%) scripts have both sure_frontend_processing and sure_dom_element_generation.
3840 (9.57%) scripts have both sure_frontend_processing and sure_ux_enhancement.
4229 (10.54%) scripts have both sure_frontend_processing and sure_extensional_featuers.
3981 (9.92%) scripts have both sure_frontend_processing and has_request.
9379 (23.38%) scripts have both sure_frontend_processing and queries_element.
4335 (10.81%) scripts have both sure_frontend_processing and uses_storage.
3125 (7.79%) scripts have both sure_dom_element_generation and sure_ux_enhancement.
2703 (6.74%) scripts have both sure_dom_element_generation and sure_extensional_featuers.
2338 (5.83%) scripts have both sure_dom_element_generation and has_request.
6846 (17.07%) scripts have both sure_dom_element_generation and queries_element.
2728 (6.80%) scripts have both sure_dom_element_generation and uses_storage.
1844 (4.60%) scripts have both sure_ux_enhancement and sure_extensional_featuers.
1459 (3.64%) scripts have both sure_ux_enhancement and has_request.
3754 (9.36%) scripts have both sure_ux_enhancement and queries_element.
1669 (4.16%) scripts have both sure_ux_enhancement and uses_storage.
1755 (4.37%) scripts have both sure_extensional_featuers and has_request.
3508 (8.74%) scripts have both sure_extensional_featuers and queries_element.
2093 (5.22%) scripts have both sure_extensional_featuers and uses_storage.
3627 (9.04%) scripts have both has_request and queries_element.
2424 (6.04%) scripts have both has_request and uses_storage.
3722 (9.28%) scripts have both queries_element and uses_storage.
"""

# Does not seem to have strong correlations between features.
df[  # type: ignore[reportCallIssue]
    [
        "size",
        "silent",
        "sure_frontend_processing",
        "sure_dom_element_generation",
        "sure_ux_enhancement",
        "sure_extensional_featuers",
        "has_request",
        "queries_element",
        "uses_storage",
    ]
].corr()
"""
                                 size    silent  sure_frontend_processing  sure_dom_element_generation  sure_ux_enhancement  sure_extensional_featuers  has_request  queries_element  uses_storage
size                         1.000000 -0.136351                  0.274836                     0.298781             0.354677                   0.344473     0.270313         0.262180      0.303291
silent                      -0.136351  1.000000                 -0.432251                    -0.297049            -0.208269                  -0.219049    -0.200598        -0.420764     -0.210220
sure_frontend_processing     0.274836 -0.432251                  1.000000                     0.480895             0.373300                   0.397579     0.425916         0.504006      0.447577
sure_dom_element_generation  0.298781 -0.297049                  0.480895                     1.000000             0.432430                   0.320328     0.298486         0.529782      0.349092
sure_ux_enhancement          0.354677 -0.208269                  0.373300                     0.432430             1.000000                   0.311650     0.254798         0.371204      0.287664
sure_extensional_featuers    0.344473 -0.219049                  0.397579                     0.320328             0.311650                   1.000000     0.307705         0.294791      0.366788
has_request                  0.270313 -0.200598                  0.425916                     0.298486             0.254798                   0.307705     1.000000         0.377455      0.498098
queries_element              0.262180 -0.420764                  0.504006                     0.529782             0.371204                   0.294791     0.377455         1.000000      0.359011
uses_storage                 0.303291 -0.210220                  0.447577                     0.349092             0.287664                   0.366788     0.498098         0.359011      1.000000
"""

# Count how many script are not in any "sure" category.
sure_columns = [
    "silent",
    "sure_frontend_processing",
    "sure_dom_element_generation",
    "sure_ux_enhancement",
    "sure_extensional_featuers",
]
no_sure_scripts = df[(df[sure_columns] == 0).all(axis=1)]
size_no_sure_scripts = no_sure_scripts["size"].sum()
print(
    f"{len(no_sure_scripts)} scripts ({len(no_sure_scripts) * 100.0 / n_scripts:.2f}%) \
are not in any 'sure' categories, \
{size_no_sure_scripts / 1_000_000:.1f}MB ({size_no_sure_scripts * 100.0 / total_size:.2f}%)."
)
"""
13148 scripts (32.77%) are not in any 'sure' categories, 221.1MB (6.93%).
"""
all_columns = [
    "silent",
    "sure_frontend_processing",
    "sure_dom_element_generation",
    "sure_ux_enhancement",
    "sure_extensional_featuers",
    "has_request",
    "queries_element",
    "uses_storage",
]
no_categories_scripts = df[(df[all_columns] == 0).all(axis=1)]
size_no_categories_scripts = no_categories_scripts["size"].sum()
print(
    f"{len(no_categories_scripts)} scripts \
({len(no_categories_scripts) * 100.0 / n_scripts:.2f}%) \
are not in any categories at all, \
{size_no_categories_scripts / 1_000_000:.1f}MB ({size_no_categories_scripts * 100.0 / total_size:.2f}%)."
)
"""
10178 scripts (25.37%) are not in any categories at all, 179.7MB (5.63%).
"""
