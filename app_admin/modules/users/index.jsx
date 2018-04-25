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

class Users extends Component {

  constructor() {
    super();

    this.unsubscribes = [];

    this.errorMsg = '';

    this.save = this.save.bind(this);
    this.cancel = this.cancel.bind(this);

    this.state = {
      users: [],
      formContainerTop: -formContainerHeight
    };
  }

  componentWillMount() {
    this.unsubscribes.push(CoreStores.UsersStore.listen(users => this.setData(users)));
    this.unsubscribes.push(CoreStores.UserProfileStore.listen(user => this.setUser(user)));
  }

  componentDidMount() {
    CoreActions.ActionsUsers.getUsers();
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setData(users) {
    this.setState({users});
  }

  setUser(user = {}) {
    Object.keys(user).forEach(key => {
      user[key] = user[key] || '';
    });

    this.setState({user});
  }

  getUserRows() {
    const header = (
      <div key={'header'} style={{...styles.rowContainer, borderBottom: '1px solid #B7B8BD'}}>
        <span style={styles.columnName}>{'First Name'}</span>
        <span style={styles.columnName}>{'Last Name'}</span>
        <span style={styles.columnName}>{'Login'}</span>
        <span style={styles.column}>{'Role'}</span>
        <span style={styles.columnAction}>
          {this.state.formContainerTop < 0 ? <button style={styles.actionButton} onClick={() => this.edit()}>Add</button> : null}
        </span>
      </div>
    );

    return [header, ...this.state.users.map(({id, login, firstName, lastName, role}) => (
      <div key={id} style={styles.rowContainer}>
        <span style={styles.columnName}>{firstName}</span>
        <span style={styles.columnName}>{lastName}</span>
        <span style={styles.columnName}>{login}</span>
        <span style={styles.column}>{role}</span>
        <div style={styles.columnAction}>
          <button style={styles.actionButton} onClick={() => this.edit(id)}>Edit</button>
          <button style={styles.actionButton} onClick={() => this.delete(id, firstName)}>Delete</button>
        </div>
      </div>
    ))];
  }

  edit(id) {
    this.setState({formContainerTop: 90, user: {}}, () => id ? CoreActions.ActionsUser.getUser(id) : this.setUser());
  }

  save(user) {
    CoreActions.ActionsUser.saveUser(user, () => {
      this.cancel();
    },
    errorMsg => {
      this.errorMsg = errorMsg || '';

      this.forceUpdate();

      //this.handleAuthError(errorMsg);
      //callback();
    });
  }

  cancel() {
    this.errorMsg = '';
    this.setState({formContainerTop: -formContainerHeight}, () => CoreActions.ActionsUsers.getUsers());
  }

  delete(id, firstName) {
    if (confirm(`Are you realy want to delete user ${firstName}?`)) {
      CoreActions.ActionsUser.deleteUser(id, () => this.cancel());
    }
  }

  render() {
    return (
      <div style={styles.container}>
        <h3>Users List</h3>
        <div style={styles.container}>
          {this.getUserRows()}
        </div>
        <div style={{...styles.formContainer, top: this.state.formContainerTop}}>
          <UserForm
            user={this.state.user}
            onSave={this.save}
            onCancel={this.cancel}
            errorMsg={this.errorMsg}
          />
        </div>
      </div>
    );
  }
}

Users.propTypes = propTypes;

export default injectIntl(Users);

const formContainerHeight = 400;

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 600,
    zIndex: 1
  },

  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 30,
    padding: '5px 0'
  },

  columnName: {
    width: 150
  },

  columnAction: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 100
  },

  column: {
    width: 100
  },

  actionButton: {
    marginLeft: 5
  },

  formContainer: {
    position: 'absolute',
    top: -formContainerHeight,
    transition: 'top 0.5s ease-in-out',
    left: 650
  }
};
