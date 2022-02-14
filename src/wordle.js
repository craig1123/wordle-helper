const words = require("./words.js");
const allWords = require("./allWords.js");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const guesses = document.getElementById("guesses");
  const restart = document.getElementById("restart");
  const firstLetter = document.getElementById("letter1");
  const possibleWords = document.getElementById("possible-words");
  const wordCount = document.getElementById("word-count");
  const mostCommon = document.getElementById("most-common");
  const bestWords = document.getElementById("best-words");

  let guessedWords = [];
  form.addEventListener("submit", onSubmit);
  restart.addEventListener("click", onRestart);

  for (let i = 1; i <= 5; i++) {
    const letterEl = document.getElementById(`letter${i}`);
    letterEl.addEventListener("keyup", onKeyUp);
    letterEl.addEventListener("click", onClick);
  }

  draw();

  function onKeyUp(e) {
    const { value, id } = e.target;

    // delete button
    if (e.keyCode === 8 && !value) {
      const currentIndex = Number(id.replace("letter", ""));
      const nextInput = document.getElementById(`letter${currentIndex - 1}`);
      if (nextInput) {
        nextInput.focus();
      }
      return;
    }

    const regex = /[a-zA-Z]+$/; // only letters
    if (!value.match(regex)) {
      e.target.value = "";
      return;
    }
    const currentIndex = Number(id.replace("letter", ""));
    const nextInput = document.getElementById(`letter${currentIndex + 1}`);
    if (nextInput) {
      nextInput.focus();
    } else {
      form.elements[6].focus(); // button
    }
  }

  function onRestart() {
    guessedWords = [];
    wordCount.textContent = "Possible Words";
    Array.from(guesses.children).forEach((child) => {
      if (child.className === "row guess-row") {
        child.remove();
      }
    });
    // reset possible words
    while (possibleWords.firstChild) {
      possibleWords.removeChild(possibleWords.lastChild);
    }
    firstLetter.focus();
    resetForm();
    draw();
  }

  function onClick(e) {
    const { dataset, value } = e.target;
    if (!value) {
      return;
    }
    switch (dataset.valid) {
      case "1": {
        e.target.dataset.valid = "2";
        e.target.className = "tile correct";
        break;
      }
      case "2": {
        e.target.dataset.valid = "0";
        e.target.className = "tile";
        break;
      }

      default: {
        e.target.dataset.valid = "1";
        e.target.className = "tile present";
        break;
      }
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const word = [];
    for (let i = 0; i < 5; i++) {
      const { value, dataset } = e.target.elements[i];
      if (!value) {
        break;
      }
      word.push({ letter: value.toLowerCase(), valid: Number(dataset.valid) });
    }

    if (word.length !== 5) {
      return;
    }

    guessedWords.push(word);
    drawGuessRow();
    resetForm();
    draw();
    return false;
  }

  function drawGuessRow() {
    const row = document.createElement("div");
    row.className = "row guess-row";
    const word = guessedWords[guessedWords.length - 1];

    word.forEach((el) => {
      const tile = document.createElement("div");
      let validClass = "";
      if (el.valid === 2) {
        validClass = "correct";
      } else if (el.valid === 1) {
        validClass = "present";
      }
      tile.className = `tile small-tile ${validClass}`;
      tile.dataset.valid = el.valid;
      tile.textContent = el.letter;
      row.appendChild(tile);
    });

    // click row to remove guess
    row.onclick = function () {
      const index =
        Array.prototype.indexOf.call(this.parentElement.children, this) - 1;
      this.parentElement.removeChild(this);
      resetWords();
      guessedWords.splice(index, 1);
      draw();
    };
    guesses.appendChild(row);
  }

  function draw() {
    const possibleWordles = wordle(guessedWords);
    const possibleWordlesLength = possibleWordles.length;
    wordCount.textContent = `Possible Words: ${possibleWordlesLength}`;

    // correct word
    if (possibleWordlesLength === 1) {
      const item = document.createElement("li");
      item.textContent = possibleWordles[0];
      item.style.fontSize = "30px";
      item.style.fontWeight = "bold";
      item.style.textTransform = "uppercase";
      item.style.textAlign = "center";
      possibleWords.appendChild(item);
    } else {
      possibleWordles.forEach((word) => {
        const item = document.createElement("li");
        item.textContent = word;
        possibleWords.appendChild(item);
      });
    }

    // Draw to most common letters
    const commonLetters = mostCommonLetters(
      possibleWordles,
      guessedWords.flat().map((word) => word.letter)
    );
    commonLetters.forEach((word) => {
      const item = document.createElement("li");
      const [key, value] = Object.entries(word)[0];
      item.textContent = `${key}: ${value}`;
      mostCommon.appendChild(item);
    });

    // draw to "try one of these"
    const topCommonLetters = commonLetters
      .slice(0, 5)
      .map((word) => Object.keys(word)[0]);
    let theBest = getBestWord(topCommonLetters);
    if (theBest.length === 0) {
      theBest = getBestWord(topCommonLetters.slice(0, 4));
    }
    theBest.forEach((word) => {
      const item = document.createElement("li");
      item.textContent = word;
      bestWords.appendChild(item);
    });
  }

  function resetForm() {
    // reset form
    for (let i = 0; i < 5; i++) {
      form.elements[i].className = "tile";
      form.elements[i].dataset.valid = "0";
    }
    form.reset();
    resetWords();
  }

  function resetWords() {
    // remove possible words
    while (possibleWords.firstChild) {
      possibleWords.removeChild(possibleWords.lastChild);
    }
    // remove most common letters
    while (mostCommon.firstChild) {
      mostCommon.removeChild(mostCommon.lastChild);
    }
    // remove best words
    while (bestWords.firstChild) {
      bestWords.removeChild(bestWords.lastChild);
    }
  }
});

/**
 * Give an array of array of guessed letters, return the possible words
 * @param {array} guessedWords
 * @returns string[] possible words
 */
function wordle(guessedWords) {
  const guessedWordsLength = guessedWords.length;
  if (guessedWordsLength === 0) {
    return words;
  }

  let possibleWords = [];
  const incorrectGuessedLetters = guessedWords
    .flat()
    .map((word) => (word.valid === 0 ? word : null))
    .filter(Boolean);

  const validLetters = guessedWords
    .map((words) =>
      words
        .map((word, index) => {
          if (word.valid === 0) {
            return null;
          } else if (word.valid === 2) {
            return {
              ...word,
              index,
            };
          }
          return word;
        })
        .filter(Boolean)
    )
    .flat();

  words
    .filter((word) => {
      // filter out all the words that include the bad guessed letters
      let hasGuessedLetter = true;
      incorrectGuessedLetters.forEach(({ letter }) => {
        if (hasGuessedLetter && word.includes(letter)) {
          hasGuessedLetter = false;
        }
      });
      return hasGuessedLetter;
    })
    .forEach((word) => {
      const pushIt = shouldItPush(word, guessedWords, guessedWordsLength);
      // word needs to have all yellow and green letters in word
      let hasAll = true;
      validLetters.forEach(({ valid, letter, index }) => {
        if (!word.includes(letter)) {
          hasAll = false;
        } else if (valid === 2 && word[index] !== letter) {
          hasAll = false;
        }
      });
      if (hasAll && pushIt) {
        possibleWords.push(word);
      }
    });

  return possibleWords;
}

function shouldItPush(word, guessedWords, guessedWordsLength) {
  // figure out if it should be pushed
  for (let curIndex = 0; curIndex < guessedWordsLength; curIndex++) {
    const mostRecentWord = guessedWords[curIndex];
    for (let i = 0; i < mostRecentWord.length; i++) {
      const el = mostRecentWord[i];
      const letterIsInWord = word.includes(el.letter);
      if (el.valid === 1 && letterIsInWord && word[i] === el.letter) {
        return false; // yellow can't the letter in the exact spot
      } else if (el.valid === 2 && !letterIsInWord) {
        return false;
      } else if (el.valid === 2 && letterIsInWord && word[i] !== el.letter) {
        return false; // all words have to have the letter in the exact place
      } else if (el.valid === 0 && letterIsInWord) {
        return false;
      }
    }
  }

  return true; // starts with true as it'll add all lettres
}

function mostCommonLetters(possibles, used) {
  const mapOfLetters = {};
  possibles.forEach((word) => {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (used.includes(letter)) {
        continue;
      }
      if (mapOfLetters[letter]) {
        mapOfLetters[letter]++;
      } else {
        mapOfLetters[letter] = 1;
      }
    }
  });

  return Object.keys(mapOfLetters)
    .sort((a, b) => mapOfLetters[b] - mapOfLetters[a])
    .map((letter) => ({ [letter]: mapOfLetters[letter] }));
}

// use this if you want to find a word to use
function getBestWord(topCommonLetters) {
  if (topCommonLetters.length < 4) {
    return [];
  }
  return allWords.filter((word) => {
    let hasAll = true;
    topCommonLetters.forEach((letter) => {
      if (hasAll && !word.includes(letter)) {
        hasAll = false;
      }
    });
    return hasAll;
  });
}
