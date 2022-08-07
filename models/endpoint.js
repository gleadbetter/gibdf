var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const EndPoint = mongoose.model(
  'endpoint',     // model name - usable for later retrieval
  new Schema({  // modelled schema
    uniqueName: String,
    method: String
  }),
  'endpoints'      // collection name - infereable, but here anyways.
);

module.exports = EndPoint;