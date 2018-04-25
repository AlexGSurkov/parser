'use strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value};
    this.onChange = this.onChange.bind(this);
    this.input = {};
    this.start = 0;
    this.end = 0;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      const diff = String(nextProps.value).length - String(this.state.value).length;

      this.setState({value: nextProps.value}, () => {
        this.input.setSelectionRange(this.start + diff, this.end + diff);
      });
    }
  }

  onChange(event) {
    event.persist();
    this.start = this.input.selectionStart;
    this.end = this.input.selectionEnd;
    this.setState({value: event.target.value}, () => this.props.onChange(event));
  }

  render() {
    const {setFocus, ...props} = this.props;

    return (
      <input
        {...props}
        {...this.state}
        onChange={this.onChange}
        ref={input => {
          this.input = input;
          setFocus(input);
        }}
      />
    );
  }
}

Input.propTypes = {
  onChange: PropTypes.func,
  setFocus: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

Input.defaultProps = {
  onChange: () => {/*empty func*/},
  setFocus: () => {/*empty func*/},
  value: ''
};

export default Input;
