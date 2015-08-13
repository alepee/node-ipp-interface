(function() {
  'use strict';

  var ipp = require('ipp');
  var Promise = require('promise');
  var Job = reuqire('./job');

  var events = require('events');
  utils.inherits(Printer, events.EventEmitter);

  function Printer(address) {
    var self = this;
    self._api = ipp.Printer(address);

    self._api.execute('Get-Printer-Attributes', null, function(err, res) {
      if (err) {
        self.emit('error', err);
        return console.error(err);
      }
      self.attributes = res['printer-attributes-tag'];
      self.emit('init', self.attributes['printer-state']);
    });
  }

  Printer.prototype.createJob = function(fileBuffer) {
    return new Job(self);
  };

  Printer.prototype.getJobs = function() {
    var self = this;
    self._api.execute('Get-Jobs', null, function(err, res) {
      if (err) return console.error(err);
      self.emit('printer:jobs', res['job-attributes-tag']);
    });
  };

  Printer.prototype.pause = function() {
    // TODO: test and clean
    self._api.execute('Pause-Printer', null, function(err, res) {
      if (err) return console.error(err);
      self.emit('printer:paused', res);
    });
  };

  Printer.prototype.resume = function() {
    // TODO: test and clean
    self._api.execute('Pause-Printer', null, function(err, res) {
      if (err) return console.error(err);
      self.emit('printer:paused', res);
    });
  };

  module.exports = Printer;
}).call(this);
