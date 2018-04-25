'use strict';

import {Component} from 'react';
import PropTypes from 'prop-types';
import Utils from 'core/utils';
import Stores from '../stores';
import moment from 'moment';
import {injectIntl} from 'react-intl';

const localePrefix = 'core',
  propTypes = {
    intl: PropTypes.object.isRequired
  };

/**
 * Component for showing modal popover
 */
class PopoverWindow extends Component {
  constructor() {
    super();

    this.unsubscribes = [];
  }

  componentWillMount() {
    this.unsubscribes.push(Stores.PopoverWindowStore.listen((...args) => this.showWindow(...args)));
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  showWindow(data) {
    alert(this.getFullMessage(data));
  }

  getFullMessage({type, message = null, params = {}} = {}) {
    switch (type) {
      case 'standardMessageKey':
        return this.props.intl.formatMessage({id: `${localePrefix}.popoverWindow.messages.${message}`}, params);

      case 'errorMessage':
        return message;

      case 'serverErrorMessage':
        console.warn(message);
        if (navigator.onLine) {
          return this.props.intl.formatMessage({id: `${localePrefix}.popoverWindow.messages.server`}, {
            phone: Utils.getSupportPhone(),
            time: moment().format('HH:mm:ss DD.MM.YYYY')
          });
        }
        return this.props.intl.formatMessage({id: `${localePrefix}.popoverWindow.messages.no_internet`});

      default:
        throw new Error(`Unsupported message type "${type}"`);
    }
  }

  render() {
    return null;
  }

}

PopoverWindow.propTypes = propTypes;

export default injectIntl(PopoverWindow);
