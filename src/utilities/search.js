import { stemmer } from 'stemmer';

const getWordArrayFromText = (text) => text.split(new RegExp(/[\s!._,'@?]+/));

// eslint-disable-next-line import/prefer-default-export
export const getSimilarWords = (searchTerm, text) => {
  let unsortedSimilarWords = [];
  const words = getWordArrayFromText(text);
  const lowerCaseWords = words.map((element) => element.toLowerCase());
  getWordArrayFromText(searchTerm).forEach((element) => {
    const lowerCaseElement = element.toLowerCase();
    const searchTermStem = stemmer(lowerCaseElement);
    const additionalWords = lowerCaseWords.filter((word) => stemmer(word) === searchTermStem);
    if (additionalWords.length > 0) {
      unsortedSimilarWords = unsortedSimilarWords.concat(additionalWords);
    } else {
      unsortedSimilarWords.push(element);
    }
  });

  // remove duplicates
  unsortedSimilarWords = [...new Set(unsortedSimilarWords)];

  // sort similar words by length so that, for example, we find and highlight aardvarks before
  // aardvark.  If we did not do this, for the example, it is possible than only the letters up
  // to the final 's' in aardvarks would be highlighted.
  return unsortedSimilarWords.sort((a, b) => b.length - a.length);
};
