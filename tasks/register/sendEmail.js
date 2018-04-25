'use strict';

const {Sails} = require('sails'),
  {sailsPortsToLift} = require(process.cwd() + '/config/sailsPortsToLift.js'),
  moment = require('moment'),
  nodemailer = require('nodemailer'),
  mailgunTransport = require('nodemailer-mailgun-transport'),
  Promise = require('bluebird'),
  request = require('request-promise'),
  json2xls = require('json2xls'),
  GET_KPI_DATA_CONCURRENCY = 5;

module.exports = grunt => {
  grunt.registerTask('send:email', 'Send email', function(command) {
    const done = this.async(),
      month = grunt.option('month'),
      year = grunt.option('year');

    switch (command) {
      case 'kpi':
        if (!month || !year) {
          usage(grunt);

          return done();
        }

        return createAndSend(() => KPIesMessage(month, year), done, grunt);
      default:
        usage(grunt);

        return done();
    }
  });
};

/**
 * Create and send email
 *
 * @param {function} createMessageFunc  function that creates message object to send
 * @param {function} done
 * @param {grunt}    grunt
 */
function createAndSend(createMessageFunc, done, grunt) {
  const liftSails = Promise.promisify(new Sails().lift),
    env = grunt.option('env') ? grunt.option('env') : process.env.NODE_ENV,
    sailsConfig = {
      port: sailsPortsToLift.email,
      log: {level: process.env.LOG_LEVEL || 'error'},
      environment: env,
      migrating: false,
      hooks: {
        blueprints: false,
        orm: false,
        pubsub: false,
        grunt: false
      }
    };

  let sailsInstance;

  liftSails(sailsConfig).then(sails => {
    sailsInstance = sails;
    grunt.log.debug('Sails is up');
    return createMessageFunc();
  }).then(message => {
    return sendEmail(message);
  }).then(response => {
    grunt.log.writeln(`Message sent. Additional info: ${JSON.stringify(response)}`);
    sailsInstance.lower(done);
  }).catch(e => {
    grunt.log.error(e);
    sailsInstance.lower(() => done(e));
  });
}


/**
 *
 * Functions for creating message objects
 *
 */

/**
 * Create message object with users KPIes
 *
 * @param   {string}    month
 * @param   {string}    year
 * @returns {Promise}
 */
function KPIesMessage(month, year) {
  const {startDate, finishDate} = APIGatewayUtil.getDateRange(month, year);

  return getUsers().then(users => {
    return Promise.all([
      users,
      Promise.map(users, ({id, scope}) => {
        return getUserKPIesData(id, scope, startDate, finishDate);
      }, {concurrency: GET_KPI_DATA_CONCURRENCY})
    ]);
  }).then(([users, KPIes]) => {
    return users.map(({id, firstName, lastName, phone, scope}, idx) => {
      const kpies = (KPIes[idx][id] || []).map(({INCENTIVE, app: {name, scope, code}}, i) => {
        return `${i ? '\n\n' : ''}code: ${code}\nname: ${name}\nscope: (${scope.join(', ')})\nincentive: ${INCENTIVE}`;
      });

      return {
        name: `${firstName} ${lastName}`,
        phone,
        scope: scope.join(', '),
        kpies
      };
    }).filter(({kpies}) => kpies.length);
  }).then(data => {
    const monthInWord = moment(month.length > 1 ? month : '0' + month, 'MM').format('MMMM'),
      filename = `Users_kpi_for_${monthInWord}_${year}.xlsx`,
      content = new Buffer(json2xls(data), 'binary');

    return {
      subject: `Users kpi for ${monthInWord} ${year}`,
      text: `Check the "${filename}" file in attachment.`,
      attachments: [{filename, content}],
      addresseesGroup: 'kpi'
    };
  });
}


/**
 *
 * Helper functions
 *
 */

/**
 * Get user data note that scopes of users ARE NOT ARRAY (ex. {name: 'JDE'})
 *
 * @param   {string}            id      user id
 * @param   {string|string[]}   scope   scopes
 * @returns {Promise}
 */
function getUsers() {
  return request.post({
    uri: `http://${sails.config.microservices.allInclusive}/allinclusive/users/filter`,
    json: true,
    body: {
      filter: {
        attributes: ['id', 'firstName', 'lastName', 'phone', 'scope']
      }
    }
  }).then(({status, data, errorMsg} = {}) => {
    if (status !== 'ok') {
      throw new Error(errorMsg);
    }

    return data;
  });
}

/**
 * Get user KPIes data
 *
 * @param   {string}            ids          user id
 * @param   {string|string[]}   scopes       scopes
 * @param   {string}            startDate    start date
 * @param   {string}            finishDate   finish date
 * @returns {Promise}
 */
function getUserKPIesData(ids, scopes, startDate, finishDate) {
  return request.post({
    uri: `http://${sails.config.microservices.GAA}/gaa/metrics/get/by/user`,
    json: true,
    body: {ids, scopes, startDate, finishDate},
    headers: {Authorization: 'Bearer testtokenforgas'}
  }).then(({success, data, errorMessage} = {}) => {
    if (!success) {
      throw new Error(errorMessage);
    }

    return data;
  });
}

/**
 * Send emails to addressees
 *
 * @param   {string}    subject
 * @param   {string}    text
 * @param   {array}     attachments       array of attachments
 * @param   {string}    addresseesGroup   addressees group from email config
 * @returns {Promise}
 */
function sendEmail({subject, text, attachments = null, addresseesGroup}) {
  const {auth, from, to} = sails.config.email;

  return Promise.resolve().then(() => {
    if (!to[addresseesGroup].length) {
      throw new Error('Array of addressees is empty');
    }

    return nodemailer.createTransport(mailgunTransport({auth})).sendMail({
      from,
      // property "to" can take array of strings or comma separated string, but
      // on windows there is a bug with array, and therefore we use join() method
      to: to[addresseesGroup].join(', '),
      subject,
      text,
      attachments
    });
  });
}

/**
 * Usage description
 *
 * @param   {grunt}   grunt
 */
function usage(grunt) {
  grunt.log.writeln('\nUsage: grunt send:email[:kpi] [options]\n');
  grunt.log.writeln('send:email:kpi options:');
  grunt.log.writeln('  --month=MONTH  Month of the kpi\n');
  grunt.log.writeln('  --year=YEAR  Year of the kpi');
}
