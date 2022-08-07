const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('./docProperties');
//const { stringify } = require('csv');

const DigitalAsset = mongoose.model(
    'digitalAsset',     // model name - usable for later retrieval
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
        documents: [new Schema({
            documentLocation: {type: String, default: "DF"},
            externalRef: {type: Boolean, default: true},
            refType: String,
            ref: {
                col: String,
                id: Schema.Types.ObjectId
            }
        }, {_id: false})]
    }),
    'digitalAssets'      // collection name - inferrable, but here anyways.
);

const DigitalAssetView = mongoose.model(
    'digitalAssetView',     // model name - usable for later retrieval
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
        documents: [new Schema({
            documentLocation: {type: String, default: "DF"},
            externalRef: {type: Boolean, default: true},
            refType: String,
            ref: {
                col: String,
                id: Schema.Types.ObjectId
            }
        }, {_id: false})]
    }),
    'vDigitalAssetsAllTypes'      // view name - inferrable, but here anyways.
);

module.exports = {
    DigitalAsset:DigitalAsset,
    DigitalAssetView:DigitalAssetView
}