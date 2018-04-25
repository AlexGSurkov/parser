'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Constants from 'core/constants';
import Utils from 'core/utils';
import Stores from './stores';
import Actions from './actions';

const {colorsScheme} = Constants,
  propTypes = {
    id: PropTypes.string,
    buttonGroup: PropTypes.string,
    'data-id': PropTypes.string,
    onPress: PropTypes.func,
    checked: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    isRadioButton: PropTypes.bool,
    isActiveImage: PropTypes.bool,
    backHover: PropTypes.bool,
    isCheckBox: PropTypes.bool,
    isDisabled: PropTypes.bool,
    templateImage: PropTypes.string,
    itemStyle: PropTypes.object,
    wrapperStyle: PropTypes.object,
  },
  defaultProps = {
    id: '',
    buttonGroup: '',
    'data-id': '',
    onPress: () => {/*empty function*/},
    checked: false,
    children: null,
    isRadioButton: false,
    isActiveImage: true,
    backHover: false,
    isCheckBox: false,
    isDisabled: false,
    templateImage: '',
    itemStyle: {},
    wrapperStyle: {}
  };

class HoverButton extends Component {
  constructor(props) {
    super(props);

    this.unsubscribes = [];

    this.state = {
      isHover: false,
      isActive: false,
      isChecked: props.checked ? props.checked : false
    };
  }

  componentWillMount() {
    this.unsubscribes.push(Stores.radioButtonStore.listen((...args) => this.setActiveRadioButton(...args)));
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setActiveRadioButton(radioButtonGroup, id) {
    if (this.props.buttonGroup === radioButtonGroup) {
      if (!this.state.isChecked && id === this.props.id) {
        this.isChecked();
      } else if (this.state.isChecked) {
        this.isUnchecked();
      }
    }
  }

  onMouseEnter() {
    this.setState({
      isHover: true,
      isActive: false
    });
  }

  onMouseLeave() {
    this.setState({
      isHover: false,
      isActive: false
    });
  }

  onMouseDown() {
    this.setState({
      isActive: true,
      isHover: false
    });
  }

  onMouseUp() {
    this.setState({
      isActive: false,
      isHover: true
    });
    this.props.onPress && !this.props.isDisabled ? this.props.onPress(this.props['data-id'] ? this.props['data-id'] : null, !this.state.isChecked) : null;
    this.props.isRadioButton && !this.props.isDisabled ? Actions.getRadioStatus(this.props.buttonGroup, this.props.id) : null;
  }

  isChecked() {
    this.setState({
      isActive: false,
      isHover: false,
      isChecked: true
    });
  }

  isUnchecked() {
    this.setState({
      isActive: false,
      isHover: false,
      isChecked: false
    });
  }

  getTextColor() {
    if (this.props.isDisabled) {
      return colorsScheme.contentElementBackground;
    } else if (this.props.backHover) {
      return colorsScheme.contentBackground;
    } else if (this.state.isActive) {
      return this.props.isActiveImage ? colorsScheme.menuItemActive : colorsScheme.menuItem;
    }

    return this.state.isHover ? colorsScheme.menuItemPressed : colorsScheme.menuItem;
  }

  getBackgroundColor() {
    if (this.props.backHover) {
      if (this.state.isActive) {
        return this.props.isActiveImage ? colorsScheme.menuItemActive : colorsScheme.menuItem;
      } else if (this.state.isHover) {
        return colorsScheme.menuItemPressed;
      }

       return colorsScheme.menuItem;
    }

    return '';
  }

  render() {
    return (
      <div
        onMouseEnter={() => !this.state.isChecked && this.onMouseEnter()}
        onMouseLeave={() => !this.state.isChecked && this.onMouseLeave()}
        onMouseDown={() => !this.state.isChecked && this.onMouseDown()}
        onMouseUp={() => this.state.isChecked ? this.props.isCheckBox ? this.onMouseUp() : null : this.onMouseUp()}
        style={{
          userSelect: 'none',
          cursor: 'pointer',
          color: this.getTextColor(),
          backgroundColor: this.getBackgroundColor(),
          ...this.props.isDisabled ? {pointerEvents: 'none', opacity: 0.4} : {},
          ...Utils.convertStyleToObject(this.props.wrapperStyle)
        }}
      >
        {this.props.templateImage ? [
          <div
            key="0"
            style={{
              ...Utils.convertStyleToObject(this.props.itemStyle),
              display: this.state.isHover || this.state.isActive || this.state.isChecked ? 'none' : 'block',
              backgroundImage: `url("/images/admin/${this.props.templateImage}_icon.svg")`
            }}
          ></div>,
          <div
            key="1"
            style={{
              ...Utils.convertStyleToObject(this.props.itemStyle),
              display: this.state.isHover ? 'block' : 'none',
              backgroundImage: `url("/images/admin/${this.props.templateImage}_icon_hover.svg")`
            }}
          ></div>,
          <div
            key="2"
            style={{
              ...Utils.convertStyleToObject(this.props.itemStyle),
              display: this.state.isActive ? 'block' : 'none',
              backgroundImage: `url("/images/admin/${this.props.templateImage}${this.props.isActiveImage ? '_icon_active' : '_icon'}.svg")`
            }}
          ></div>
        ] : null}
        {this.props.isRadioButton ?
          <div
            style={{
              ...Utils.convertStyleToObject(this.props.itemStyle),
              display: this.state.isChecked ? 'block' : 'none',
              backgroundImage: `url("/images/admin/${this.props.templateImage}_icon_closed.svg")`
            }}
          ></div> : null
        }
        {this.props.children}
      </div>
    );
  }
}

HoverButton.propTypes = propTypes;
HoverButton.defaultProps = defaultProps;

export default HoverButton;
