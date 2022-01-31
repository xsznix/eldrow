import copy from 'copy-to-clipboard';
import React from 'react';

const EMOJIS = ['⬛', '🟨', '🟩'];
function share(state) {
  copy(
`Eldrow ${state.easy ? '(Easy) ' : ''}${state.activeRow + 1}/${state.easy ? 16 : 8}

${state.guesses.slice(0, state.activeRow + 1)
  .map(row => row.map(g => EMOJIS[g[1]]).join(''))
  .join('\n')
}

https://www.simn.me/eldrow`);
}

export default function Share({state}) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (copied) {
      const t = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => {
        clearTimeout(t);
      };
    }
  }, [copied]);
  return <button className="game-action primary" onClick={() => {
    share(state);
    setCopied(true);
  }}>{copied ? 'Copied!' : 'Share'}</button>;
}
