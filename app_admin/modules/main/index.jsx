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
      line: '',
      lines: [],
      data: null,
      detailsIdx: -1,
      allChecked: false,
      selectedRows: new Set(),
      authorized: Boolean(CoreStores.AuthorizationStore.getAuthData('token', ''))
    };

    this.search = this.search.bind(this);
  }

  componentWillMount() {
    this.unsubscribes.push(CoreStores.ParsingStore.listen(data => this.setData(data)));
    this.unsubscribes.push(CoreStores.AuthorizationStore.listen(data => this.setAuthData(data)));
    this.unsubscribes.push(CoreStores.ContainerStore.listen(data => this.setActionResult(data)));
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

  setAuthData({token}) {
    this.setState({authorized: Boolean(token)});
  }

  setActionResult({actionResult}) {
    actionResult === 'saved' && this.setState({
      allChecked: false,
      selectedRows: new Set()
    });
  }

  search({line, number}) {
    this.setState({
      detailsIdx: -1,
      allChecked: false,
      selectedRows: new Set(),
      line
    });

    CoreActions.ActionsParsing.search(line, number);
  }

  clickAllChecked() {
    this.setState({
      allChecked: !this.state.allChecked,
      selectedRows: this.state.allChecked ? new Set() : new Set(new Array(this.state.data.containers.length).fill(null).map((val, idx) => idx))
    });
  }

  save() {
    const {billOfLadingNumber, containers} = this.state.data,
      {line} = this.state,
      data = containers.filter((container, idx) => this.state.selectedRows.has(idx)).map(container => {
        Object.assign(container, {billOfLadingNumber, line});

        return container;
      });

    CoreActions.ActionsContainer.save(data);
  }

  selectRow(idx) {
    let {selectedRows} = this.state;

    selectedRows.has(idx) ? selectedRows.delete(idx) : selectedRows.add(idx);

    this.setState({allChecked: false, selectedRows});
  }

  getContainers() {
    const {containers} = this.state.data || {};

    const rows = containers ? containers.map(({currentState, number, type, locations}, idx) => (
      <div key={idx} style={styles.rowContainer}>
        <span style={styles.number}>{number}</span>
        <span style={styles.type}>{type}</span>
        <span style={styles.currentState}>{currentState.join('  ')}</span>
        <span
          style={{
            ...styles.showDetails,
            textDecoration: this.state.detailsIdx === idx || !locations.length ? 'none' : 'underline',
            cursor: locations.length ? 'pointer' : 'default'
          }}
          onClick={() => locations.length && this.clickDetails(idx)}
        >
          {locations.length ? this.state.detailsIdx === idx ? 'Hide Details' : 'Show Details' : 'No Details'}
        </span>
        {this.state.authorized ?
          <span style={styles.select}>
            <input
              name="allSelect"
              type="checkbox"
              checked={this.state.selectedRows.has(idx)}
              onChange={() => this.selectRow(idx)}
            />
          </span> : null
        }
      </div>
    )) : [];

    if (this.state.detailsIdx > -1 && this.state.detailsIdx < rows.length) {
      rows.splice(this.state.detailsIdx + 1, 0, this.getDetails());
    }

    return rows;
  }

  getDetails() {
    const details = this.state.data.containers[this.state.detailsIdx].locations;

    return (
      <div key={`${this.state.detailsIdx}_details`} style={styles.detailsContainer}>
        {details.map((location, idx) => (
          <div key={idx}>
            <h4>{location.location}</h4>
            {location.states.map(({date, state, period}, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.stateContainer,
                  color: period === 'current' ? '#ff0000' : 'none',
                  fontWeight: period === 'current' ? 'bold' : 'normal'
                }}
              >
                <span style={styles.stateDate}>{date}</span>
                <span style={styles.stateState}>{state.filter(st => st.length).join(', ')}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
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
          <span style={styles.showDetails}></span>
          {this.state.authorized ?
            <span style={styles.select}>
              <input
                name="allSelect"
                type="checkbox"
                checked={this.state.allChecked}
                onChange={() => this.clickAllChecked()}
              />
            </span> : null
          }
        </div> : null,
      ...this.getContainers()
    ];
  }

  clickDetails(detailsIdx) {
    this.state.detailsIdx === detailsIdx ? this.setState({detailsIdx: -1}) : this.setState({detailsIdx});
  }

  render() {
    const {containers} = this.state.data || {};

    return (
      <div style={styles.container}>
        <h3>Main</h3>
        <SearchForm
          lines={this.state.lines}
          onSearch={this.search}
        />
        {this.getTable()}
        {this.state.authorized && containers && containers.length ?
          <div style={styles.footer}>
            <button
              style={styles.button}
              onClick={() => this.save()}
              disabled={!Boolean(this.state.selectedRows.size)} //eslint-disable-line no-extra-boolean-cast
            >
              {`Save To Database (${this.state.selectedRows.size})`}
            </button>
          </div> : null
        }
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
    width: 120,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  currentState: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 5
  },

  select: {
    margin: '0 10px'
  },

  showDetails: {
    width: 105,
    color: '-webkit-link'
  },

  detailsContainer: {
    margin: '0 20px 20px'
  },

  stateContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },

  stateDate: {
    width: 160,
    marginRight: 20
  },

  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTop: '1px solid'
  },

  button: {
    height: 28
  }
};
