const words = require("./words.js");
const allWords = require("./allWords.js");
// TODO: Use only command line. Save past words
/* 
Enter word letter by letter with their valid number
0 == gray
1 == yellow
2 == green
*/
const possibleWords = wordle(
  [
    { letter: "", valid: 0 },
    { letter: "", valid: 0 },
    { letter: "", valid: 0 },
    { letter: "", valid: 0 },
    { letter: "", valid: 0 },
  ],
  // incorrect guessed letters go here
  "",
  // word has to include these letters from past guesses
  ""
);
// type in used letters here
const usedLetters = "";

console.log(possibleWords, possibleWords.length + " total possible words");
console.log(
  "Try These Letters:",
  mostCommonLetters(possibleWords, usedLetters)
);

// uncomment below and enter up to 5 letters. It'll spit out the best word to try next
// const bestWordsToTry = getBestWord(['', '', '', '', '']);
// console.log('best words to try next:', bestWordsToTry);
// console.log('Best Word in possible words:', isBestWordAPossible(possibleWords, bestWordsToTry));

function wordle(input, guessedLetters, hasToHaveTheseLetters) {
  let possibleWords = [];
  const guessedSplit = guessedLetters.split("");
  const hasToHaveThese = hasToHaveTheseLetters
    .split("")
    .map((letter) => ({ letter }));
  const validLetters = input
    .map((el) => (el.valid > 0 ? el : null))
    .filter(Boolean)
    .concat(hasToHaveThese);

  words
    .filter((word) => {
      // filter out all the words that include the guessed letters
      let hasGuessedLetter = true;
      guessedSplit.forEach((letter) => {
        if (hasGuessedLetter && word.includes(letter)) {
          hasGuessedLetter = false;
        }
      });
      return hasGuessedLetter;
    })
    .forEach((word) => {
      // figure out if it should be pushed
      let pushIt = false;
      for (let i = 0; i < input.length; i++) {
        const el = input[i];
        const letterIsInWord = word.includes(el.letter);
        if (el.valid === 1 && letterIsInWord) {
          if (word[i] === el.letter) {
            break; // yellow can't the letter in the exact spot
          }
          pushIt = true;
        } else if (el.valid === 2 && !letterIsInWord) {
          pushIt = false;
          break;
        } else if (el.valid === 2 && letterIsInWord && word[i] === el.letter) {
          pushIt = true; // all words have to have the letter in the exact place
        } else if (el.valid === 2 && letterIsInWord && word[i] !== el.letter) {
          pushIt = false;
          break;
        }
      }

      // word needs to have all yellow and green letters in word
      let hasAll = true;
      validLetters.forEach(({ letter }) => {
        if (!word.includes(letter)) {
          hasAll = false;
        }
      });
      if (hasAll && pushIt) {
        possibleWords.push(word);
      }
    });

  return possibleWords;
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
function getBestWord(topLetters) {
  return allWords.filter((word) => {
    let hasAll = true;
    topLetters.forEach((letter) => {
      if (hasAll && !word.includes(letter)) {
        hasAll = false;
      }
    });
    return hasAll;
  });
}

function isBestWordAPossible(possibles, bests) {
  const morePossible = [];
  possibles.forEach((word) => {
    if (bests.includes(word)) {
      morePossible.push(word);
    }
  });
  return morePossible;
}
