import matplotlib.pyplot as plt
import numpy as np
from matplotlib.axes import Axes
from matplotlib.figure import Figure

from data import CsvFile

api_calls_csv = CsvFile(
    "api_calls.csv.gz",
    "https://github.com/user-attachments/files/17332957/api_calls.csv.gz",
)

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
_ = df_raw
df = df.dropna()
pattern = r"^([A-Za-z\. ]+[0-9]{0,3})+$"
filtered_df = df[~df["this"].str.match(pattern) | ~df["attr"].str.match(pattern)][
    ["api_type", "this", "attr"]
]
filtered_df = filtered_df.sort_values(by=["api_type", "this", "attr"])  # type: ignore[reportAttributeAccessIssue]
filtered_df.to_csv("likely_non_browser_api.csv", index=False)

# CCDF plotting reference: `matplotlib/axes/_axes.py`.
total_arr = np.asarray(df["total"])
total_order = np.argsort(total_arr)
total_arr = total_arr[total_order]
total_cum_weights = 1 - ((1 + np.arange(len(total_arr))) / len(total_arr))
interact_arr = np.asarray(df["interact"])
interact_order = np.argsort(interact_arr)
interact_arr = interact_arr[interact_order]
interact_cum_weights = (len(interact_arr) - (1 + np.arange(len(interact_arr)))) / len(
    total_arr
)
interact_arr = np.concatenate((interact_arr, np.asarray((interact_arr[-1],))))
interact_cum_weights = np.concatenate((np.asarray((1,)), interact_cum_weights))
total_arr = np.concatenate((total_arr, np.asarray((total_arr[-1],))))
total_cum_weights = np.concatenate((np.asarray((1,)), total_cum_weights))
fig: Figure
ax: Axes

fig, ax = plt.subplots(figsize=(16, 9))
fig.tight_layout()
ax.plot(
    total_arr,
    total_cum_weights,
    linewidth=4,
    linestyle="-.",
    label="Total API Calls",
)
ax.plot(
    interact_arr,
    interact_cum_weights,
    linewidth=4,
    linestyle="-",
    label="API Calls after Interaction",
)
ax.set_xscale("log")
ax.set_yscale("log")
ax.set_xlabel("Number of Calls per Browser API", fontsize=36)
ax.set_ylabel(
    "Complementary Cumulative\nFraction of APIs",
    fontsize=36,
)
ax.tick_params(axis="both", labelsize=32)
ax.grid()
ax.legend(fontsize=30, loc="lower left")
fig.savefig("api_calls_cdf.png", bbox_inches="tight")
fig.show()
