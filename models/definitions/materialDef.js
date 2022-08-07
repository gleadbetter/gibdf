const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('../docProperties');
const FKHelper = require('../../foreign-key-helper');
const propertyConstraints = require('../propertyConstraints');

const MaterialDef = mongoose.model(
    'materialDef',                  // model name - usable for later retrieval
    new mongoose.Schema({           // modelled schema
        uniqueName: {type: String},
        displayName: String,
        defName: String,
        description: String,
        version: {type: Number, default: 1} ,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'materialDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: propertyConstraints,
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'materialDef'}
        }, {_id: false})],      //,{ strict: false }
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
    'materialDefs' // collection name
);

const MaterialDefView = mongoose.model(
    'materialDefView',                  // model name - usable for later retrieval
    new mongoose.Schema({           // modelled schema
        uniqueName: {type: String},
        displayName: String,
        defName: String,
        description: String,
        version: {type: Number, default: 1} ,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'materialDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: propertyConstraints,
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'materialDef'}
        }, {_id: false})],      //,{ strict: false }
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
    'vMaterialDefsAllTypes' // view name
);

module.exports = {
    MaterialDef:MaterialDef,
    MaterialDefView:MaterialDefView
}
