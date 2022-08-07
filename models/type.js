var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const docProperties = require('./docProperties');
const ObjectId = Schema.Types.ObjectId;

const Type = mongoose.model(
  'type',       // model name - usable for later retrieval
  new Schema({  // modelled schema
    uniqueName: {
      type: String,
      unique: true
    },
    displayName: String,
    description: String,
    subTypeOf: [{type: ObjectId, ref: 'type'}],
    docProperties: docProperties
  }),
  'types'       // collection name - infereable, but here anyways.
);

module.exports = Type;
