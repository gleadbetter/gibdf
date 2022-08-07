var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var setupSchema = require('./setupSchema');
const docProperties = require('./docProperties');
const ObjectId = Schema.Types.ObjectId;


/*** Adapted from AMMS 7/30/2020 ***/

const Process = mongoose.model(
  'process',  // model name - usable for later retrieval
  new Schema({          // modelled schema
      defName: String,
      displayName: String,
      description: String,
      version: {type: Number, default: 1},
      active: {type: Boolean, default: true},
      // GEL - not used anymore ... properties are defined in the properties collection.
    //   propertyDefs: [new Schema({
    //       propertyName: String,
    //       propertyId: {type: ObjectId, ref: 'property'},
    //       required: Boolean,
    //       objectType: String,
    //       processPropertyType: String,
    //       typeRequirements: new Schema({
    //           types: [{type: ObjectId, ref: 'type'}],
    //           filterMethod: String
    //       }, {_id: false}),
    //       valueRequirements: new Schema({
    //           dataType: String,
    //           enumerated: Boolean,
    //           minimunValue: Number,
    //           maximunValue: Number,
    //           defaultValue: Schema.Types.Mixed,
    //           enum: [Schema.Types.Mixed]
    //       },{_id: false})
    //   }, {_id: false})],
      types: [{
          type: ObjectId,
          ref: 'type'
      }],
      subDefOf: [{
          type: ObjectId,
          ref: 'process'
      }],
      processRequirements: [new Schema({
          propertyName: String,
          propertyId: {type: ObjectId, ref: 'property'},
          required: Boolean,
          objectType: String,
          processPropertyType: String,
          typeRequirements: new Schema({
              types: [{type: ObjectId, ref: 'type'}],
              filterMethod: String
          }, {_id: false}),
          itemRequirements: new Schema({
              itemIsRequired: Boolean,
              items: [Schema.Types.Mixed],
              itemPropertiesRequirements: {}
          }, {_id: false}),
          valueRequirements: new Schema({
              dataType: String,
              enumerated: Boolean,
              minimunValue: Number,
              maximunValue: Number,
              defaultValue: Schema.Types.Mixed,
              enum: [Schema.Types.Mixed]
          },{_id: false})
      },{_id: false})],
      docProperties: docProperties
  }),
  'processDefs'      // collection name - inferrable, but here anyways
);

module.exports = Process;
