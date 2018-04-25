'use strict';

import React from 'react';
import Constants from 'core/constants';
import {FormattedMessage} from 'react-intl';

const {colorsScheme} = Constants;

export default () => (
  <div style={styles.emptyChildren}>
    <FormattedMessage id="core.welcomeMessage"/>
  </div>
);

const styles = {
  emptyChildren: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    font: '21px GothamProBold',
    textTransform: 'uppercase',
    color: colorsScheme.menuBackground
  }
};
