var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
const docProperties = require('./docProperties');

const Template = mongoose.model(
  'template',      // model name - usable for later retrieval
  new Schema({    // modelled schema
    uniqueName: String,
    displayName: String,
    rank: Number,
    notes: { 'type': Array, 'default': [] },
    columnHeaders: [new Schema({
      name: String,
      dataType: String,
      inputType: String,
      calculationInfo: {
        calculation: String,
        columns: { 'type': Array, 'default': []}
      }
    },
    {_id: false}
  )],
    type: [{type: ObjectId, ref: 'type'}],
    docProperties: docProperties
  }),
  'templates'      // collection name - infereable, but here anyways.
);

module.exports = Template;