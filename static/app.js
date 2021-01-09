const $guessForm = $("#guess-form");
const $guessWord = $("#guess");
const $message = $("#message");
const $score = $("#score");
const $timer = $("#timer");
let gameOver = false;

/** Event listener for word guessing form submit event */
$guessForm.on("submit", async (e) => {
  e.preventDefault();
  // check if game over
  if (gameOver) {
    //  don't allow any more words to be submitted
    return;
  }

  try {
    // send request to the server with word that user entered to check the word
    const response = await axios.post(`/guess`, { guess: $guessWord.val() });

    // Destructure response with the guessed word and the server's result of checking the guessed word
    const { word, result } = response.data;
    // Display a user friendly message based on result and update the score if the word was accepted
    displayMessageUpdateScore(word, result);
  } catch (err) {
    console.log(err);
  }
});

/** Accepts 
      word: the guessed word 
      result:  string returned from server after checking if the word is 'ok', 'not-word' or 'not-on-board'
      
    Updates DOM with a more user friendly message based on 'result'
    Updates DOM score if result = 'ok' */
const displayMessageUpdateScore = (word, result) => {
  let message = "";
  switch (result) {
    case "not-word":
      message = `'${word}' is not a valid word`;
      $message.addClass("error");
      $message.removeClass("success");
      break;
    case "not-on-board":
      message = `'${word}' is not a valid word on this board`;
      $message.addClass("error");
      $message.removeClass("success");
      break;
    case "ok":
      message = `'${word}' accepted`;
      $message.addClass("success");
      $message.removeClass("error");
      updateScore(word);
      break;
    default:
      message = ``;
      break;
  }

  $message.text(message);
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
      alertGameOver();
      clearInterval(x);
    }
  }, 1000);
};

/** Display a game over message to the user */
const alertGameOver = () => {
  $message.text("The game is over.");
  $message.addClass("error");
  $message.removeClass("success");
};

$(startTimer());
