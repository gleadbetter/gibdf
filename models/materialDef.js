var mongoose = require('mongoose');
var materialProp = require('./materialProp');
const docProperties = require('./docProperties');

var materialDef = mongoose.model(
  'materialDef',         // model name - usable for later retrieval
  new mongoose.Schema({           // modelled schema
    uuid: String,
    name: String,
    docProperties: docProperties,
    description: String,
    materialProperties: [materialProp]
  }),
  'materialDefinitions' // collection name
);

module.exports = materialDef;
