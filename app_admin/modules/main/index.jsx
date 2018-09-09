'use strict';

import React, {Component} from 'react';
import Moment from 'moment';
//import PropTypes from 'prop-types';
//import {Redirect, withRouter} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
import CoreStores from 'core/stores';
import CoreActions from 'core/actions';

import ModalLocation from 'core/components/modalLocation';

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
      vesselLocation: {},
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

  setActionResult(data) {
    data.actionResult && data.actionResult === 'saved' ? this.setState({
      allChecked: false,
      selectedRows: new Set(),
      vesselLocation: {}
    }) : this.setState(data);
  }

  search({line, number}) {
    this.setState({
      detailsIdx: -1,
      allChecked: false,
      selectedRows: new Set(),
      line,
      vesselLocation: {}
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

    const rows = containers ? containers.map(({currentState, number, type, locations}, idx) => {
      currentState[1] && (currentState[1] = Moment(currentState[1]).format('YYYY-MM-DD HH:mm'));

      return (
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
      );
    }) : [];

    if (this.state.detailsIdx > -1 && this.state.detailsIdx < rows.length) {
      rows.splice(this.state.detailsIdx + 1, 0, this.getDetails());
    }

    return rows;
  }

  getDetails() {
    const {locations, line, eta} = this.state.data.containers[this.state.detailsIdx],
      etaDate = eta && eta.date ? `ETA: ${Moment(eta.date).format('YYYY-MM-DD HH:mm')}` : '',
      etaPod = eta && eta.pod ? `POD: ${eta.pod}` : '',
      {authorized, vesselLocation} = this.state;

    let lastVesselState = [];

    // define last state with vessel
    authorized && locations.reduce((allStates, {states}) => [...allStates, ...states], [])
      .filter(({period}) => period === 'past' || period === 'current')
      .reverse().some(({state}) => {
        if (state.filter(st => st.length).length === 2) {
          lastVesselState = state;

          return true;
        }

        return false;
      });

    return (
      <div
        key={`${this.state.detailsIdx}_details`}
        style={{
          ...styles.detailsContainer,
          minHeight: vesselLocation.lat && vesselLocation.lon ? 520 : 0
        }}
      >
        {authorized ?
          <ModalLocation
            vesselLocation={vesselLocation}
            onCancel={() => CoreActions.ActionsContainer.showLocation(null)}
          /> : null
        }

        {locations.map((location, idx) => (
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
                <span style={styles.stateDate}>{Moment(date).format('YYYY-MM-DD HH:mm')}</span>
                <span style={styles.stateState}>
                  {state.filter(st => st.length).join(', ')}
                  <span
                    style={{
                      ...styles.btnLocation,
                      display: authorized && state === lastVesselState && state.filter(st => st.length).length === 2 ? 'block' : 'none'
                    }}
                    onClick={() => CoreActions.ActionsContainer.showLocation(state[1], line)}
                  />
                </span>
              </div>
            ))}
          </div>
        ))}
        {etaDate || etaPod ? <h4 style={{textAlign: 'center'}}>{`${etaDate} ${etaPod}`}</h4> : null}
      </div>
    );
  }

  getTitle() {
    const {billOfLadingNumber, shipmentNumber, containers} = this.state.data || {};

    if (billOfLadingNumber || shipmentNumber) {
      return billOfLadingNumber ? `Bill of Lading Number: ${billOfLadingNumber} ` : '' + // eslint-disable-line no-implicit-coercion
        shipmentNumber ? `Shipment Number: ${shipmentNumber} ` : '' +
        `${containers.length ? '' : '(no containers)'}`;
    }

    if (containers && containers.length === 1) {
      return `Container Number: ${containers[0].number}`;
    }

    return this.state.data ? 'No result' : '';
  }

  getTable() {
    const {containers} = this.state.data || {},
      {authorized, allChecked} = this.state;

    return [
      <h4 key="table-header">{this.getTitle()}</h4>,
      containers && containers.length ?
        <div key="table-column-title" style={{...styles.rowContainer, borderBottom: '1px solid'}}>
          <span style={styles.number}>Number</span>
          <span style={styles.type}>Type</span>
          <span style={styles.currentState}>Current State</span>
          <span style={styles.showDetails}></span>
          {authorized ?
            <span style={styles.select}>
              <input
                name="allSelect"
                type="checkbox"
                checked={allChecked}
                onChange={() => this.clickAllChecked()}
              />
            </span> : null
          }
        </div> : null,
      ...this.getContainers()
    ];
  }

  clickDetails(detailsIdx) {
    this.state.detailsIdx === detailsIdx ?
      this.setState({detailsIdx: -1, vesselLocation: {}}) : this.setState({detailsIdx, vesselLocation: {}});
  }

  render() {
    const {containers} = this.state.data || {},
      {authorized, lines, selectedRows} = this.state;

    return (
      <div style={styles.container}>
        <h3>Main</h3>
        <SearchForm
          lines={lines}
          onSearch={this.search}
        />
        {this.getTable()}
        {authorized && containers && containers.length ?
          <div style={styles.footer}>
            <button
              style={styles.button}
              onClick={() => this.save()}
              disabled={!Boolean(selectedRows.size)} //eslint-disable-line no-extra-boolean-cast
            >
              {`Save To Database (${selectedRows.size})`}
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
    position: 'relative',
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

  stateState: {
    position: 'relative'
  },

  btnLocation: {
    position: 'absolute',
    backgroundImage: 'url(/images/admin/location.png)',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    cursor: 'pointer',
    width: 40,
    height: 40,
    top: -17,
    right: -35,
    zIndex: 1
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
