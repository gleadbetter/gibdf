const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('./docProperties');

const Material = mongoose.model(
    'material',     // model name - usable for later retrieval
    new Schema({         // modeled schema
        uniqueName: {type: String},
        displayName: String,
        defName: String,
        description: String,
        version: {type: Number, default: 1} ,
        active: Boolean,
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],       
        parentDefinition: new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'materialDef'},
            initalParentDefVersion: Number,
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
        docProperties: docProperties
    }),
    'material'      // collection name - inferrable, but here anyways.
);

const MaterialView = mongoose.model(
    'materialView',     // model name - usable for later retrieval
    new Schema({         // modeled schema
        uniqueName: {type: String},
        displayName: String,
        defName: String,
        description: String,
        version: {type: Number, default: 1} ,
        active: Boolean,
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],       
        parentDefinition: new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'materialDef'},
            initalParentDefVersion: Number,
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
        docProperties: docProperties
    }),
    'vMaterialAllTypes'      // view name - inferrable, but here anyways.
);

module.exports = {
    Material:Material,
    MaterialView:MaterialView
}