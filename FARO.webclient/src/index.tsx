import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, configureStore, loadConfiguration, Router, Route } from 'app-support';
import { Switch, RouteComponentProps } from 'react-router';
import * as reducers from './reducers';
import App from './components/App';

import './styles/index.css';
import 'semantic-ui-css/semantic.min.css';

const store = configureStore(reducers.default, true);

loadConfiguration('config.json').then((cfg: { APPNAME: string }) => {
  ReactDOM.render(
    <Provider store={store}>
      <Router basename={cfg.APPNAME}>
        <Switch>
          <Route path={`/`} component={(p: RouteComponentProps<any>) => <App basic />} />
          <Route component={NoMatch} />
        </Switch>
      </Router>
    </Provider>,

    document.getElementById('root')
  );
});

const NoMatch = ({ location }: any) => (
  <div style={{ color: 'red' }}>
    <h3>
      WARNING : no match for <code>{location.pathname}</code>
    </h3>
  </div>
);