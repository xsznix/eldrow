import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

import('../pkg/reverse_wordle.js').then(api => {
  ReactDOM.render(
    <React.StrictMode>
      <App api={api} />
    </React.StrictMode>,
    document.getElementById('react-root'),
  );
})
