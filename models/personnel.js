var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const docProperties = require('./docProperties');

const Personnel = mongoose.model(
  'personnel',      // model name - usable for later retrieval
  new Schema({      // modelled schema
    userId: {type: Schema.Types.ObjectId, ref: 'authUser' },
    version: {type: Number, default: 1} ,
    active: Boolean,
    types: [{type: Schema.Types.ObjectId, ref: 'type'}],
    parentDefinition: new Schema({
        id: {type: Schema.Types.ObjectId, ref: 'digitalAssetDef'},
        name: String,
        version: Number
    }, {_id: false}),
    properties: [new Schema({
        id: {type: Schema.Types.ObjectId, ref: 'property'},
        displayName: {type: String},
        value: {type: Schema.Types.Mixed}
    }, {_id: false})],
    propertySets: [new Schema({
        id: {type: Schema.Types.ObjectId, ref: 'propertySet'},
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            displayName: {type: String},
            value: {type: Schema.Types.Mixed}
        }, {_id: false})],
        table: [[new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            value: {type: Schema.Types.Mixed}
        }, {_id: false})]],
    }, {_id: false})],
    isCurrentVersion: {type: Boolean, default: true},
    docProperties: docProperties,
  }),
  'personnel'  // collection name - infereable, but here anyways
);

const PersonnelView = mongoose.model(
  'personnelView',     // model name - usable for later retrieval
  new Schema({        // modeled schema
      uniqueName: {type: String},
      displayName: String,
      description: String,
      defName: String,
      version: {type: Number, default: 1} ,
      active: Boolean,
      types: [{type: Schema.Types.ObjectId, ref: 'type'}],
      parentDefinition: new Schema({
          id: {type: Schema.Types.ObjectId, ref: 'digitalAssetDef'},
          initialParentDefVersion: Number,
          syncedWithParentDefVersion: Number
      }, {_id: false}),
      properties: [new Schema({
          id: {type: Schema.Types.ObjectId, ref: 'property'},
          displayName: {type: String},
          value: {type: Schema.Types.Mixed}
      }, {_id: false})],
      propertySets: [new Schema({
          id: {type: Schema.Types.ObjectId, ref: 'propertySet'},
          properties: [new Schema({
              id: {type: Schema.Types.ObjectId, ref: 'property'},
              displayName: {type: String},
              value: {type: Schema.Types.Mixed}
          }, {_id: false})],
          table: [[new Schema({
              id: {type: Schema.Types.ObjectId, ref: 'property'},
              value: {type: Schema.Types.Mixed}
          }, {_id: false})]],
      }, {_id: false})],
      isCurrentVersion: {type: Boolean, default: true},
      docProperties: docProperties,
  }),
  'vPersonnelAllTypes'      // view name - inferrable, but here anyways.
);
module.exports = {
  Personnel: Personnel,
  PersonnelView: PersonnelView
}
