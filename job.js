(function() {
  'use strict';

  var events = require('events');
  utils.inherits(Job, events.EventEmitter);

  function Job(printer, file) {
    this.printer = printer;

    var self = this;

    self.printer._api.execute('Create-Job', null, function(err, res) {
      if (err) return console.error(err);

      self.id = res['job-attributes-tag']['job-id'];
      self.uri = res['job-attributes-tag']['job-uri'];
      self.state = res['job-attributes-tag']['job-state'];

      self.emit('job:created');
    });
  }

  Job.prototype.send = function(file) {
    var self = this;

    if (!Buffer.isBuffer(file)) {
      return console.error('Argument must be a valid Buffer');
    }

    self.printer._api.execute('Send-Document', {
      'operation-attributes-tag': {
        'job-uri': self.uri
      },
      data: file
    }, function(err, res) {
      if (err) return console.error(err);
      self.emit('job:sent');
    });
  };

  Job.prototype.process = function() {
    var self = this;
    self.printer._api.execute('Send-Document', {
      'operation-attributes-tag': {
        'job-uri': self.uri,
        'last-document': true
      }
    }, function(err, res) {
      if (err) return console.error(err);
      self.emit('job:process');
      self.refresh();
    });
  };

  Job.prototype.hold = function() {
    var self = this;
    self.printer._api.execute('Hold-Job', {
      'operation-attributes-tag': {
        'job-uri': self.uri
      }
    }, function(err, res) {
      if (err) return console.error(err);
      self.emit('job:held');
      self.refresh();
    });
  };

  Job.prototype.release = function() {
    var self = this;
    self.printer._api.execute('Release-Job', {
      'operation-attributes-tag': {
        'job-uri': self.uri
      }
    }, function(err, res) {
      if (err) return console.error(err);
      self.emit('job:released');
      self.refresh();
    });
  };

  Job.prototype.restart = function() {
    var self = this;
    self.printer._api.execute('Release-Job', {
      'operation-attributes-tag': {
        'job-uri': self.uri
      }
    }, function(err, res) {
      if (err) return console.error(err);
      self.emit('job:restarted');
      self.refresh();
    });
  };

  Job.prototype.cancel = function() {
    var self = this;
    self.printer._api.execute('Cancel-Job', {
      'operation-attributes-tag': {
        'job-uri': self.uri
      }
    }, function(err, res) {
      if (err) return console.error(err);
      self.emit('job:canceled');
      self.refresh();
    });
  };

  Job.prototype.refresh = function() {
    self.printer._api.execute('Get-Job-Attributes', {
      'operation-attributes-tag': {
        'job-uri': self.uri
      }
    }, function(err, res) {
      if (err) return console.error(err);
      self.state = res['job-attributes-tag']['job-state'];
    });
  };

  module.exports = Job;
}).call(this);
