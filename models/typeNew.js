var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const docProperties = require('./docProperties');

const TypeNew = mongoose.model(
  'typeNew',       // model name - usable for later retrieval
  new Schema({  // modelled schema
    uniqueName: String,
    displayName: String,
    description: String,
    subTypeOf: [{type: Schema.Types.ObjectId, ref: 'typeNew'}],
    docProperties: docProperties
  }),
  'typesNew'       // collection name - infereable, but here anyways.
);

module.exports = TypeNew;