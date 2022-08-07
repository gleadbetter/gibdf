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
    values:         {type: [Number], required: true},
    valueCount:     {type: Number, required: true},
    index:          {type: Number, required: true}
});
dataSchema.index({dataset:1, index: 1});
dataSchema.index({dataset: 1, startTime: 1});

var SpectrumData = mongoose.model(
   'spectrumdata',       // model name - usable for later retrieval
  dataSchema,
  'spectrumdata'        // collection name
);

SpectrumData.ensureIndexes();

module.exports = SpectrumData;
