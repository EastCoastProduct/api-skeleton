'use strict';

const _ = require('lodash'),
  bunyan = require('bunyan'),
  bsyslog = require('bunyan-syslog'),
  config = require('../config'),
  PrettyStream = require('bunyan-prettystream');

function createRsyslogBunyanStream(facility) {
  return bsyslog.createBunyanStream({
    type: 'tcp',
    facility: facility,
    host: config.syslog.host,
    port: config.syslog.port
  });
}

let rsyslogBunyanLocal0PrettyStream = new PrettyStream({ useColor: false });
rsyslogBunyanLocal0PrettyStream.pipe(createRsyslogBunyanStream(bsyslog.local0));

let rsyslogBunyanLocal1JSONStream = createRsyslogBunyanStream(bsyslog.local1);

let consoleBunyanPrettyStream = new PrettyStream({ useColor: false });
consoleBunyanPrettyStream.pipe(process.stdout);

let productionStream = [{
  stream: rsyslogBunyanLocal0PrettyStream
}, {
  stream: rsyslogBunyanLocal1JSONStream
}];

/* istanbul ignore next */
const logger = bunyan.createLogger({
  name: 'ecp_api',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  type: 'raw',
  serializers:
  {
    err: bunyan.stdSerializers.err,
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res
  },
  streams: process.env.NODE_ENV === 'production'
    ? productionStream
    : [{ stream: consoleBunyanPrettyStream }]
});

/* istanbul ignore next */
const isTestEnv = () => (config.env === 'circleci');

/* istanbul ignore next */
logger.logRequest = ({ req, res }) => {
  if (!isTestEnv()) req.log.info({ req, res });
};

/* istanbul ignore next */
logger.logError = ({ err, req, res }) => {
  if (!isTestEnv()) req.log.error({ err, req, res });
};

/* istanbul ignore next */
logger.logAppError = (message, err) => {
  if (!isTestEnv()) logger.log({ message: message, err: err });
};

module.exports = logger;
