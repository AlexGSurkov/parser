'use strict';

function createConUrl(conConf) {
  conConf = conConf || {};

  var con = getConnection();

  if (! con) {
    return null;
  }

  if (con.url) {
    return con.url;
  }

  var conDefs = {
    user: 'postgres',//your postgres superuser
    password: '',
    port: 5432,
    host: 'localhost',
    database: 'postgres'
  };

  var conString = "postgres://" +
    ( conConf.user      || con.user     || conDefs.user ) + ":" +
    ( conConf.password  || con.password || conDefs.password ) + "@" +
    ( conConf.host      || con.host     || conDefs.host ) + ":" +
    ( conConf.port      || con.port     || conDefs.port ) + "/" +
    ( conConf.database  || con.database || conDefs.database );

  return conString;
};


function getConnection () {
  var env = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'development',
    con, confLocal;

  try {
    confLocal = require(__dirname + '/../config/local.js');
  } catch (err) {
    console.warn('Loading local.js "' + err + '"' );
  }

  try {
    // todo: мержить local.js и connections.js, иначе в локал.жс нужно и database прописывать
    con = confLocal && confLocal.connections && confLocal.connections[env] ?
      confLocal.connections[env] : require(__dirname + '/../config/connections.js').connections[env];
  }
  catch (err) {
    console.error(err);
    return null;
  }

  if (! con) {
    console.error('Connection for "' + env + '" not found' );
  }

  return con;
};

module.exports.createConUrl = createConUrl;
module.exports.getConnection = getConnection;
