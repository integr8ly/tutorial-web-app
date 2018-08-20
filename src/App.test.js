import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { baseName } from './routes';
import store from './redux/store';
import App from './App';

// const store = createStore((state = []) => state);

it('renders without crashing', () => {
  // Would you like to debug Jest tests in Chrome? See the following note:
  // https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#debugging-tests-in-chrome
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter basename={baseName}>
        <App />
      </BrowserRouter>
    </Provider>,
    div
  );
});
