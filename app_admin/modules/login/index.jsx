'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Redirect, withRouter} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
import Constants from 'core/constants';
import CoreActions from 'core/actions';
import CoreStores from 'core/stores';

const {pathPrefix} = Constants;

//const localePrefix = 'auth';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  },
  containerHeight = 120,
  containerShadow = 5;

class Login extends Component {

  constructor() {
    super();

    this.mounted = false;

    this.state = {containerHeight: -containerHeight - containerShadow};

  }

  componentDidMount() {
    this.mounted = true;
    setTimeout(() => {
      this.mounted && this.setState({containerHeight: 40});
    }, 100);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  login() {
    if (this.refs.login.value.trim() && this.refs.password.value.trim()) {
      const {from} = this.props.location.state || {from: {pathname: `${pathPrefix}/`}};

      CoreActions.ActionsAuth.performAuth(this.refs.login.value.trim(), this.refs.password.value.trim(), errorMsg => {
        if (!errorMsg) {
          if (this.mounted) {
            this.setState({containerHeight: -containerHeight - containerShadow}, () => {
              setTimeout(() => this.props.history.push(from), 600);
            });
          } else {
            this.props.history.push(from);
          }

          return;
        }

        //this.handleAuthError(errorMsg);
        this.refs.password.value = '';
      });
    }
  }

  onKeyDown(e) {
    if (e.keyCode === 13) {
      e.stopPropagation();

      e.target === this.refs.login && e.target.value.trim().length && this.refs.password.focus();

      e.target === this.refs.password && this.login();
    }

  }

  render() {
    if (CoreStores.AuthorizationStore.getAuthData('token', '')) {
      return <Redirect to={{pathname: `${pathPrefix}/`}} />;
    }

    return (
      <div style={{...styles.container, top: this.state.containerHeight}}>
        <input ref="login" type="text" defaultValue={'admin'} onKeyDown={e => this.onKeyDown(e)}/>
        <input ref="password" type="password" defaultValue={'123456'} onKeyDown={e => this.onKeyDown(e)} />
        <button onClick={() => this.login()}>Sign in</button>
      </div>
    );
  }
}

Login.propTypes = propTypes;

export default withRouter(injectIntl(Login));

const styles = {
  container: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: containerHeight,
    width: 250,
    right: containerShadow,
    padding: 10,
    border: '1px solid #B7B8BD',
    boxShadow: `${containerShadow}px ${containerShadow}px ${containerShadow}px rgba(0, 0, 0, 0.3)`,
    transition: 'top 0.5s ease-in-out'
  }
};
