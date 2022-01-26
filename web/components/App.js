import classnames from 'classnames';
import React from 'react';

import Guess from './Guess';
import Share from './Share';

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
  ],
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
          guesses: newGuesses,
        };
      }

      case 'resign':
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

      case 'game over':
      return {
        ...state,
        gameOver: true,
      };

      case 'presubmit':
      return {
        ...state,
        guesses: [
          ...state.guesses.slice(0, state.activeRow + 1),
          ...state.guesses.slice(state.activeRow + 1).map(row => row.map(g => ['', 3])),
          ...(state.guesses.length === state.activeRow + 1 ? [BLANK_GUESS] : [])
        ],
        lastGuessWasInvalid: false,
        loading: true,
      };

      case 'submit': {
        let newGuess;
        if (state.activeRow === 0) {
          newGuess = api.first_guess(state.guesses[0].map(g => g[1]));
        } else {
          newGuess = api.make_guess(
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
        if (newGuess == undefined) {
          return {
            ...state,
            lastGuessWasInvalid: true,
            loading: false,
          };
        } else {
          const newGuesses = [...state.guesses];
          newGuesses.splice(
            state.activeRow + 1,
            1,
            newGuess.split('').map(l => [l, 0]),
          );
          return {
            ...state,
            activeRow: state.activeRow + 1,
            guesses: newGuesses,
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
        id="errors"
        className={classnames(
          state.lastGuessWasInvalid && 'visible',
        )}
        role="alert">
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
      {state.gameOver && <div className="modal-wash">
        <div
          aria-modal="true"
          aria-labelledby="gameover-title"
          aria-describedby="gameover-description"
          className="modal"
          role="dialog">
          <h2 id="gameover-title" role="alert">Game Over</h2>
          <p id="gameover-description">
            You lasted {state.activeRow + 1} {state.activeRow === 0 ? 'round' : 'rounds'}.
            {state.activeRow >= 5 && (state.activeRow >= 6 ? ' Amazing!' : ' Great job!')}
          </p>
          <Share state={state} />
          <button className="modal-action secondary" onClick={() => {
            dispatch({type: 'reset'});
          }}>Start Over</button>
        </div>
      </div>}
      <div id="game-actions">
        <button className="game-action primary" onClick={() => {
          if (state.loading) {
            return;
          }
          if (state.guesses[state.activeRow].some(g => g[1] === 3)) {
            return;
          }
          if (state.guesses[state.activeRow].every(g => g[1] === 2)) {
            dispatch({type: 'game over'});
            return;
          }
          dispatch({type: 'presubmit'});
          setTimeout(() => {
            dispatch({type: 'submit'});
          }, 50);
        }}>Enter</button>
        <button className="game-action secondary" onClick={() => {
          !state.loading && dispatch({type: 'resign'});
        }}>That's Correct</button>
        <button className="game-action secondary" onClick={() => {
          !state.loading && dispatch({type: 'reset'});
        }}>Start Over</button>
      </div>
    </>
  );
}
