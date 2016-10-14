
"use strict";

// Requirements
const _ = require("lodash");
const Request = require("request-promise");

class SimulatedUser {
  constructor(test) {
    // store parameters
    this.test = test;

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
    const timer = this.test.stats.timer(`${method} ${name}`);

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
      console.log(`${this.timestamp()}: ${this.constructor.name} ${options.method} ${options.uri}`);
    }

    // make request
    return Request(options)
      .then(body => {
        // track success response status code as counter
        this.test.stats.count(`200 ${method} ${name}`);

        // propagate body
        return body;
      })
      .catch(error => {
        // track error response status code as counter
        this.test.stats.count(`${error.statusCode} ${method} ${name}`);

        // DEBUG:
        if (this.debug) {
          console.log(`[ERROR] ${this.timestamp()}: ${this.constructor.name} ${options.method} ${options.uri} ${error.statusCode} ${error.message}`);
        }

        // propagate error
        return error;
      })
      .finally(()=> {
        // stop timer
        timer.stop();
      });
  }

  // Helper: Return current timestamp
  timestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }

  // Helper: Generate random delay duration from given interval
  delayDuration(intervalName) {
    // generate random delay duration from interval
    let delayDuration = _.random(this.test.Config.get(intervalName)[0], this.test.Config.get(intervalName)[1], true);

    // DEBUG: log duration
    // console.log(`Generated delay for interval ${intervalName}: ${delayDuration}`);

    // convert to seconds
    delayDuration *= 1000;

    // return delay duration
    return delayDuration;
  }
}

// Exports
module.exports = SimulatedUser;
