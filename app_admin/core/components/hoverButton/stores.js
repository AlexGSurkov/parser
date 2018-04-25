'use strict';

import Reflux from 'reflux';
import Actions from './actions';

let radioButtonStore = Reflux.createStore({

  init() {
    this.listenTo(Actions.getRadioStatus, this.getRadioStatus);
  },

  getRadioStatus(buttonGroup, id) {
    this.trigger(buttonGroup, id);
  }
});


export default {
  radioButtonStore
};
