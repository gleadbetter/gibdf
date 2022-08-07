const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('../docProperties');
const FKHelper = require('../../foreign-key-helper');
const propertyConstraints = require('../propertyConstraints');

const DigitalAssetDef = mongoose.model(
    'digitalAssetDef',      // model name - usable for later retrieval
    new Schema({            // modeled schema
        uniqueName: {type: String},
        displayName: String,
        description: String,
        defName: String,
        version: Number,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'digitalAssetDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: propertyConstraints,
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'digitalAssetDef'}
        }, {_id: false})],
        propertySets: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'propertySet'},
            dataDimension: {type: Number},
            initialPropertySetVersion: {type: Number, default: 1},
            syncedWithPropertySetVersion: {type: Number, default: 1},
            displayName: {type: String},
            uniqueName: {type: String},
            description: {type: String},
            dataType: {type: String},
            properties: [{type: Schema.Types.ObjectId, ref: 'property'}],
            types: [{type: Schema.Types.ObjectId, ref: 'type'}],
            userInterface: new Schema({
                headerText: {type: String},
                headerLocation: {type: String},
                fieldLocation: {type: String}
            }, {_id: false})
        }, {_id: false})],
        isCurrentVersion: {type: Boolean, default: true},
        docProperties: docProperties                         // used for auditing
    }),
    'digitalAssetDefs'      // collection name - inferrable, but here anyways.
);

const DigitalAssetDefView = mongoose.model(
    'digitalAssetDefView',      // model name - usable for later retrieval
    new Schema({            // modeled schema
        uniqueName: {type: String},
        displayName: String,
        description: String,
        defName: String,
        version: Number,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'digitalAssetDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: propertyConstraints,
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'digitalAssetDef'}
        }, {_id: false})],
        propertySets: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'propertySet'},
            dataDimension: {type: Number},
            initialPropertySetVersion: {type: Number, default: 1},
            syncedWithPropertySetVersion: {type: Number, default: 1},
            displayName: {type: String},
            uniqueName: {type: String},
            description: {type: String},
            dataType: {type: String},
            properties: [{type: Schema.Types.ObjectId, ref: 'property'}],
            types: [{type: Schema.Types.ObjectId, ref: 'type'}],
            userInterface: new Schema({
                headerText: {type: String},
                headerLocation: {type: String},
                fieldLocation: {type: String}
            }, {_id: false})
        }, {_id: false})],
        isCurrentVersion: {type: Boolean, default: true},
        docProperties: docProperties                         // used for auditing
    }),
    'vDigitalAssetDefsAllTypes'      // collection name - inferrable, but here anyways.
);

module.exports = {
    DigitalAssetDef:DigitalAssetDef,
    DigitalAssetDefView:DigitalAssetDefView
}