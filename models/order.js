var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId
const docProperties = require('./docProperties');

const Order = mongoose.model(
    'order',    // model name - usable for later retrieval
    new Schema( {         // modelled schema
      uuid: String,
      status: {
        type: String,
        enum: ['NOT READY', 'READY', 'ACTIVE', 'COMPLETE'],
        default: 'NOT READY'
      },
      name: String,
      description: String,
      experimentName: String,
      project: String,
      task: String,
      docProperties: docProperties,
      plannedStart: Date,
      plannedEnd: Date,
      actualStart: Date,
      actualEnd: Date,
      productDefinition: { 'type': Array, 'default': [] },
      startQty: Number,
      scrap: Number,
      quantity: Number,
      parts: [ new Schema({          
          id: {
            type: ObjectId,
            ref: 'part'},
          uuid: String
        }, {_id: false})],
      previousRoutingIndex: Number,
      currentRoutingIndex: Number,
      nextRoutingIndex: { 'type': Number, 'default': 0 },
      routing: [new Schema({
        job: {type: ObjectId, ref: 'job'},
        processDefinition: {type: ObjectId, ref: 'process'}
      }, {_id: false})],
      machine_id: String,
      notes: String
    } ),
    'orders'    // collection name - infereable, but here anyways.
  );
  

module.exports = Order;
