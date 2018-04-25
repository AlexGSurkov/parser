'use strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Textarea extends Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value};
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({value: nextProps.value});
    }
  }

  onChange(event) {
    event.persist();
    this.setState({value: event.target.value}, () => this.props.onChange(event));
  }

  render() {
    return (
      <textarea
        {...this.props}
        {...this.state}
        onChange={this.onChange}
        rows={(this.state.value.match(/\n/g) || []).length + 2}
        wrap="off"
      ></textarea>
    );
  }
}

Textarea.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

Textarea.defaultProps = {
  onChange: () => {/*empty func*/},
  value: ''
};

export default Textarea;
