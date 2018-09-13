'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';
import Moment from 'moment';

import LocalConfig from '../../../config/local';

const {tracking: {googleApiKey}} = LocalConfig;

const propTypes = {
  google: PropTypes.object.isRequired,
  vesselLocation: PropTypes.object.isRequired,
  onCancel: PropTypes.func
};

let ModalLocation = ({google, vesselLocation: {lat, lon: lng, timestamp}, onCancel}) => {
  return lat && lng ? (
    <div style={styles.container}>
      {onCancel ?
        <span
          style={styles.btnClose}
          onClick={() => onCancel()}
        /> : null
      }
      <Map
        style={styles.mapContainer}
        google={google}
        initialCenter={{lat, lng}}
        zoom={5}
      >
        <Marker
          onClick={() => alert(`Actual date of location is ${Moment(timestamp).format('YYYY-MM-DD HH:mm')}`)}
          name={'Vessel location'}
          position={{lat, lng}}
        />
      </Map>
    </div>
  ) : null;
};

ModalLocation.propTypes = propTypes;

ModalLocation.defaultProps = {
  onCancel: null
};

export default GoogleApiWrapper({apiKey: googleApiKey})(ModalLocation);

const styles = {
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    background: 'rgba(28, 29, 35, 0.7)',
    zIndex: 10
  },

  mapContainer: {
    width: '92%',
    height: '80%',
    margin: 'auto'
  },

  btnClose: {
    position: 'absolute',
    backgroundImage: 'url(/images/admin/close.png)',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    cursor: 'pointer',
    width: 30,
    height: 30,
    top: 10,
    right: 10,
    zIndex: 1
  },
};
