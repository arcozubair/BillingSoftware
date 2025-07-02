const numberToWords = require('number-to-words'); // Assuming you have this library installed

const numberToIndianWords = (num) => {
  const units = ["crore", "lakh", "thousand", "hundred", ""];

  const numbers = [10000000, 100000, 1000, 100, 1];

  let words = "";
  for (let i = 0; i < numbers.length; i++) {
    const tempNumber = Math.floor(num / numbers[i]);
    if (tempNumber > 0) {
      const word = numberToWords.toWords(tempNumber);
      // Capitalize the first character of the word
      const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
      words += `${capitalizedWord} ${units[i]} `;
      num = num % numbers[i];
    }
  }
  return words.trim();
};

module.exports = numberToIndianWords;
