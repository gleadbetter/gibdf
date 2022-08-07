var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var setupSchema = require('./setupSchema');
const docProperties = require('./docProperties');


/*** Old Digitial Factory Code
var Job = mongoose.model(
  'job',      // model name - usable for later retrieval
  new Schema({    // modelled schema
    uuid: String,
    name: String,
    status: {
      type: String,
      enum: ['NOT READY', 'READY', 'ACTIVE', 'COMPLETE'],
      default: 'NOT READY'
    },
    description: String,
    task: String,
    docProperties: docProperties,
    primaryEquipment: String,
    primaryPersonnel: String,
    orders: [new Schema({
        uuid: String,
        name: String,
        routingStep: Number
      },
      {_id: false}
    )],
    scheduledStart: Date,
    scheduledEnd: Date,
    actualStart: Date,
    actualEnd: Date,
    dependencies: String,
    processDefinition: new Schema({
        id: ObjectId,
        name: String,
        description: String,
        rev: Number,
        equipmentResourceType: String
      },
      {_id: false}
    ),
    // Prevent initialization with a blank string.
    operatorNotes: { 'type': Array, 'default': [] },

    jobSetup: [setupSchema],

    // TODO revise for general use outside of APS
    materialResources: { 'type': Array, 'default': [] },

    assets: [new Schema({
        type: String,
        name: String,
        id: ObjectId
      },
      {_id: false}
    )]
  }),
  'jobs'      // collection name - infereable, but here anyways.
);
*/


/*** Adapted from AMMS 7/30/2020 ***/

// Issues with storing jobs with empty data - GEL 1/29/2021 - add required=true
const Job = mongoose.model(
  'job',      // model name - usable for later retrieval
  new Schema({    // modelled schema
          jobId: {
              type: String,
              unique: true,
              required: true        // add
          },
          name: {
            type: String,
            required: true          // add
          },
          status: {
                  type: String,
                  enum: ['NOT READY', 'READY', 'ACTIVE', 'COMPLETE'],
                  default: 'NOT READY',
                  required: true    // add                 
          },
          project: String,
          task: String,
          description: String,
          orders: [new Schema({
              id: {type: ObjectId, ref: 'order'},
              uuid: String,
              name: String,
              routingStep: Number 
          },{_id:false})],
          processDef: {type: ObjectId, ref: 'process'},
          primaryEquipment: {type: ObjectId, ref: 'equipment'},
          equipmentResourceType: {type: ObjectId, ref: 'type'},
          parts: [{type: ObjectId, ref: 'part'}],
          startQty: Number,
          endQty: Number,
          startOfJobConfig: [new Schema({
              item: {type: ObjectId, refPath: 'startOfJobConfig.processPropertyType'},
              objectType: String,
              processPropertyType: String,
              propertyId: {type: ObjectId, ref: 'property'},
              propertyName: String,
              types: [{
                  type: ObjectId,
                  ref: 'type'
              }],
              required: Boolean,
              value: new Schema({
                  dataType: String,
                  value: Schema.Types.Mixed
              }, {_id: false})
          }, {_id: false, required: true})],    // add
          endOfJobConfig: [new Schema({
              item: {type: ObjectId, refPath: 'endOfJobConfig.processPropertyType'},
              objectType: String,
              processPropertyType: String,
              propertyId: {type: ObjectId, ref: 'property'},
              propertyName: String,
              types: [{
                  type: ObjectId,
                  ref: 'type'
              }],
              required: Boolean,
              value: new Schema({
                  dataType: String,
                  value: Schema.Types.Mixed
              }, {_id: false})
          }, {_id: false})],
          resourceConsumption: [],
          scheduledStart: Date,
          scheduledEnd: Date,
          actualStart: Date,
          actualEnd: Date,
          operatorNotes: [{type: String}],
          docProperties: docProperties
  }),
  'jobs'      // collection name - inferrable, but here anyways.
);


module.exports = Job;
