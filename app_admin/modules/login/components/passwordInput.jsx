'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  maxLength: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  placeholder: PropTypes.string,
  pressEnterListener: PropTypes.func,
  onError: PropTypes.func
},
  defaultProps = {
    style: {},
    className: '',
    maxLength: 20,
    placeholder: '',
    pressEnterListener: () => {/* empty func */},
    onError: () => {/* empty func */},
  };

class PasswordInput extends Component{
  constructor() {
    super();

    this.state = {value: '', error: ''};

    // refs
    this.pass = {};
  }

  getValue() {
    return this.pass.value;
  }

  setValue(value) {
    this.setState({value});
    this.pass.value = this.state.value;
  }

  checkError() {
    return this.state.error.length;
  }

  onChange(event) {
    this.setState({value: event.target.value});
  }

  onPaste(event) {
    event.preventDefault();
  }

  onKeyDown(event) {
    event.keyCode === 13 && this.props.pressEnterListener(event);
  }

  onKeyPress(event) {
    if (this.state.value.length < this.props.maxLength) {
      if (event.charCode === 32) {
        event.preventDefault();
      } else {
        this.setState({error: ''});
      }
    } else {
      event.preventDefault();
    }

    if (this.state.error.length) {
      this.props.onError(this.state.error);
    }
  }

  render() {

    return (
      <div>
        <input type="password" style={{display: 'none'}} />{/* for removing autofill form */}
        <input
          ref={elt => this.pass = elt}
          className={this.props.className}
          type="password"
          style={this.props.style}
          onKeyPress={event => this.onKeyPress(event)}
          onKeyDown={event => this.onKeyDown(event)}
          placeholder={this.props.placeholder}
          maxLength={this.props.maxLength}
          onChange={event => this.onChange(event)}
          onPaste={event => this.onPaste(event)}
        />
      </div>
    );
  }
}

PasswordInput.propTypes = propTypes;
PasswordInput.defaultProps = defaultProps;

export default PasswordInput;
