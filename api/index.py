from flask import Flask, render_template, request
import pandas as pd
import io

app = Flask(__name__, template_folder="../templates")

@app.route("/", methods=["GET", "POST"])
def index():
    pemenang = None

    if request.method == "POST":
        file = request.files.get("file")

        if file and file.filename.endswith(".xlsx"):
            try:
                in_memory_file = io.BytesIO(file.read())
                df = pd.read_excel(in_memory_file)

                if not df.empty:
                    pemenang = df.sample(n=1).iloc[0, 0]

            except Exception:
                pemenang = "File tidak valid"

    return render_template("index.html", pemenang=pemenang)

# WAJIB untuk Vercel
app = app