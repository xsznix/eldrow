import classnames from 'classnames';
import React from 'react';

import Guess from './Guess';
import Scores from './Scores';
import Settings from './Settings';
import Share from './Share';

import {markAsFound} from '../scores';

const BLANK_GUESS = [['', 3], ['', 3], ['', 3], ['', 3], ['', 3]];
const INITIAL_STATE = {
  activeRow: 0,
  guesses: [
    [['s', 0], ['e', 0], ['r', 0], ['a', 0], ['i', 0]],
    BLANK_GUESS,
    BLANK_GUESS,
    BLANK_GUESS,
    BLANK_GUESS,
    BLANK_GUESS,
    BLANK_GUESS,
    BLANK_GUESS,
  ],
  lastGuessIsCandidate: true,
  lastGuessWasInvalid: false,
  loading: false,
  gameOver: false,
};

export default function App({api}) {
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case 'toggle tile': {
        const oldTile = state.guesses[action.row][action.index];
        const newGuess = [...state.guesses[action.row]];
        newGuess.splice(
          action.index,
          1,
          [oldTile[0], (oldTile[1] + 1) % 3],
        );
        const newGuesses = [
          ...state.guesses.slice(0, action.row),
          newGuess,
          ...state.guesses.slice(action.row + 1).map(row => row.map(g => [g[0], 3])),
        ];
        return {
          ...state,
          activeRow: action.row,
          gameOver: false,
          guesses: newGuesses,
          lastGuessIsCandidate: false,
        };
      }

      case 'resign':
      markAsFound(
        state.activeRow,
        state.guesses[state.activeRow].map(g => g[0]).join(''),
      );
      return {
        ...state,
        gameOver: true,
        guesses: [
          ...state.guesses.slice(0, state.activeRow),
          state.guesses[state.activeRow].map(g => [g[0], 2]),
          ...state.guesses.slice(state.activeRow + 1).map(row => BLANK_GUESS),
        ],
        lastGuessWasInvalid: false,
      };

      case 'presubmit':
      return {
        ...state,
        guesses: [
          ...state.guesses.slice(0, state.activeRow + 1),
          ...state.guesses.slice(state.activeRow + 1).map(row => BLANK_GUESS),
          ...(state.guesses.length === state.activeRow + 1 ? [BLANK_GUESS] : [])
        ],
        lastGuessWasInvalid: false,
        loading: true,
      };

      case 'submit': {
        let newGuessWithFlag;
        if (state.activeRow === 0) {
          newGuessWithFlag = api.first_guess(...state.guesses[0].map(g => g[1]));
        } else {
          newGuessWithFlag = api.make_guess(
            state.guesses
              .slice(0, state.activeRow + 1)
              .map(guess => {
                const letters = guess.map(g => g[0]).join('');
                const scores = guess.map(g => g[1].toString()).join('');
                return letters + scores;
              })
              .join(' '),
          );
        }
        if (newGuessWithFlag == undefined) {
          return {
            ...state,
            lastGuessWasInvalid: true,
            loading: false,
          };
        } else {
          const newGuess = newGuessWithFlag.substring(0, 5);
          if (newGuess === state.guesses[state.activeRow].map(g => g[0]).join('')) {
            return {
              ...state,
              gameOver: true,
              loading: false,
            };
          }
          const flag = newGuessWithFlag[5];
          const gameOver = flag === '!';
          if (gameOver) {
            markAsFound(state.activeRow + 1, newGuess);
          } else if (flag === '.') {
            markAsFound(state.activeRow + 1, newGuess);
          }
          const newGuesses = [...state.guesses];
          newGuesses.splice(
            state.activeRow + 1,
            1,
            newGuess.split('').map(l => [l, gameOver ? 2 : 0]),
          );
          return {
            ...state,
            activeRow: state.activeRow + 1,
            gameOver,
            guesses: newGuesses,
            lastGuessIsCandidate: flag === '.',
            loading: false,
          };
        }
      }

      case 'reset':
      return INITIAL_STATE;

      default:
      return state;
    }
  }, INITIAL_STATE);
  return (
    <>
      <div
        id="notice"
        className={classnames(
          state.gameOver && 'success',
          state.lastGuessWasInvalid && 'error',
        )}
        role="alert">
        {state.gameOver && <>
          Game over! You lasted {state.activeRow + 1} {state.activeRow === 0 ? 'turn' : 'turns'}.
        </>}
        {state.lastGuessWasInvalid && <>No words match your hints! Try again.</>}
      </div>
      <section aria-label="Guesses">
        {state.guesses.map((guess, i) => (
          <Guess
            key={i}
            active={i <= state.activeRow}
            dispatch={dispatch}
            guess={guess}
            loading={state.loading && state.activeRow === i - 1}
            row={i}
          />
        ))}
      </section>
      <div id="game-actions">
        {state.gameOver ?
          <Share state={state} /> :
          <button
            className="game-action primary"
            onClick={() => {
              if (state.loading) {
                return;
              }
              dispatch({type: 'presubmit'});
              setTimeout(() => {
                dispatch({type: 'submit'});
              }, 50);
            }}>
            Enter
          </button>}
        {!state.gameOver && <button
          className="game-action secondary"
          disabled={!state.lastGuessIsCandidate}
          onClick={() => {
            !state.loading && dispatch({type: 'resign'});
          }}>
          That's Correct
        </button>}
        <button className="game-action secondary" onClick={() => {
          !state.loading && dispatch({type: 'reset'});
        }}>Start Over</button>
      </div>
      <Settings />
      <Scores forceRefresh={state.guesses} />
    </>
  );
}
