
"use strict";

// Requirements
const Request = require("request-promise");

class SimulatedUser {
  constructor(stats) {
    // store parameters
    this.stats = stats;

    // set default values
    this.debug = false;
  }

  // Make request to server
  // NOTE: [body, name] are optional
  request(method, path, body, name) {
    // set name to path if it's not defined
    if (typeof(name) == "undefined") {
      name = path;
    }

    // time how long it tasks to make request
    const timer = this.stats.timer(`${method} ${name}`);

    // define request options
    const options = {
      method: method,
      uri: this.makeUrl(path),
      json: true
    };

    // set body if it's defined
    if (typeof(body) != "undefined" && body != null) {
      options.body = body;
    }

    // DEBUG:
    if (this.debug) {
      console.log(`${new Date().getTime() / 1000}: ${this.constructor.name} ${options.method} ${options.uri}`);
    }

    // make request
    return Request(options)
      .then(body => {
        // track success response status code as counter
        this.stats.count(200);

        // propagate body
        return body;
      })
      .catch(error => {
        // track error response status code as counter
        this.stats.count(error.statusCode);

        // DEBUG:
        if (this.debug) {
          console.log(`[ERROR] ${new Date().getTime() / 1000}: ${this.constructor.name} ${options.method} ${options.uri} ${error.statusCode} ${error.message}`);
        }

        // propagate error
        return error;
      })
      .finally(()=> {
        // stop timer
        timer.stop();
      });
  }
}

// Exports
module.exports = SimulatedUser;
