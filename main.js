const request = require('request');
const winston = require('winston');
const Promise = require('bluebird');
/*
 * Class to make calls to Github GraphQl V4 API.
 */
class GraphQLV4 {
  constructor(options) {
    this.options = options;
    this.userAgent = options.userAgent;
    this.url = options.url || 'https://api.github.com/graphql';
    this.Promise = Promise;
    this.token = this.options.token;
  }

  /*
   * Function which calls the GraphQL API.
   */
  queryApi(queryStr, variables) {
    const opts = {};
    const self = this;

    opts.url = self.url;
    const headers = Object.assign({
      'Content-type': 'application/json',
      Authorization: `bearer ${self.token}`,
      'User-Agent': self.userAgent,
    }, self.options.headers);
    opts.headers = headers;
    const body = {};
    body.query = queryStr.replace(/\n/g, '');
    if (variables) {
      body.variables = JSON.stringify(variables);
    }
    opts.body = JSON.stringify(body);

    return new self.Promise(((resolve, reject) => {
      request.post(opts, (error, response, data) => {
        let jsonData;
        if (body && JSON.parse(data)) {
          jsonData = JSON.parse(data);
        }
        if (!jsonData.errors) {
          winston.info('Resolving Github GraphQL response');
          resolve(jsonData);
        } else {
          winston.info('Unexpected error sending GraphQL request to server');
          winston.info(error, 'error');
          reject(error);
        }
      });
    }));
  }
}


module.exports = GraphQLV4;
