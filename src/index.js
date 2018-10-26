import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
// import 'patternfly/dist/css/rcue.css';
// import 'patternfly/dist/css/rcue-additions.css';
// import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@patternfly/patternfly-next/patternfly.min.css';
import './styles/.css/index.css';

import App from './App';
import { baseName } from './routes';
import store from './redux/store';

ReactDOM.render(
  <Provider store={store}>
    <Router basename={baseName}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
