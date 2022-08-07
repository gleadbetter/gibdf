var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;

var dataSchema = new Schema({  // modelled schema
  dataset: ObjectId,
  previousData: ObjectId,
  nextData: ObjectId, 
  startTime: Date,
  endTime: Date,
  trueEndTime: Date,
  values: [{
    _id:false,
    time: Date,
    value: Mixed,
    MTConnectSquence: Number,
    qod: Number
  }],
  periodicValues: [Number],
  valueCount: Number,
  index: Number
});
dataSchema.index({dataset: 1});
dataSchema.index({startTime: 1});
dataSchema.index({endTime: 1});

var Data = mongoose.model(
  'data',       // model name - usable for later retrieval
  dataSchema,
  'data'        // collection name
);

Data.ensureIndexes();

module.exports = Data;
