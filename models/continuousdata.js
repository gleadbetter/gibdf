var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;

var dataSchema = new Schema({  // modelled schema
    dataset:        {type: ObjectId, required: true},
    previousData:   {type: ObjectId, required: false},
    nextData:       {type: ObjectId, required: false},
    startTime:      {type: Date, required: true},
    endTime:        {type: Date, required: false},
    trueEndTime:    {type: Date, required: false},
    values: [{
        time: Date,
        value: Mixed,
        MTConnectSquence: Number,
        qod: Number
    }],
    periodicValues: {type: [Number], required: false},
    valueCount:     {type: Number, required: false},
    index:          {type: Number, required: false}
});
dataSchema.index({dataset:1, index: 1});
dataSchema.index({dataset: 1, startTime: 1});

var ContinuousData = mongoose.model(
   'continuousdata',       // model name - usable for later retrieval
  dataSchema,
  'continuousData'        // collection name
);

ContinuousData.ensureIndexes();

module.exports = ContinuousData;
