var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;
const docProperties = require('./docProperties');

const Measurement = mongoose.model(
  'measurement',      // model name - usable for later retrieval
  new Schema({    // modelled schema
    job: new Schema({
        ref: String,
        uuid: String,
        name: String,
        id: ObjectId
    },
    {_id: false}),
    sample:  new Schema({
      ref: String,
      uuid: String,
      name: String,
      id: ObjectId
    },
    {_id: false}),
    values: [new Schema({
      name: String,
      value: Mixed,
      propertyId: ObjectId,
      displayName: String,
      refType: String,
      ref: [ new Schema ({
        col:String,
        id:ObjectId,
        valueField: String,
        },
        {_id:false}
        )]
    },
    {_id: false}
  )],
    QualitativeNotesAndDescription: String,
    docProperties: docProperties
  }),
  'measurements'      // collection name - infereable, but here anyways.
);

module.exports = Measurement;