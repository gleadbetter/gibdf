const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('./docProperties');
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;
const propertyConstraints = require('./propertyConstraints');

const Property = mongoose.model( 
    'property',  // model name - usable for later retrieval
    new Schema({  // modelled schema
    uniqueName: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dataType: {
        type: String,
        enum: [
            "String",
            "Boolean",
            "Number",
            "Date",
            "Object",
            "File",
            "Array"
        ],
        required: true
    },
    arrayItem: {
        type: Boolean,
        default: false
    },
    subPropertyOf: [{
        type: Schema.Types.ObjectId,
        ref: 'property'
    }],
    propertyConstraints: propertyConstraints,
    defaultValue: {
        type: Schema.Types.Mixed
    },
    sample: {
        type: Schema.Types.Mixed
    },
    comments: {
        type: String
    },
    types: [
        {
            type: Schema.Types.ObjectId,
            ref: 'type'
        }
    ],
    active: {
        type: Boolean,
        default: true
    },
    docProperties: docProperties
}),
'properties'       // collection name - inferrable, but here anyways.
);

const PropertyView = mongoose.model( 
    'propertyView',  // model name - usable for later retrieval
    new Schema({  // modelled schema
    uniqueName: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dataType: {
        type: String,
        enum: [
            "String",
            "Boolean",
            "Number",
            "Date",
            "Object"
        ],
        required: true
    },
    arrayItem: {
        type: Boolean,
        default: false
    },
    subPropertyOf: {
        type: Schema.Types.ObjectId,
        ref: 'property'
    },
    propertyConstraints: propertyConstraints,
    defaultValue: {
        type: Schema.Types.Mixed
    },
    sample: {
        type: Schema.Types.Mixed
    },
    comments: {
        type: String
    },
    types: [
        {
            type: Schema.Types.ObjectId
        }
    ],
    active: {
        type: Boolean,
        default: true
    },
    docProperties: docProperties
}),
'vPropertiesAllTypes'       // collection name - inferrable, but here anyways.
);

module.exports = {
    Property:Property,
    PropertyView:PropertyView
}