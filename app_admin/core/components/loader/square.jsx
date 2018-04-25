'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  style: PropTypes.object
},
  defaultProps = {
    style: {}
  };

class Square extends Component {
  constructor() {
    super();

    this.timer = null;
    this.framesPerSec = 11;
    this.interval = 1000 / this.framesPerSec;
    this.ds = [
      'M30.6 34L15.4 49.2l12.7 12.7c.7.7 1.6 1.2 2.5 1.4V34z',
      'M32.6 34v29.2c.9-.2 1.8-.6 2.5-1.4l12.7-12.7L32.6 34z',
      'M34 32.6l15.2 15.2 12.7-12.7c.7-.7 1.2-1.6 1.4-2.5H34z',
      'M49.2 15.4L34 30.6h29.2c-.2-.9-.6-1.8-1.4-2.5L49.2 15.4z',
      'M32.6 29.2L47.8 14 35.2 1.4C34.5.7 33.6.2 32.7 0v29.2z',
      'M30.6 29.2V0c-.9.2-1.8.6-2.5 1.4L15.4 14l15.2 15.2z',
      'M29.2 30.6L14 15.4 1.4 28.1c-.7.7-1.2 1.6-1.4 2.5h29.2z',
      'M0 32.6c.2.9.6 1.8 1.4 2.5L14 47.8l15.2-15.2H0z'
    ];

    this.state = {currentStep: 1};
  }

  componentDidMount() {
    this.goToNextStep();
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  goToNextStep() {
    this.timer = setInterval(() => this.setState({currentStep: this.getStep(1)}), this.interval);
  }

  getStep(value) {
    value = this.state.currentStep + value;

    return value > this.ds.length ? value - this.ds.length : value;
  }

  render() {
    return (
      <svg style={this.props.style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.2 63.2">
        <linearGradient id="LINGRAD_PATH_1" gradientUnits="userSpaceOnUse" x1="15.426" y1="48.636" x2="30.619" y2="48.636">
          <stop offset="0" stopColor="#EE4231"/>
          <stop offset="1" stopColor="#EE3C34"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_2" gradientUnits="userSpaceOnUse" x1="32.619" y1="48.636" x2="47.813" y2="48.636">
          <stop offset="0" stopColor="#EF482E"/>
          <stop offset="1" stopColor="#EF4330"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_3" gradientUnits="userSpaceOnUse" x1="34.034" y1="40.216" x2="63.239" y2="40.216">
          <stop offset="0" stopColor="#EF502A"/>
          <stop offset="1" stopColor="#EF4A2D"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_4" gradientUnits="userSpaceOnUse" x1="34.034" y1="23.023" x2="63.239" y2="23.023">
          <stop offset="0" stopColor="#F05726"/>
          <stop offset="1" stopColor="#EF5129"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_5" gradientUnits="userSpaceOnUse" x1="32.619" y1="14.603" x2="47.813" y2="14.603">
          <stop offset="0" stopColor="#F06022"/>
          <stop offset="1" stopColor="#F05826"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_6" gradientUnits="userSpaceOnUse" x1="15.426" y1="14.603" x2="30.619" y2="14.603">
          <stop offset="0" stopColor="#ED2B3C"/>
          <stop offset="1" stopColor="#ED253F"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_7" gradientUnits="userSpaceOnUse" y1="23.023" x2="29.205" y2="23.023">
          <stop offset="0" stopColor="#EE3438"/>
          <stop offset=".99" stopColor="#ED2D3B"/>
        </linearGradient>
        <linearGradient id="LINGRAD_PATH_8" gradientUnits="userSpaceOnUse" y1="40.216" x2="29.205" y2="40.216">
          <stop offset="0" stopColor="#EE3B34"/>
          <stop offset="1" stopColor="#EE3537"/>
        </linearGradient>

        {this.ds.map((d, idx) => <path d={d} key={idx} fill={`url(#LINGRAD_PATH_${this.getStep(idx)})`} />)}
      </svg>
    );
  }
}

Square.propTypes = propTypes;
Square.defaultProps = defaultProps;

export default Square;
