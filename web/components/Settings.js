import React from 'react';

const html = document.documentElement;

export default function Settings() {
  const [colorBlind, setColorBlind] = useSetting(
    'eldrow-colorblind',
    false,
    'colorblind',
  );
  const [highContrast, setHighContrast] = useSetting(
    'eldrow-high-contrast',
    false,
    'high-contrast',
  );
  return <div id="settings">
    <div>
      <input
        type="checkbox"
        id="colorblind"
        defaultChecked={colorBlind}
        onChange={setColorBlind}
      />
      <label htmlFor="colorblind">Color-blind mode</label>
    </div>
    <div>
      <input
        type="checkbox"
        id="high-contrast"
        defaultChecked={highContrast}
        onChange={setHighContrast}
      />
      <label htmlFor="high-contrast">High contrast mode</label>
    </div>
  </div>;
}

function useSetting(storageKey, defaultValue, className) {
  const [value, setValue] = React.useState(
    () => {
      const val = localStorage.getItem(storageKey);
      const boolVal = val ? val === 'true' : defaultValue;
      if (boolVal) {
        html.classList.add(className);
      }
      return boolVal;
    }
  );
  return [value, e => {
    const newValue = !!e.target.checked;
    setValue(newValue);
    localStorage.setItem(storageKey, newValue);
    if (newValue) {
      html.classList.add(className);
    } else {
      html.classList.remove(className);
    }
  }];
}
