from boggle import Boggle
from flask import Flask, render_template, session, request, jsonify
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)

app.config['SECRET_KEY'] = "oh-so-secret"
app.config["DEBUG_TB_INTERCEPT_REDIRECTS"] = False

debug = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route("/")
def display_game():
    """
        Generates a new 5x5 board
        Saves the board to a session
        Renders the board to the DOM
    """
    board = boggle_game.make_board()
    session['board'] = board

    # initialize games_played and high_score if it doesn't exist yet
    games_played = session.get("games_played", 0)
    high_score = session.get("high_score", 0)
    # set session variables in case they didn't previously exist
    session["games_played"] = games_played
    session["high_score"] = high_score

    return render_template("game.html")


@app.route("/guess", methods=["POST"])
def send_guess():
    """
    Accepts
      guess: the word the user entered on the form and submitted to be checked

    Checks the guessed word to determine if it is 'ok', 'not-word' or 'not-on-board'

    Returns the following response to the client:
        {
          "word": string that contains the word that user guessed,
          "result": string that contains flag indicating if the word is valid after checking
        }
    """
    
    guess = request.json["guess"]
    board = session["board"]

    # check word is valid
    result = boggle_game.check_valid_word(board, guess)

    return jsonify({"word": guess, "result": result})

@app.route("/game-over", methods=["POST"])
def handleGameOver():
    """
    Accepts
      score: the score from the previous game 

    Sets the updated session variables associated with the high_score and games_played to be used to set on the client 

    Returns the following response to the client:
        {
          "newHighScore": <boolean indicating if new high score was set>
        }
    """
    # get previous game score from request
    score = request.json["score"]
    
    # get current high_score and games_played from session 
    high_score = session['high_score']
    games_played = session["games_played"]

    # update high_score and games_played with new values
    high_score = max(int(score), int(high_score))
    games_played += 1

    # set new values in session
    session['high_score'] = high_score
    session['games_played'] = games_played

    return jsonify({"newHighScore": int(high_score) == int(score)})