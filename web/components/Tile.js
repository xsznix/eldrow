import classnames from 'classnames';
import React from 'react';

const LETTER_NAMES = {
  '': 'blank',
  'a': 'alpha',
  'b': 'bravo',
  'c': 'charlie',
  'd': 'delta',
  'e': 'echo',
  'f': 'foxtrot',
  'g': 'golf',
  'h': 'hotel',
  'i': 'india',
  'j': 'juliet',
  'k': 'kilo',
  'l': 'lima',
  'm': 'mike',
  'n': 'november',
  'o': 'oscar',
  'p': 'papa',
  'q': 'quebec',
  'r': 'romeo',
  's': 'sierra',
  't': 'tango',
  'u': 'uniform',
  'v': 'victor',
  'w': 'whiskey',
  'x': 'x-ray',
  'y': 'yankee',
  'z': 'zulu',
};
const SCORE_NAMES = ['not present', 'present', 'correct', ''];
const SCORE_CLASSNAMES = [
  'score-not-present',
  'score-present',
  'score-correct',
  'score-empty',
];

export default function Tile({active, dispatch, index, letter, loading, row, score}) {
  return (
    <button
      aria-label={`${LETTER_NAMES[letter]}, ${SCORE_NAMES[score]}`}
      className={classnames(
        'tile',
        active && 'active',
        loading && 'loading',
        SCORE_CLASSNAMES[score],
      )}
      disabled={!active}
      onClick={() => {
        active && dispatch({type: 'toggle tile', index, row});
      }}>
      {loading ? '.' : letter}
    </button>
  );
}
