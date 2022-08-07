const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('../docProperties');
const propertyConstraints = require('../propertyConstraints');

const PhysicalAssetDef = mongoose.model(
    'physicalAssetDef',     // model name - usable for later retrieval
    new Schema({            // modelled schema
        uniqueName: {type: String},
        displayName: String,
        description: String,
        defName: String,
        version: Number,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'physicalAssetDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: propertyConstraints,
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'physicalAssetDef'}
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
        docProperties: docProperties
    }),
    'physicalAssetDefs'      // collection name - inferrable, but here anyways.
);

const PhysicalAssetDefView = mongoose.model(
    'physicalAssetDefView',     // model name - usable for later retrieval
    new Schema({            // modelled schema
        uniqueName: {type: String},
        displayName: String,
        description: String,
        defName: String,
        version: Number,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'physicalAssetDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: propertyConstraints,
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'physicalAssetDef'}
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
        docProperties: docProperties
    }),
    'vPhysicalAssetDefsAllTypes'      // view name - inferrable, but here anyways.
);

module.exports = {
    PhysicalAssetDef:PhysicalAssetDef,
    PhysicalAssetDefView:PhysicalAssetDefView
}