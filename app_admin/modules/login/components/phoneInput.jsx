'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputMask from 'inputmask-core';
import ReactInputSelection from 'react-dom/lib/ReactInputSelection';

const {getSelection, setSelection} = ReactInputSelection,
  propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    pressEnterListener: PropTypes.func,
    showReadyPhone: PropTypes.func
  },
  defaultProps = {
    style: {},
    className: '',
    defaultValue: '',
    placeholder: '',
    pressEnterListener: () => {/* empty func */},
    showReadyPhone: () => {/* empty func */}
  };

class PhoneInput extends Component {
  constructor(props) {
    super(props);

    this.mask = new InputMask({
      pattern: '(111) 111 11 11',
      value: props.defaultValue
    });

    // refs
    this.phone = {};
  }

  getValue() {
    return this.mask.getRawValue();
  }

  setValue(e) {
    e.target.value = this.getDisplayValue();
    this.updateInputSelection();
    this.checkPhone();
  }

  getDisplayValue() {
    let value = this.mask.getValue();

    return value === this.mask.emptyValue ? '' : value;
  }

  updateMaskSelection() {
    this.mask.selection = getSelection(this.phone);
  }

  updateInputSelection() {
    setSelection(this.phone, this.mask.selection);
  }

  onKeyDown(e) {
    if (e.keyCode === 9 || e.keyCode === 13) { //press Enter
      e.preventDefault();
      if (this.checkPhone()) {
        if (this.props.pressEnterListener) {
          this.props.pressEnterListener(e);
        }
      }
      return;
    }
    if (e.keyCode === 8) { //press Backspace
      e.preventDefault();
      this.updateMaskSelection();
      if (this.mask.backspace()) {
        this.setValue(e);
      }
    }
  }

  checkPhone() {
    let check = this.mask.getRawValue().replace(/[_]/g, '').length === 10;

    if (this.props.showReadyPhone) {
      this.props.showReadyPhone(check);
    }

    return check;
  }

  onKeyPress(e){
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }

    e.preventDefault();
    this.updateMaskSelection();
    if (this.mask.input(e.key)) {
      this.setValue(e);
    }
  }

  onChange(e) {
    let maskValue = this.mask.getValue(),
        value;

    if (e.target.value !== maskValue) {
      // Cut or delete operations will have shortened the value
      if (e.target.value.length < maskValue.length) {
        const sizeDiff = maskValue.length - e.target.value.length;

        this.updateMaskSelection();
        this.mask.selection.end = this.mask.selection.start + sizeDiff;
        this.mask.backspace();
      }
      value = this.getDisplayValue();
      e.target.value = value;
      this.checkPhone();
      if (value) {
        this.updateInputSelection();
      }
    }
  }

  render() {
    return (
      <div>
        <input type="tel" style={{display: 'none'}} />{/* for removing autofill form */}
        <input
          ref={elt => this.phone = elt}
          autoFocus
          className={this.props.className}
          style={this.props.style}
          placeholder={this.props.placeholder}
          type="tel"
          onKeyDown={event => this.onKeyDown(event)}
          onKeyPress={event => this.onKeyPress(event)}
          onChange={event => this.onChange(event)}
        />
      </div>
    );
  }
}

PhoneInput.propTypes = propTypes;
PhoneInput.defaultProps = defaultProps;

export default PhoneInput;
