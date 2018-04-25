'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
//import Constants from 'core/constants';

//const localePrefix = 'search';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    lines: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired
    //errorMsg: PropTypes.string.isRequired
  };

let formFields = [
  {
    name: 'number',
    type: 'text',
    title: 'Number of container/booking/consignment'
  },
  {
    name: 'line',
    type: 'select',
    options: ['', 'MAERSK', 'CMA', 'ZIM'],
    title: 'Carrier'
  }
];

class SearchForm extends Component {

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

    this.state == state;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lines !== nextProps.lines) {
      formFields[1].options = [formFields[1].options[0], ...nextProps.lines];
    }
  }

  onChange(field, e) {
    let obj = {},
      otherFields = formFields.filter(({name}) => name !== field).map(({name}) => name);

    obj[field] = e.target.value.trim();

    obj.disabled = !obj[field].length || !otherFields.every(name => this.state[name].length);

    this.setState(obj);
  }

  getForm() {
    return (
      <div key={name} style={styles.formContainer}>
        {formFields.map(({name, type, options}, idx) =>
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
              ref={name}
              type={type}
              value={this.state[name]}
              onChange={e => this.onChange(name, e)}
            />
        )}
        <button
          style={styles.button}
          onClick={() => this.props.onSearch(this.state)}
          disabled={this.state.disabled}
        >Search</button>
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

SearchForm.propTypes = propTypes;

SearchForm.defaultProps = {
  onCancel: null
};

export default injectIntl(SearchForm);

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
