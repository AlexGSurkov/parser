'use strict';

import React, {Component} from 'react';
import Moment from 'moment';
//import PropTypes from 'prop-types';
//import {Redirect, withRouter} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
import CoreStores from 'core/stores';
import CoreActions from 'core/actions';

import ModalLocation from 'core/components/modalLocation';

import FiltersForm from './components/filtersForm';

//const localePrefix = 'main';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    //history: PropTypes.object.isRequired
  };

class Shipments extends Component {

  constructor() {
    super();

    this.unsubscribes = [];

    this.state = {
      lines: [],
      data: [],
      detailsIdx: -1,
      allChecked: false,
      selectedRows: new Set(),
      vesselLocation: {}
    };

  }

  componentWillMount() {
    CoreActions.ActionsContainer.resetStore();

    this.unsubscribes.push(CoreStores.ParsingStore.listen(data => this.setLines(data)));
    this.unsubscribes.push(CoreStores.ContainerStore.listen(data => this.setData(data)));
  }

  componentDidMount() {
    CoreActions.ActionsParsing.getLines();
    CoreActions.ActionsContainer.getContainers();
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
  }

  setLines({lines}) {
    this.setState({lines});
  }

  setData(data) {
    this.setState(data.hasOwnProperty('vesselLocation') ? data : {
      ...data,
      detailsIdx: -1,
      allChecked: false,
      selectedRows: new Set(),
      vesselLocation: {}
    });
  }

  getContainers() {
    const containers = this.state.data || [];

    const rows = containers ? containers.map(({currentState, number, billOfLadingNumber, line, type, locations}, idx) => {
      currentState[1] && (currentState[1] = Moment(currentState[1]).format('YYYY-MM-DD HH:mm'));

      return (
        <div key={idx} style={styles.rowContainer}>
          <span style={styles.number}>{number}</span>
          <span style={styles.number}>{billOfLadingNumber}</span>
          <span style={styles.number}>{line}</span>
          <span style={styles.type} title={type}>{type}</span>
          <span style={styles.currentState} title={currentState.join('  ')}>{currentState.join('  ')}</span>
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
          <span style={styles.select}>
            <input
              name="allSelect"
              type="checkbox"
              checked={this.state.selectedRows.has(idx)}
              onChange={() => this.selectRow(idx)}
            />
          </span>
        </div>
      );
    }) : [];

    if (this.state.detailsIdx > -1 && this.state.detailsIdx < rows.length) {
      rows.splice(this.state.detailsIdx + 1, 0, this.getDetails());
    }

    return rows;
  }

  getDetails() {
    const {locations, line, eta} = this.state.data[this.state.detailsIdx],
      etaDate = eta && eta.date ? `ETA: ${Moment(eta.date).format('YYYY-MM-DD HH:mm')}` : '',
      etaPod = eta && eta.pod ? `POD: ${eta.pod}` : '',
      {vesselLocation} = this.state;

    let lastVesselState = [];

    // define last state with vessel
    locations.reduce((allStates, {states}) => [...allStates, ...states], [])
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
        <ModalLocation
          vesselLocation={vesselLocation}
          onCancel={() => CoreActions.ActionsContainer.showLocation(null)}
        />
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
                      display: state === lastVesselState ? 'block' : 'none'
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

  getTable() {
    const containers = this.state.data || [];

    return [
      <h4 key="table-header">{this.state.data.length ? '' : 'No result'}</h4>,
      containers && containers.length ?
        <div key="table-column-title" style={{...styles.rowContainer, borderBottom: '1px solid'}}>
          <span style={styles.number}>Number</span>
          <span style={styles.number}>Bill of Lading</span>
          <span style={styles.number}>Line</span>
          <span style={styles.type}>Type</span>
          <span style={styles.currentState}>Current State</span>
          <span style={styles.showDetails}></span>
          <span style={styles.select}>
            <input
              name="allSelect"
              type="checkbox"
              checked={this.state.allChecked}
              onChange={() => this.clickAllChecked()}
            />
          </span>
        </div> : null,
      ...this.getContainers()
    ];
  }

  clickDetails(detailsIdx) {
    this.state.detailsIdx === detailsIdx ?
      this.setState({detailsIdx: -1, vesselLocation: {}}) : this.setState({detailsIdx, vesselLocation: {}});
  }

  selectRow(idx) {
    let {selectedRows} = this.state;

    selectedRows.has(idx) ? selectedRows.delete(idx) : selectedRows.add(idx);

    this.setState({allChecked: false, selectedRows});
  }

  clickAllChecked() {
    this.setState({
      allChecked: !this.state.allChecked,
      selectedRows: this.state.allChecked ? new Set() : new Set(new Array(this.state.data.length).fill(null).map((val, idx) => idx))
    });
  }

  refresh() {
    if (this.state.selectedRows.size) {
      let ids = [];

      this.state.selectedRows.forEach(idx => ids.push(this.state.data[idx].id));

      CoreActions.ActionsContainer.refresh(ids);

      this.setState({allChecked: false, selectedRows: new Set()});
    }
  }

  delete() {
    if (this.state.selectedRows.size && confirm(`Do you realy want to delete ${this.state.selectedRows.size} container(s)?`)) {
      let ids = [];

      this.state.selectedRows.forEach(idx => ids.push(this.state.data[idx].id));

      CoreActions.ActionsContainer.delete(ids);

      this.setState({allChecked: false, selectedRows: new Set()});
    }
  }

  render() {
    const containers = this.state.data || {},
      {lines, selectedRows} = this.state;

    return (
      <div style={styles.container}>
        <h3>My Shipments</h3>
        <FiltersForm
          lines={lines}
          onFilter={filters => CoreActions.ActionsContainer.filter(filters)}
        />
        {this.getTable()}
        {containers && containers.length ?
          <div style={styles.footer}>
            <button
              style={{
                ...styles.button,
                marginRight: 10
              }}
              onClick={() => this.delete()}
              disabled={!Boolean(selectedRows.size)} //eslint-disable-line no-extra-boolean-cast
            >
              {`Delete (${selectedRows.size})`}
            </button>
            <button
              style={styles.button}
              onClick={() => this.refresh()}
              disabled={!Boolean(selectedRows.size)} //eslint-disable-line no-extra-boolean-cast
            >
              {`Data refresh (${selectedRows.size})`}
            </button>
          </div> : null
        }
      </div>
    );
  }
}

Shipments.propTypes = propTypes;

export default injectIntl(Shipments);

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 1100
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
    padding: '0 20px 20px'
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
