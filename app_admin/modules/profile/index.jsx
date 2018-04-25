'use strict';

import React, {Component} from 'react';
//import PropTypes from 'prop-types';
//import {Redirect, withRouter} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
import CoreStores from 'core/stores';
import CoreActions from 'core/actions';

import UserForm from 'core/components/userForm';

//const localePrefix = 'user';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    //history: PropTypes.object.isRequired
  };

class Profile extends Component {

  constructor() {
    super();

    this.unsubscribes = [];

    this.errorMsg = '';

    this.save = this.save.bind(this);

    this.state = {};
  }

  componentWillMount() {
    this.unsubscribes.push(CoreStores.UserProfileStore.listen(user => this.setData(user)));
  }

  componentDidMount() {
    CoreActions.ActionsUser.getUser();
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setData(user) {
    Object.keys(user).forEach(key => {
      user[key] = user[key] || '';
    });

    this.setState(user);
  }

  save(user, callback) {
    CoreActions.ActionsUser.saveUser(user, () => {/* empty function */}, errorMsg => {
      this.errorMsg = errorMsg || '';

      this.forceUpdate();
      //this.handleAuthError(errorMsg);
      callback();
    });
  }

  render() {
    return (
      <div style={styles.container}>
        <h3>User Profile</h3>
        <UserForm
          user={this.state}
          onSave={this.save}
          errorMsg={this.errorMsg}
        />
      </div>
    );
  }
}

Profile.propTypes = propTypes;

export default injectIntl(Profile);

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 400,
    width: 350
  },

  itemContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  itemCaption: {
    width: 130
  },

  required: {
    position: 'absolute',
    right: -15,
    top: 8
  },

  errorMsg: {
    color: '#ff0000',
    marginLeft: 10,
    fontWeight: 'bold'
  }
};
