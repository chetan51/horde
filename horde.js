// Exports
module.exports = {
  run: run
}

// Requirements
const _ = require("lodash");
const Chance = require("chance").Chance();
const Measured = require("measured");

// Functions

// Run horde
function run(Config, Users) {
  // create a stats collection
  const stats = Measured.createCollection();

  // get weights of each user type
  const weights = _(Users).map(User => {
    // if weight is defined, use it
    if (typeof User.weight != "undefined") return User.weight;
    // otherwise, return 1 as default value
    return 1;
  });

  // generate the set of users
  const users = _
    .range(Config.get("numUsers"))
    .map(_i => {
      return Chance.weighted(Users, weights.value());
    });
}
