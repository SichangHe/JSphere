from data import CsvFile

api_calls_csv = CsvFile(
    "api_calls.csv.gz",
    "https://github.com/user-attachments/files/17322038/api_calls.csv.gz",
)

df = api_calls_csv.read_w_default_config()

# These are mostly Get.
df.nlargest(20, "total")
df.nlargest(20, "interact")

# These are all junk.
df.nlargest(20, "%total/total")
df.nlargest(20, "%interact/interact")
df.nlargest(20, "avg%total/script")
df.nlargest(20, "avg%interact/script")


df[df["api_type"] == "Function"].nlargest(20, "total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "%total/total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "%interact/interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "avg%total/script")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Function"].nlargest(20, "avg%interact/script")  # type: ignore[reportArgumentType]

df[df["api_type"] == "Set"].nlargest(20, "total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "%total/total")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "%interact/interact")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "avg%total/script")  # type: ignore[reportArgumentType]
df[df["api_type"] == "Set"].nlargest(20, "avg%interact/script")  # type: ignore[reportArgumentType]

df_raw = df
_ = df_raw
df = df.dropna()
this_pattern = r"^[A-Za-z0-9\. ]{3,}$"
attr_pattern = r"^[A-Za-z0-9\. ]{2,}$"
filtered_df = df[
    ~df["this"].str.match(this_pattern) | ~df["attr"].str.match(attr_pattern)
][["api_type", "this", "attr"]]
filtered_df = filtered_df.sort_values(by=["api_type", "this", "attr"])  # type: ignore[reportAttributeAccessIssue]
filtered_df.to_csv("likely_non_browser_api.csv", index=False)
