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

const ActionsContainer = Reflux.createActions([
  'save',
  'getContainers',
  'filter',
  'delete'
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
  ActionsContainer,
  LoaderActions,
  ActionsPopoverWindow
};
