const $guessForm = $("#guess-form");
const $guessWord = $("#guess");
const $message = $("#message");
const $score = $("#score");

/** Event listener for word guessing form submit event */
$guessForm.on("submit", async (e) => {
  e.preventDefault();

  try {
    // send request to the server with word that user entered to check the word
    const response = await axios.post(`/guess`, { guess: $guessWord.val() });

    // Destructure response the guessed word and the server's result of checking the guessed word
    const { word, result } = response.data;
    // Display a user friendly message based on result and update the score if the word was accepted
    displayMessageUpdateScore(word, result);
  } catch (err) {
      console.log(err)
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
