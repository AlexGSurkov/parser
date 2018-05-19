'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
//import Constants from 'core/constants';

//const localePrefix = 'filter';

const propTypes = {
  //intl: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
  onFilter: PropTypes.func.isRequired
  //errorMsg: PropTypes.string.isRequired
};

let formFields = [
  {
    name: 'number',
    type: 'text',
    title: 'Number of Container'
  },
  {
    name: 'billOfLadingNumber',
    type: 'text',
    title: 'Bill of Lading'
  },
  {
    name: 'line',
    type: 'select',
    options: [''],
    title: 'Carrier'
  }
];

class FiltersForm extends Component {

  constructor() {
    super();

    let state = {
      disabled: true
    };

    formFields.forEach(field => {
      if (field.type === 'select') {
        state[field.name] = field.options[0];
      } else {
        state[field.name] = '';
      }
    });

    this.state = state;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lines !== nextProps.lines) {
      //WARNNG!!! formFields[2] is field for line selection
      formFields[2].options = [formFields[2].options[0], ...nextProps.lines];
    }
  }

  onChange(field, e) {
    let obj = {};

    obj[field] = e.target.value.trim();

    obj.disabled = !(Boolean(obj[field].length) || formFields.some(({name}) => Boolean(this.state[name].length)));

    this.setState(obj);
  }

  getForm() {
    return (
      <div style={styles.formContainer}>
        {formFields.map(({name, type, options, title}, idx) =>
          type === 'select' ?
            <select
              style={{...styles.field, height: 28, width: 150}}
              key={idx}
              onChange={e => this.onChange(name, e)}
              value={this.state[name]}
            >
              {options.map((value, idx) =>
                (<option
                  key={idx}
                  value={value}
                 >{value}</option>)
              )}
            </select> :
            <input
              style={styles.field}
              key={idx}
              type={type}
              value={this.state[name]}
              placeholder={title}
              onChange={e => this.onChange(name, e)}
            />
        )}
        <button
          style={styles.button}
          onClick={() => this.props.onFilter(this.state)}
          disabled={this.state.disabled}
        >Filter</button>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        {this.getForm()}
      </div>
    );
  }
}

FiltersForm.propTypes = propTypes;

FiltersForm.defaultProps = {
  onCancel: null
};

export default injectIntl(FiltersForm);

const styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },

  field: {
    marginRight: 10
  },

  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },

  button: {
    height: 28
  }
};
