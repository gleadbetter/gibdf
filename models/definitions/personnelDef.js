const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('../docProperties');
const ObjectId = mongoose.Schema.Types.ObjectId;

const personnelDef = mongoose.model(
    'personnelDef',         // model name - usable for later retrieval
    new mongoose.Schema({           // modelled schema
        uniqueName: {type: String, unique: true},
        displayName: String,
        description: String,
        version: Number,
        active: Boolean,
        subDefOf: [{type: Schema.Types.ObjectId, ref: 'personnelDef'}],
        types: [{type: Schema.Types.ObjectId, ref: 'type'}],
        properties: [{type: Schema.Types.ObjectId, ref: 'properties'}],
        isCurrentVersion: {type: Boolean, default: true}, 
        docProperties: docProperties
    }),
    'personnelDefs' // collection name
);

module.exports = personnelDef;
