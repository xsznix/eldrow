import React from 'react';

import {getFoundWords, onFoundWordsUpdate} from '../scores';

const {useEffect, useLayoutEffect, useState} = React;

const EMPTY_ARRAY = [];

export default function FoundWordsList({easy, guessLength, onClose}) {
  const [wordList, setWordList] = useState(EMPTY_ARRAY);

  useLayoutEffect(() => {
    setWordList(getFoundWords(guessLength, easy));
  }, [guessLength, easy]);

  useEffect(() => {
    return onFoundWordsUpdate(guessLength, easy, () => {
      requestAnimationFrame(() => {
        setWordList(getFoundWords(guessLength, easy));
      });
    });
  }, [guessLength, easy]);

  return <section id="found-words" aria-labelledby="found-words-title">
    <h2 id="found-words-title">{guessLength + 1}-guess words you&rsquo;ve found{easy && ' (easy)'}</h2>
    <a href="#" onClick={e => {
      e.preventDefault();
      onClose();
    }}>Hide this section</a>
    <ul id="found-words-list">
      {wordList.map(word => <li key={word}>{word}</li>)}
    </ul>
  </section>;
}
