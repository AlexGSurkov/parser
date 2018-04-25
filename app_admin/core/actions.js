'use strict';

import Reflux from 'reflux';

const ActionsAuth = Reflux.createActions([
  'performAuth',
  'logout'
]);

const ActionsUser = Reflux.createActions([
  'getUser',
  'saveUser',
  'deleteUser'
]);

const ActionsUsers = Reflux.createActions([
  'getUsers'
]);

const ActionsParsing = Reflux.createActions([
  'getLines',
  'search'
]);

const LoaderActions = Reflux.createActions([
  'setShow'
]);

const ActionsPopoverWindow = Reflux.createActions([
  'showStandardMessage',
  'showError',
  'showServerError'
]);

export default {
  ActionsAuth,
  ActionsUser,
  ActionsUsers,
  ActionsParsing,
  LoaderActions,
  ActionsPopoverWindow
};
