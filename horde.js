"use strict";

// Imports
const SimulatedUser = require("./simulated_user");

// Requirements
const _ = require("lodash");
const Chance = require("chance").Chance();
const Fs = require("fs");

// Imports
const Stats = require("./stats");

// Main test class
class Test {
  constructor(Config, Users, reportInterval) {
    // save parameters
    this.Config = Config;
    this.Users = Users;
    this.reportInterval = typeof(reportInterval) != "undefined" ? reportInterval : 30000;  // 30 second default value

    // create a stats collection
    this.stats = new Stats();

    // get weights of each user type
    this.weights = _(Users).map(User => {
      // if weight is defined, use it
      if (typeof User.weight != "undefined") return User.weight;
      // otherwise, return 1 as default value
      return 1;
    });

    // initialize count of running users
    this.numRunningUsers = 0;

    // start user loop
    this.startUserLoop();

    // start report loop
    this.startReportLoop();

    // capture interrupt
    this.captureInterrupt();
  }

  startUserLoop() {
    // loop forever (asynchronously)
    setInterval(() => {
      // if haven't reached max concurrency
      if (this.numRunningUsers < this.Config.get("numConcurrentUsers")) {
        // spawn user
        this.spawnUser();
      }
    });
  }

  startReportLoop() {
    // every N seconds
    setInterval(() => {
      this.writeStats();
    }, this.reportInterval);
  }

  writeStats() {
    // write stats to new file
    Fs.writeFile(`stats_${Date.now()}.json`, JSON.stringify(this.stats.toJSON()));
  }

  captureInterrupt() {
    // capture sigint
    process.on('SIGINT', () => {
      // write final stats
      this.writeStats();

      // log to console
      console.log(this.stats.toJSON());
      console.log("Exiting...");

      // exit process after waiting for a second for stats to finish writing
      setTimeout(() => {
        process.exit();
      }, 1000);
    });
  }

  spawnUser() {
    // select a user at random (weighted) from set of user types
    const User = Chance.weighted(this.Users, this.weights.value());

    // instantiate user
    const user = new User(this);

    // increment num running users
    this.numRunningUsers++;

    // DEBUG: log spawned user
    console.log(`Spawning user: ${user.id}\t# of running users: ${this.numRunningUsers}`);

    // run user
    user.run().finally(() => {
      // DEBUG: log spawned user
      console.log(`Finished user: ${user.id}\t# of running users: ${this.numRunningUsers}`);

      // when user is finished running, decrement num running users
      this.numRunningUsers--;
    })
  }
}

// Exports
module.exports = {
  Test: Test,
  SimulatedUser: SimulatedUser
}
