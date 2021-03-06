(function() {
  'use strict';

  var ipp = require('ipp');
  var Job = require('./job');
  var utils = require('util');

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

  Printer.prototype.createJob = function(file) {
    var self = this;
    if (file && !Buffer.isBuffer(file)) {
      return console.error('createJob method needs takes no argument or a buffer.');
    }
    return new Job(self, file);
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
