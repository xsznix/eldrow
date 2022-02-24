const ORANGE = '🟧';
const YELLOW = '🟨';
const GREEN = '🟩';
const BLUE = '🟦';
const GREY = '⬛';

export default function doubleCheck(state, api) {
  const secret = prompt('What is your secret word?')?.toLowerCase();
  if (secret == null) {
    return;
  }

  if (!/^[a-z]{5}$/.test(secret)) {
    alert("That's not a string of five letters, so it can't be the answer.");
    return;
  }

  if (api.make_guess(`${secret}22222`, false) == undefined) {
    alert(`${secret.toUpperCase()} is not in Eldrow's dictionary.`);
    return;
  }

  let guessStrs = [];
  for (const guess of state.guesses.slice(0, state.activeRow + 1)) {
    const letters = guess.map(g => g[0]).join('');
    const scores = guess.map(g => g[1].toString()).join('');
    const guessStr = letters + scores;
    guessStrs.push(guessStr);
    if (api.make_guess([...guessStrs, `${secret}22222`].join(' '), state.easy) == undefined) {
      const colorblind = localStorage.getItem('eldrow-colorblind') === 'true';
      const hints = [GREY, GREY, GREY, GREY, GREY];
      const remainingSecretLetters = secret.split('');
      for (let i = 4; i >= 0; i--) {
        if (letters[i] === secret[i]) {
          hints[i] = colorblind ? ORANGE : GREEN;
          remainingSecretLetters.splice(i, 1);
        }
      }
      for (let i = 0; i < 5; i++) {
        if (letters[i] === secret[i]) {
          continue;
        }
        const found = remainingSecretLetters.indexOf(letters[i]);
        if (found !== -1) {
          hints[i] = colorblind ? BLUE : YELLOW;
          remainingSecretLetters.splice(found, 1);
        }
      }
      alert(`${secret.toUpperCase()} is in Eldrow's dictionary. Check your colors for ${letters.toUpperCase()}: ${hints.join('')}`);
      return;
    }
  }

  alert("Whoa, you found a bug! Send me an email at eldrowfeedback2068@xzn.me with a screenshot of your game and I'll look into it.");
}
