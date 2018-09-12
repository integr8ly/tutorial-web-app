import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import 'patternfly/dist/css/patternfly.css';
import 'patternfly/dist/css/patternfly-additions.css';
import './styles/.css/index.css';

import App from './App';
import { baseName } from './routes';
import store from './redux/store';
import { manageUserWalkthrough } from './services/walkthroughServices';

manageUserWalkthrough(store.dispatch);

ReactDOM.render(
  <Provider store={store}>
    <Router basename={baseName}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
