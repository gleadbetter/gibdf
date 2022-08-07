const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const valueConstraints = require('./valueConstraints');

var propertyConstraints = new Schema({
    minLength: {
        type: Number
    },
    maxLength: {
        type: Number
    },
    minValue: {
        type: Number
    },
    maxValue: {
        type: Number
    },
    pattern: {
        type: String
    },
    format: {
        type: String
    },
    enum: {
        type: Schema.Types.Mixed
    },
    required: {
        type: Boolean,
        default: false
    },
    defaultValue: {
        type: Schema.Types.Mixed
    },
    displayNameSource: {
        type: String,
        enum: [
            "DICTIONARY",
            "DEFINITION",
            "INSTANCE"
        ]
    },
    refType: {
        type: String,
        enum: [
            "NONE",
            "STATIC",
            "VERSIONED",
            "DYNAMIC"
        ]
    },
    reference: new Schema({
        col: {
            type: String
        },
        displayFields: [
            {
                type: String
            }
        ],
        typeRequirements: new Schema({
            types: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'types'
                }
            ],
            filterMethod: {
                type: String,
                enum: [
                    "allOf",
                    "anyOf",
                    "oneOf",
                    "noneOf"
                ]
            }
        }, {_id: false}),
        itemRequirements: new Schema({
            itemIsRequired: {
                type: Boolean,
                default: false
            },
            items: [
                {
                    type: Schema.Types.ObjectId
                }
            ],
            filterMethod: {
                type: String,
                enum: [
                    "allOf",
                    "anyOf",
                    "oneOf",
                    "noneOf"
                ]
            }
        }, {_id: false}),
        fieldFilters: new Schema({
            filters: [
                new Schema({
                    fieldName: {
                        type: String
                    },
                    fieldValue: {
                        type: Schema.Types.Mixed
                    },
                    "valueConstraints ": valueConstraints
                })
            ],
            filterMethod: {
                type: String,
                enum: [
                    "allOf",
                    "anyOf",
                    "oneOf",
                    "noneOf"
                ]
            }
        }, {_id: false}),
        propertyFilters: new Schema({
            filters: [
                new Schema({
                    propertyId: {
                        type: Schema.Types.ObjectId
                    },
                    propertyValue: {
                        type: Schema.Types.Mixed
                    },
                    "valueConstraints ": valueConstraints
                })
            ],
            filterMethod: {
                type: String,
                enum: [
                    "allOf",
                    "anyOf",
                    "oneOf",
                    "noneOf"
                ]
            }
        }, {_id: false})
    }, {_id: false})
});

module.exports = propertyConstraints;