class BoggleGame {
  constructor(gameId) {
    this.game = $(`#${gameId}`);
    this.messageBox = $("#message", this.game);

    this.time = 60;
    this.gameOver = false;
    this.words = new Set();

    $("#guess-form", this.game).on("submit", this.handleSubmit.bind(this));
  }

  /** Event listener for word guessing form submit event */
  async handleSubmit(e) {
    e.preventDefault();
    console.log("submit");
    // check if game over
    if (this.gameOver) {
      //  don't allow any more words to be submitted
      return;
    }

    try {
      const guess = $("#guess", this.game).val();
      // check if word has already been added
      if (this.words.has(guess)) {
        const msg = `${guess} as already been accepted.`;
        this.displayMessage(msg, "error");
        return;
      }
      // send request to the server with word that user entered to check the word
      const response = await axios.post(`/guess`, { guess });

      // Destructure response with the guessed word and the server's result of checking the guessed word
      const { word, result } = response.data;
      // Display a user friendly message based on result and update the score if the word was accepted
      this.handleGuessResponse(word, result);
    } catch (err) {
      console.log(err);
    }
  }

  /** Accepts 
      word: the guessed word 
      result:  string returned from server after checking if the word is 'ok', 'not-word' or 'not-on-board'
      
    Updates DOM with a more user friendly message based on 'result'
    Updates DOM score if result = 'ok' */
  handleGuessResponse(word, result) {
    let msg = "";
    switch (result) {
      case "not-word":
        msg = `'${word}' is not a valid word`;
        this.displayMessage(msg, "error");
        break;
      case "not-on-board":
        msg = `'${word}' is not a valid word on this board`;
        this.displayMessage(msg, "error");
        break;
      case "ok":
        msg = `'${word}' accepted`;
        this.displayMessage(msg, "success");
        this.updateScore(word);
        this.words.add(word);
        // add item to list of words already accepted on DOM for this board
        const li = $(`<li>${word}</li>`);
        $("#words", this.game).append(li);
        break;
      default:
        msg = ``;
        break;
    }
  }

  /** Display error/success message to user 
    accepts:
        msg: string containing message to display
        type: string equal to 'success' or 'error' to determine formatting
*/
  displayMessage(msg, type) {
    this.messageBox.text(msg);
    if (type === "success") {
      this.messageBox.addClass("success");
      this.messageBox.removeClass("error");
    } else if (type === "error") {
      this.messageBox.addClass("error");
      this.messageBox.removeClass("success");
    }

    // Reset input everytime after displaying message
    $("#guess", this.game).val("");
    $("#guess", this.game).focus();
  }

  /** Updates DOM score */
  updateScore(word) {
    $("#score", this.game).text(
      Number($("#score", this.game).text()) + word.length
    );
  }

  /** Starts a 60 second timer.  When the time gets to zero it prevents no more words from being submitted 
  and displays a game over message to the user */
  startTimer() {
    let x = setInterval(() => {
      $("#timer", this.game).text(this.time);
      this.time--;
      if (this.time < 0) {
        this.gameOver = true;
        this.handleGameOver();
        clearInterval(x);
      }
    }, 1000);
  }

  /** Display a game over message to the user */
  async handleGameOver() {
    // display game over message to user
    this.messageBox.text("The game is over.");
    this.messageBox.addClass("error");
    this.messageBox.removeClass("success");

    // send request to the server with the score
    const score = Number($("#score", this.game).text());

    await axios.post(`/game-over`, { score });
  }
}
