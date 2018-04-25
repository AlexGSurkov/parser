'use strict';

import React, {Component} from 'react';
import Stores from 'core/stores';
//import Square from './square';

class Loader extends Component {
  constructor() {
    super();

    this.unsubscribes = [];

    this.state = {show: false};
  }

  componentWillMount() {
    this.unsubscribes.push(Stores.LoaderStore.listen((...args) => this.setData(...args)));
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setData(data) {
    this.setState(data);
  }

  render() {
    return this.state.show ?  <div style={styles.bg} /> : null;
  }
}

export default Loader;

const styles = {
  bg: {
    height: '100%',
    width: '100%',
    background: 'rgba(28, 29, 35, 0.7)',
    position: 'absolute',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(/images/admin/loader.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
};
