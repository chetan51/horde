"use strict";

// Exports
module.exports = {
  run: run
}

// Requirements
const _ = require("lodash");
const Chance = require("chance").Chance();
const Rx = require("rx");

// Imports
const Stats = require("./stats");

// Functions

// Run horde
function run(Config, Users) {
  // create a stats collection
  const stats = new Stats();

  // get weights of each user type
  const weights = _(Users).map(User => {
    // if weight is defined, use it
    if (typeof User.weight != "undefined") return User.weight;
    // otherwise, return 1 as default value
    return 1;
  });

  // generate stream of users
  const users = Rx.Observable
    // each user runs after an interval
    .interval(Config.get("userInterval"))
    // specify number of users to run
    .take(Config.get("numUsers"))
    // select each user at random (weighted) from set of user types
    .map(_i => Chance.weighted(Users, weights.value()))
    // instantiate each user
    .map(User => new User())
    // make stream hot so multiple subscriptions share the same stream (instead of making a copy of the stream)
    .share();

  // generate stream of user runs from users
  const userRuns = users
    // run each user
    .flatMap(user => Rx.Observable.fromNodeCallback(user.run, user)(stats));

  userRuns.subscribe(
    () => {},
    error => console.log(`Error while running user: ${error.stack}`),
    () => console.log(stats.toJSON())
  );
}
