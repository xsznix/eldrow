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
      alert(`${secret.toUpperCase()} is in Eldrow's dictionary. Check your hints for ${letters.toUpperCase()} and try again.`);
      return;
    }
  }

  alert("Whoa, you found a bug! Send me an email at eldrowfeedback2068@xzn.me with a screenshot of your game and I'll look into it.");
}
