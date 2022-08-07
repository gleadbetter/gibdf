var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const docProperties = require('./docProperties');

const Asset = mongoose.model(
  'asset',     // model name - usable for later retrieval
  new Schema({  // modelled schema
    uuid: String,
    name: String, 
    make: String,
    model: String,
    serialNumber: String,
    types: [String],
    docProperties: docProperties
  }),
  'assets'      // collection name - infereable, but here anyways.
);

module.exports = Asset;
