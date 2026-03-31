from datetime import datetime
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html", year=datetime.utcnow().year)


if __name__ == "__main__":
    app.run(debug=True)
