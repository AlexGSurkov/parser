'use strict';

import React, {Component} from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Route,
  //Link,
  //withRouter,
  Redirect
} from "react-router-dom";
//import createHistory from 'history/createBrowserHistory';
import {IntlProvider, addLocaleData} from 'react-intl';
import uk from 'react-intl/locale-data/uk';
import ru from 'react-intl/locale-data/ru';
import LanguageStore from './core/i18n/stores';
import CoreStores from 'core/stores';
//import CoreActions from 'core/actions';

import Menu from './modules/menu/';
import Main from './modules/main/';
import Login from './modules/login/';
import Profile from './modules/profile/';
import Users from './modules/users/';
import Shipments from './modules/shipments/';

/**
 * Main Components
 */
//import PopoverWindow from './core/components/popoverWindow';
import Loader from './core/components/loader/';
import Locales from './core/i18n';
import Constants from './core/constants';

const {pathPrefix} = Constants;

//const history = createHistory();

addLocaleData([...uk, ...ru]);

class App extends Component {

  constructor() {
    super();

    this.unsubscribes = [];

    this.state = {
      token: CoreStores.AuthorizationStore.getAuthData('token', ''),
      role: CoreStores.AuthorizationStore.getAuthData('role', '')
    };

  }

  componentWillMount() {
    this.unsubscribes.push(CoreStores.AuthorizationStore.listen(({token, role}) => this.setData(token, role)));
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setData(token, role) {
    this.setState({token, role});
  }

  render() {
    const authorized = Boolean(this.state.token),
      admin = this.state.role === 'admin';

    return (
      <IntlProvider
        locale={LanguageStore.getLang()}
        messages={{...Locales.getMessages(LanguageStore.getLang())}}
      >
        <div>
          <Loader />
          <Router>
            <div style={{position: 'relative', margin: '0 5%'}}>
              <Menu authorized={authorized} admin={admin} />
              <Route path={`${pathPrefix}/public`} component={Main} />
              <Route path={`${pathPrefix}/login`} component={Login} />
              <PrivateRoute path={`${pathPrefix}/profile`} permission={authorized} component={Profile} />
              <PrivateRoute path={`${pathPrefix}/users`} permission={authorized && admin} component={Users} />
              <PrivateRoute path={`${pathPrefix}/shipments`} permission={authorized} component={Shipments} />
            </div>
          </Router>
        </div>
      </IntlProvider>
    );
  }
}

let PrivateRoute = ({component: Component, permission, ...rest}) => ( //eslint-disable-line react/prop-types
  <Route
    {...rest}
    render={props =>
      permission ?
        <Component {...props} /> :
        <Redirect
          to={{
            pathname: `${pathPrefix}/login`,
            state: {from: props.location}
          }}
        />
      }
  />
);

PrivateRoute.propTypes = {
  location: PropTypes.object,
  permission: PropTypes.bool
};

PrivateRoute.defaultProps = {
  permission: false,
  location: null
};

(function() {
  try {
    render(<App />, document.getElementById('content'));
  } catch (e) {
    console.error(e);
  }
})();
