var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;
const docProperties = require('./docProperties');
const {datasetProperty} = require('./properties');


const Dataset = mongoose.model(
  'dataset',    // model name - usable for later retrieval
  new Schema({  // modelled schema
        startTime:  {type: Date, required: true},                                   // ISO-9602 UTC time of start time of first data
        endTime:    {type: Date, required: false},                                  // ISO-9602 UTC time of end time (corresponding to end of last data document). End time is null until new day occurs
        firstData:  {type: ObjectId, required: false},                              // ObjectID to first data document
        lastData:   {type: ObjectId, required: false},                              // ObjectiID to last data document
        units:      {type: String, required: false},                                // Units of data (We need this as units could change per POST)
        dataTagID:  {type: ObjectId, required: true},                               // Data tag ID
        name:       {type: String, required: true},                                 // Name of datatag FQN
        count:      {type: Number, required: false},                                // Count of dataset (what is difference between length)
        length:     {type: Number, required: false},                                // Length of dataset
        equipmentID:{type: ObjectId, required: false},                              // Equipment ID
        isMalformed:{type: Boolean, required: false},                               // Data documents are malformed
        jobID:      {type: String, required: false},                                // Job ID
        lastDataVal: {type: Object, required: false},                               // Last Data Value (should become deprecated once PRS has been refactored
        frequency:  {type: Number, required: false},                                // Frequency in Hz
        docProperties: {type: docProperties, required: false},                      // Document properties
        datasetProperties: {type: [datasetProperty], required: false}              // Dataset properties
  }, {_id: true}),
  'dataset'     // collection name
);

module.exports = Dataset;
