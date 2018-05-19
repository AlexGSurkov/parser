'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl'; //eslint-disable-line no-unused-vars
import {
  Link,
  withRouter
} from "react-router-dom";

import CoreActions from 'core/actions';
import Constants from 'core/constants';

const {pathPrefix} = Constants;

//const localePrefix = 'menu';

const propTypes = {
    //intl: PropTypes.object.isRequired,
    authorized: PropTypes.bool.isRequired,
    //admin: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

const menuItems = [
  {
    path: 'public',
    title: 'Main Page',
    permission: ''
  },
  {
    path: 'shipments',
    title: 'My Shipments',
    permission: 'authorized'
  },
  {
    path: 'users',
    title: 'Users List',
    permission: 'admin'
  },
  {
    path: 'profile',
    title: 'User Profile',
    permission: 'authorized'
  }
];

class Menu extends Component {
  constructor() {
    super();

  }

  logout() {
    CoreActions.ActionsAuth.logout(() => this.props.history.push(`${pathPrefix}/`));
  }

  getLinkStyle(path) {
    const {pathname} = this.props.location;

    return {textDecoration: pathname === `${pathPrefix}/${path}` ? 'none' : 'underline'};
  }

  getMenuItems() {
    return menuItems.map(({path, title, permission}, idx) =>
      !permission || this.props[permission] ?
        <div key={idx} style={styles.item}>
          <Link style={this.getLinkStyle(path)} to={`${pathPrefix}/${path}`}>{title}</Link>
        </div> : null
    );
  }

  render() {
    return (
      <div style={styles.container}>
        {this.getMenuItems()}
        {this.props.authorized ?
          <div style={{...styles.item, ...styles.itemAuth}}>
            <button onClick={() => this.logout()}>Sign out</button>
          </div> :
          <div style={{...styles.item, ...styles.itemAuth}}>
            <Link style={this.getLinkStyle('login')} to={`${pathPrefix}/login`}>Sign in</Link>
          </div>
        }

      </div>
    );
  }
}

Menu.propTypes = propTypes;

export default withRouter(injectIntl(Menu));

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: 30,
    borderBottom: '1px solid #B7B8BD',
    padding: '10px 0',
    backgroundColor: '#FFFFFF',
    zIndex: 2
  },

  item: {
    marginRight: 30
  },

  itemAuth: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 90
  }
};
