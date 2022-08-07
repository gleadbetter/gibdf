var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

const Toolwear = mongoose.model(
  'toolWear',     // model name - usable for later retrieval
  new Schema({    // modelled schema
    createdDate: Date,
    toolWearDataSource: {
      name: String,
      ref: { 'type': String, 'default': "equipmentResources" },
      id: ObjectId
    },
    toolWearDataTimestamp: Date,
    toolId: {
      name: String,
      ref: { 'type': String, 'default': "assets" },
      id: ObjectId
    },
    cuttingEdgeNumber: Number,
    verticalId: Number,
    wearDepth: {
      max: Number,
      min: Number,
      avg: Number,
      units: String
    },
    maxWearDepthLocation: {
      value: Number,
      units: String
    },
    calibrationImage: { 'type': Boolean, 'default': false },
    calibrationImageOrientation: { 'type': String, 'default': "up" },
    imageName: String,
    imageType: String,
    // data will come in as Buffer anyways, so I GUESS this cuts out a step.
    imageData: Buffer,
    imageFileLength: Number,
    md5: String,
    machineId: {
      name: String,
      ref: { 'type': String, 'default': "equipmentResources" },
      id: ObjectId
    },
    partProgramLineNumber: Number,
    toolPosAbs: {
      x: Number,
      y: Number,
      z: Number,
      a: Number,
      c: Number,
      linearUnits: String,
      rotaionalUnits: String
    },
    spindleAngleAbs: {
      value: Number,
      units: String
    },
    imageTriggerMessage: String,
    imageTriggerTimestamp: Date,
    toolCuttingTime: {
      value: Number,
      units: String
    },
    actWearPrewarningLimit: {
      value: Number,
      units: String
    },
    actWearLimit: {
      value: Number,
      units: String
    },
    jobName: {
      name: String,
      ref: { 'type': String, 'default': "jobs" },
      id: ObjectId
    },
    wearProfile: { 'type': Array, 'default': [] }
  }),
  'toolWear'      // collection name - infereable, but here anyways.
);

module.exports = Toolwear;
