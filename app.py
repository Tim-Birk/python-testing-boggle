from boggle import Boggle
from flask import Flask
from flask_debugtoolbar import DebugToolbarExtension

boggle_game = Boggle()

app = Flask(__app__)

app = Flask(__name__)
app.config['SECRET_KEY'] = "oh-so-secret"
app.config["DEBUG_TB_INTERCEPT_REDIRECTS"] = False