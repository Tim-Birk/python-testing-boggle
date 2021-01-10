const $guessForm = $("#guess-form");
const $guessWord = $("#guess");
const $message = $("#message");
const $score = $("#score");
const $timer = $("#timer");
const $highScore = $("#high-score");
const $gamePlayed = $("#games-played");
const $words = $("#words");
let gameOver = false;
let words = new Set();

/** Event listener for word guessing form submit event */
$guessForm.on("submit", async (e) => {
  e.preventDefault();
  // check if game over
  if (gameOver) {
    //  don't allow any more words to be submitted
    return;
  }

  try {
    const guess = $guessWord.val();
    // check if word has already been added
    if (words.has(guess)) {
      const msg = `${guess} as already been accepted.`;
      displayMessage(msg, "error");
      return;
    }
    // send request to the server with word that user entered to check the word
    const response = await axios.post(`/guess`, { guess });

    // Destructure response with the guessed word and the server's result of checking the guessed word
    const { word, result } = response.data;
    // Display a user friendly message based on result and update the score if the word was accepted
    handleGuessResponse(word, result);
  } catch (err) {
    console.log(err);
  }
});

/** Accepts 
      word: the guessed word 
      result:  string returned from server after checking if the word is 'ok', 'not-word' or 'not-on-board'
      
    Updates DOM with a more user friendly message based on 'result'
    Updates DOM score if result = 'ok' */
const handleGuessResponse = (word, result) => {
  let message = "";
  switch (result) {
    case "not-word":
      message = `'${word}' is not a valid word`;
      displayMessage(message, "error");
      break;
    case "not-on-board":
      message = `'${word}' is not a valid word on this board`;
      displayMessage(message, "error");
      break;
    case "ok":
      message = `'${word}' accepted`;
      displayMessage(message, "success");
      updateScore(word);
      words.add(word);
      const li = $(`<li>${word}</li>`);
      $words.append(li);
      break;
    default:
      message = ``;
      break;
  }
};

/** Display error/success message to user 
    accepts:
        msg: string containing message to display
        type: string equal to 'success' or 'error' to determine formatting
*/
const displayMessage = (msg, type) => {
  $message.text(msg);
  if (type === "success") {
    $message.addClass("success");
    $message.removeClass("error");
  } else if (type === "error") {
    $message.addClass("error");
    $message.removeClass("success");
  }

  // Reset input everytime after displaying message
  $guessWord.val("");
  $guessWord.focus();
};

/** Updates DOM score */
const updateScore = (word) => {
  $score.text(Number($score.text()) + word.length);
};

/** Starts a 60 second timer.  When the time gets to zero it prevents no more words from being submitted 
  and displays a game over message to the user */
const startTimer = () => {
  time = 60;

  let x = setInterval(() => {
    $timer.text(time);
    time--;
    if (time < 0) {
      gameOver = true;
      handleGameOver();
      clearInterval(x);
    }
  }, 1000);
};

/** Display a game over message to the user */
const handleGameOver = async () => {
  // display game over message to user
  $message.text("The game is over.");
  $message.addClass("error");
  $message.removeClass("success");

  // send request to the server with the score
  const score = Number($score.text());

  await axios.post(`/game-over`, { score });
};

$(startTimer());
