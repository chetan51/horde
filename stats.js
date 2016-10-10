"use strict";

// Requirements
const Measured = require("measured");

// Classes

class Timer {
  constructor(name, stats) {
    this.timer = stats.collection.timer(name);
    this.stopwatch = this.timer.start();
  }

  stop() {
    this.stopwatch.end();
    this.timer.unref();
  }
}

class Stats {
  constructor() {
    // create a stats collection
    this.collection = Measured.createCollection();
  }

  timer(name) {
    return new Timer(name, this);
  }

  count(name) {
    this.collection.counter(name).inc();
  }

  toJSON() {
    return this.collection.toJSON();
  }
}

// Exports
module.exports = Stats;
