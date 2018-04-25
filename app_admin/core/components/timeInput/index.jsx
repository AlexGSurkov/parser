import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactInputSelection from 'react-dom/lib/ReactInputSelection';
import InputMask from 'inputmask-core';

const {getSelection, setSelection} = ReactInputSelection;

class TimeInput extends Component {
  constructor(props) {
    super(props);

    this.mask = new InputMask({
      pattern: '11:11',
      placeholderChar: '0',
      value: props.value
    });

    this.state = {value: this.mask.getValue()};

    // refs
    this.input = {};
  }

  componentWillReceiveProps({value}) {
    this.state.value !== value && this.setState({value}, () => this.mask.setValue(value));
  }

  setValue() {
    const value = this.mask.getValue();

    if (isValid(value)) {
      this.setState({value}, () => {
        setSelection(this.input, this.mask.selection);
        this.props.onChange(value);
      });
    }
  }

  onKeyDown(event) {
    const {start, end} = getSelection(this.input);

    if (event.keyCode === 8) { // press backspace
      event.preventDefault();
      this.mask.selection = {start, end};
      this.mask.backspace() && this.setValue();
    }

    if (event.keyCode === 46) { // press delete
      event.preventDefault();

      if (start !== end) {
        this.mask.selection = {start, end};
        this.mask.backspace() && this.setValue();
      } else if (end < this.input.value.length) {
        this.mask.selection = {start: start + 1, end: end + 1};
        this.mask.backspace() && this.setValue();
      }
    }
  }

  onKeyPress(event) {
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }

    event.preventDefault();
    this.mask.selection = getSelection(this.input);
    this.mask.input(event.key) && this.setValue();
  }

  onChange(event) {
    const maskValue = this.mask.getValue(),
      {value} = event.target;

    if (value === maskValue) {
      return;
    }

    // cut or delete operations will have shortened the value
    if (value.length < maskValue.length) {
      const sizeDiff = maskValue.length - value.length;

      this.mask.selection = getSelection(this.input);
      this.mask.selection.end = this.mask.selection.start + sizeDiff;
      this.mask.backspace();
    }

    this.setValue();
  }

  render() {
    return (
      <input
        {...this.props}
        value={this.state.value}
        onKeyDown={event => this.onKeyDown(event)}
        onKeyPress={event => this.onKeyPress(event)}
        onChange={event => this.onChange(event)}
        ref={input => this.input = input}
      />
    );
  }
}

TimeInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string
};

TimeInput.defaultProps = {
  onChange: () => {/*empty func*/},
  value: ''
};

export default TimeInput;

/**
 * Time validation
 *
 * @param   {string}   time
 * @returns {boolean}
 */
function isValid(time) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}
