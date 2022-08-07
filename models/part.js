const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const docProperties = require('./docProperties');


var partData = new Schema({
    initial: Number,
    final: Number,
    diff: Number
  },
  {_id: false}
);

var Part = mongoose.model(
  'part',       // model name - usable for later retrieval
  new Schema({  // modelled schema
    uuid: String,
    name: String, 
    quality: String,
    productDefinition: String,
    description: String,
    notes: String,
    samples:[ObjectId],
    jobs: [{type: ObjectId, ref: 'job'}],
    partDef:{type: ObjectId, ref: 'partDefinition'},
    quality: {
      type: String,
      enum: ['UNKNOWN', 'GOOD', 'OK', 'POOR'],
      default: 'UNKNOWN'
    },
    order: {type: ObjectId, ref: 'order'},
    sampleId:String,
    isSample:Boolean,
    sampledFromPart:ObjectId,
    currentJob: String,
    currentLocation: String,
    docProperties: docProperties
  }),
  'parts'       // collection name - infereable, but here anyways.
);

module.exports = Part;
