'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {FormattedMessage, injectIntl} from 'react-intl'; // eslint-disable-line no-unused-vars
import CoreStores from 'core/stores';

//const localePrefix = 'user';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    errorMsg: PropTypes.string.isRequired,
    user: PropTypes.object
  };

const formFields = [
  {
    name: 'login',
    type: 'text',
    title: 'Login',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    title: 'Password',
    required: false
  },
  {
    name: 'password1',
    type: 'password',
    title: 'Re-Password',
    required: false
  },
  {
    name: 'role',
    type: 'select',
    options: ['user', 'admin'],
    title: 'Role',
    required: false
  },
  {
    name: 'firstName',
    type: 'text',
    title: 'First Name',
    required: true
  },
  {
    name: 'lastName',
    type: 'text',
    title: 'Last Name',
    required: false
  },
  {
    name: 'email',
    type: 'text',
    title: 'E-mail',
    required: false
  },
  {
    name: 'phone',
    type: 'text',
    title: 'Phone',
    required: false
  },
  {
    name: 'address',
    type: 'text',
    title: 'Address',
    required: false
  }
];

class UserForm extends Component {

  constructor(props) {
    super();

    this.state = {};

    let state = {};

    formFields.forEach(field => {
      if (field.type === 'select') {
        state[field.name] = field.options[0];
      } else {
        state[field.name] = '';
      }
    });

    state.errorMsg = props.errorMsg;

    this.state = state;

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user && !Object.keys(nextProps.user).length) {
      let state = {id: null};

      formFields.forEach(field => {
        if (field.type === 'select') {
          state[field.name] = field.options[0];
        } else {
          state[field.name] = '';
        }
      });

      this.setState(state);
    } else {
      !_.isEqual(nextProps.user, this.props.user) && this.setState(nextProps.user);
    }

    !_.isEqual(nextProps.errorMsg, this.props.errorMsg) && this.setState({errorMsg: nextProps.errorMsg});
  }

  onChange(field, e) {
    let obj = {};

    obj[field] = e.target.value.trim();

    this.setState(obj);
  }

  save() {
    if (this.verifyData()) {
      this.props.onSave(this.state, () => {
        this.setState({
          password: '',
          password1: ''
        });
      });
    }
  }

  verifyData() {
    let res = true,
      errorMsg = '';

    if (!this.state.firstName) {
      errorMsg = `First name is required`;
      res = false;
    }

    if (this.state.password != this.state.password1) {
      errorMsg = `Password dosn't match`;
      res = false;
    }

    if (!this.state.login) {
      errorMsg = `Login is required`;
      res = false;
    }

    this.setState({errorMsg});

    return res;
  }

  getForm() {
    return formFields.map(({name, type, title, required, options}) => (
      <div key={name} style={styles.itemContainer}>
        <span style={styles.itemCaption}>{title}</span>
        {type !== 'select' ? // eslint-disable-line no-negated-condition
          <input
            ref={name}
            type={type}
            value={this.state[name]}
            onChange={e => this.onChange(name, e)}
          /> :
          name !== 'role' || CoreStores.AuthorizationStore.getAuthData('role') === 'admin' ?
            <select
              style={{height: 28}}
              onChange={e => this.onChange(name, e)}
              value={this.state[name]}
            >
              {options.map((value, idx) =>
                (<option
                  key={idx}
                  value={value}
                 >{value}</option>)
              )}
            </select> : null
        }

        {required ?
          <span style={styles.required} title="required field">*</span> : null
        }
      </div>
    ));
  }

  render() {
    return (
      <div style={styles.container}>
        {this.getForm()}
        <div style={{...styles.itemContainer, justifyContent: 'space-between'}}>
          <span style={styles.errorMsg}>{this.state.errorMsg}</span>
          <div style={styles.buttonContainer}>
            {this.props.onCancel ?
              <button style={styles.button} onClick={() => this.props.onCancel()}>Cancel</button> : null
            }
            <button style={styles.button} onClick={() => this.save()}>Save</button>
          </div>
        </div>
      </div>
    );
  }
}

UserForm.propTypes = propTypes;

UserForm.defaultProps = {
  onCancel: null,
  user: null
};

export default injectIntl(UserForm);

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
    top: 8,
    fontWeight: 'bold'
  },

  errorMsg: {
    color: '#ff0000',
    marginLeft: 10,
    fontWeight: 'bold'
  },

  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },

  button: {
    marginLeft: 10
  }
};
