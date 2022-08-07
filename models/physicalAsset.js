const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('./docProperties');

const PhysicalAsset = mongoose.model(
    'physicalAsset',     // model name - usable for later retrieval
    new Schema({         // modeled schema
        uniqueName: {type: String},
        displayName: String,
        defName: String,
        description: String,
        version: {type: Number, default: 1} ,
        active: Boolean,
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],       
        parentDefinition: new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'physicalAssetDef'},
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
    'physicalAssets'      // collection name - inferrable, but here anyways.
);

const PhysicalAssetView = mongoose.model(
    'physicalAssetView',     // model name - usable for later retrieval
    new Schema({         // modeled schema
        uniqueName: {type: String},
        displayName: String,
        defName: String,
        description: String,
        version: {type: Number, default: 1} ,
        active: Boolean,
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],       
        parentDefinition: new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'physicalAssetDef'},
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
    'vPhysicalAssetsAllTypes'      // view name - inferrable, but here anyways.
);

module.exports = {
    PhysicalAsset:PhysicalAsset,
    PhysicalAssetView:PhysicalAssetView
}