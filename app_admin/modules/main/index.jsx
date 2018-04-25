'use strict';

import React, {Component} from 'react';
//import PropTypes from 'prop-types';
//import {Redirect, withRouter} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
import CoreStores from 'core/stores';
import CoreActions from 'core/actions';

import SearchForm from './components/searchForm';

//const localePrefix = 'main';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    //history: PropTypes.object.isRequired
  };

class Main extends Component {

  constructor() {
    super();

    this.unsubscribes = [];

    this.state = {
      lines: [],
      data: null
    };

  }

  componentWillMount() {
    this.unsubscribes.push(CoreStores.ParsingStore.listen(data => this.setData(data)));
    //this.unsubscribes.push(CoreStores.UserProfileStore.listen(user => this.setUser(user)));
  }

  componentDidMount() {
    CoreActions.ActionsParsing.getLines();
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setData(data) {
    this.setState(data);
  }

  search({line, number}) {
    CoreActions.ActionsParsing.search(line, number);
  }

  getContainers() {
    const {containers} = this.state.data || {};

    return containers ? containers.map(({currentState, number, type}, idx) => (
      <div key={idx} style={styles.rowContainer}>
        <span style={styles.number}>{number}</span>
        <span style={styles.type}>{type}</span>
        <span style={styles.currentState}>{currentState.join('  ')}</span>
      </div>
    )) : [];
  }

  getTitle() {
    const {billOfLadingNumber, shipmentNumber, containers} = this.state.data || {};

    if (billOfLadingNumber) {
      return `Bill of Lading Number: ${billOfLadingNumber}`;
    }

    if (shipmentNumber) {
      return `Shipment Number: ${shipmentNumber}`;
    }

    if (containers && containers.length === 1) {
      return `Container Number: ${containers[0].number}`;
    }

    return this.state.data ? 'No result' : '';
  }

  getTable() {
    const {containers} = this.state.data || {};

    return [
      <h4 key="table-header">{this.getTitle()}</h4>,
      containers && containers.length ?
        <div key="table-column-title" style={{...styles.rowContainer, borderBottom: '1px solid'}}>
          <span style={styles.number}>Number</span>
          <span style={styles.type}>Type</span>
          <span style={styles.currentState}>Current State</span>
        </div> : null,
      ...this.getContainers()
    ];
  }

  render() {
    return (
      <div style={styles.container}>
        <h3>Main</h3>
        <SearchForm
          lines={this.state.lines}
          onSearch={this.search}
        />
        {this.getTable()}
      </div>
    );
  }
}

Main.propTypes = propTypes;

export default injectIntl(Main);

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 800
  },

  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 25,
    marginBottom: 5
  },

  number: {
    width: 150
  },

  type: {
    width: 120
  },

  currentState: {
    flexGrow: 1
  }
};
