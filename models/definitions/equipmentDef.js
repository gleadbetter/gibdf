const mongoose = require('mongoose');
const docProperties = require('../docProperties');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const equipmentDef = mongoose.model(
    'equipmentDef',                 // model name - usable for later retrieval
    new Schema({            // modeled schema
        uniqueName: {type: String},
        displayName: String,
        description: String,
        defName: String,
        version: Number,
        active: Boolean,
        mtcDeviceModel:String,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'equipmentDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [new Schema({
            id: {type: Schema.Types.ObjectId, ref: 'property'},
            propertyConstraints: {
                minLength: {type: Number},
                maxLength: {type: Number},
                minValue: {type: Number},
                maxValue: {type: Number},
                pattern: {type: String},
                format: {type: String},
                enum: [{type: Schema.Types.Mixed}],
                required: {type: Boolean},
                defaultValue: {type: Schema.Types.Mixed},
                refType: {type: String},
                ref: {type: Object},
                displayNameSource: {type: String, enum: ["DICTIONARY", "DEFINITION", "INSTANCE"]}
            },
            inheritedFrom: {type: Schema.Types.ObjectId, ref: 'equipmentDef'}
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
    'equipmentDefs' // collection name
);

module.exports = equipmentDef;
