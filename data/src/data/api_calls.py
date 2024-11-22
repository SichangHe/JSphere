import matplotlib.pyplot as plt
import numpy as np
from matplotlib.axes import Axes
from matplotlib.figure import Figure

from data import CsvFile

api_calls_csv = CsvFile(
    "api_calls.csv.gz",
    "https://github.com/user-attachments/files/17332957/api_calls.csv.gz",
)
api_calls_csv.download_if_missing()

df = api_calls_csv.read_w_default_config()
df["%interact/total"] = df["interact"] * 100.0 / df["total"]

df.describe()

# These are mostly Get.
df.nlargest(20, "appear")
df.nlargest(20, "appear_interact")
df.nlargest(20, "total")
df.nlargest(20, "interact")

# These are all junk.
df.nlargest(20, "%total/total")
df.nlargest(20, "%interact/interact")
df.nlargest(20, "avg%total/script")
df.nlargest(20, "avg%interact/script")


df[df["api_type"] == "Function"].nlargest(20, "appear")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "appear_interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "%total/total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "%interact/interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "avg%total/script")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "avg%interact/script")  # type: ignore[reportArgumentType]

df[df["api_type"] == "Set"].nlargest(20, "appear")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "appear_interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "%total/total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "%interact/interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "avg%total/script")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "avg%interact/script")  # type: ignore[reportArgumentType]

df_raw = df
df = df.dropna()
pattern = r"^([A-Za-z\. ]+[0-9]{0,3})+$"
filtered_df = df[~df["this"].str.match(pattern) | ~df["attr"].str.match(pattern)][
    ["api_type", "this", "attr"]
]
filtered_df = filtered_df.sort_values(by=["api_type", "this", "attr"])  # type: ignore[reportAttributeAccessIssue]
filtered_df.to_csv("likely_non_browser_api.csv", index=False)

df = df_raw
# CCDF plotting reference: `matplotlib/axes/_axes.py`.
total_arr = np.asarray(df["total"])
total_order = np.argsort(total_arr)
total_arr = np.cumsum(total_arr[total_order][::-1])
n_total = total_arr[-1]
total_arr = total_arr / n_total
total_cum_weights = (1 + np.arange(len(total_arr))) / len(total_arr)
interact_arr = np.asarray(df["interact"])
interact_order = np.argsort(interact_arr)
interact_arr = np.cumsum(interact_arr[interact_order][::-1]) / n_total
interact_cum_weights = (1 + np.arange(len(interact_arr))) / len(total_arr)
interact_arr = np.concatenate((interact_arr, np.asarray((interact_arr[-1],))))
interact_cum_weights = np.concatenate((interact_cum_weights, np.asarray((1,))))
total_arr = np.concatenate((total_arr, np.asarray((total_arr[-1],))))
total_cum_weights = np.concatenate((total_cum_weights, np.asarray((1,))))
index_08 = np.searchsorted(total_arr, 0.8, side="right")
index_09 = np.searchsorted(total_arr, 0.9, side="right")
y_08 = total_arr[index_08]
y_09 = total_arr[index_09]
x_08 = total_cum_weights[index_08]
x_09 = total_cum_weights[index_09]
print(
    f"{y_08 * 100:.2f}% of the API calls are from {x_08 * 100:.2f}% ({x_08 * len(df)}) of the APIs."
)
print(
    f"{y_09 * 100:.2f}% of the API calls are from {x_09 * 100:.2f}% ({x_09 * len(df)}) of the APIs."
)
"""
80.00% of the API calls are from 1.75% (318.0) of the APIs.
90.02% of the API calls are from 3.74% (678.0) of the APIs.
"""
fig: Figure
ax: Axes

fig, ax = plt.subplots(figsize=(16, 9))
fig.tight_layout()
ax.plot(
    total_cum_weights,
    total_arr,
    linewidth=4,
    linestyle="-.",
    label="Total API Calls",
)
ax.plot(
    interact_cum_weights,
    interact_arr,
    linewidth=4,
    linestyle="-",
    label="API Calls after Interaction",
)
ax.scatter(
    [x_08, x_09],
    [y_08, y_09],
    s=128,
    linewidth=4,
    marker="x",
    color="red",
    zorder=5,
    label="80% and 90% API Call Thresholds",
)
ax.set_xscale("log")
ax.set_xlabel("Fraction of Browser APIs", fontsize=36)
ax.set_ylabel(
    "Cumulative Fraction\nof Total API Calls",
    fontsize=36,
)
ax.tick_params(axis="both", labelsize=32)
ax.grid(which="both")
ax.legend(fontsize=30, loc="best")
fig.savefig("api_calls_cdf.png", bbox_inches="tight")
fig.show()

# Notable attr
df = df_raw
df = df.nlargest(678, "total")
attrs = set(
    df[(df["api_type"] == "Get") & (df["this"].str.match(".*Event$"))].sort_values(  # type: ignore[reportCallIssue]
        by="total"
    )["attr"]
)
print("|".join(f'"{e}"' for e in attrs))
"""
"state"|"keyCode"|"pointerType"|"which"|"bubbles"|"clientY"|"target"|"key"|"charCode"|"clientX"|"pointerId"|"currentTarget"|"isTrusted"|"propertyName"|"preventDefault"|"offsetY"|"cancelable"|"changedTouches"|"composed"|"screenX"|"button"|"composedPath"|"metaKey"|"pageY"|"ctrlKey"|"touches"|"detail"|"shiftKey"|"type"|"offsetX"|"pageX"|"eventPhase"|"timeStamp"|"screenY"|"altKey"|"data"|"relatedTarget"|"defaultPrevented"
"""
attrs = set(
    df[(df["api_type"] == "Get") & (df["this"] == "Location")].sort_values(  # type: ignore[reportCallIssue]
        by="total"
    )["attr"]
)
print("|".join(f'"{e}"' for e in attrs))
"""
"pathname"|"hash"|"href"|"hostname"|"search"|"constructor"
"""
thises = set(
    df[(df["api_type"] == "Function") & (df["attr"] == "addEventListener")].sort_values(  # type: ignore[reportCallIssue]
        by="total"
    )["this"]
)
print("|".join(f'"{e}"' for e in thises))
"""
"HTMLDivElement"|"HTMLButtonElement"|"HTMLElement"|"HTMLDocument"|"HTMLImageElement"|"HTMLAnchorElement"|"Window"
"""
thises = set(
    df[(df["api_type"] == "Function") & (df["attr"] == "getBoundingClientRect")].sort_values(  # type: ignore[reportCallIssue]
        by="total"
    )["this"]
)
print("|".join(f'"{e}"' for e in thises))
"""
"HTMLDivElement"|"HTMLImageElement"|"HTMLAnchorElement"
"""
