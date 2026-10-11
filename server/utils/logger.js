const morgan = require('morgan');

const stream = {
  write: (message) => {
    if (process.env.NODE_ENV !== 'test') console.log(message.trim());
  },
};

const skip = () => process.env.NODE_ENV === 'test';

const httpLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream, skip }
);

module.exports = httpLogger;