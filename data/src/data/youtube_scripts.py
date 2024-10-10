from data import CsvFile

youtube_script_csv = CsvFile(
    "youtube_script_api_calls.csv",
    "https://github.com/user-attachments/files/17320225/youtube_script_api_calls.csv",
)

df = youtube_script_csv.read_w_default_config()
df[r"%interact"] = df["interact"] * 100.0 / df["total"]
