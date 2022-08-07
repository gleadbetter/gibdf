const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const docProperties = require('./docProperties');
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

const PropertySet = mongoose.model(
    'propertySet',       // model name - usable for later retrieval
    new Schema({  // modelled schema
        uniqueName: {type: String, unique: true,required: true},
        displayName: {type: String, required: true},
        description: {type: String, required: true},
        dataType: {type: String, enum: ['String', 'Boolean', 'Number', 'Date', 'Object'], required: true},
        properties: [{type: ObjectId, ref: 'property'}],
        types: [{type: ObjectId, ref: 'type', required: true}],
        userInterface: new Schema({
            headerText: {type: String},
            headerLocation: {type: String},
            fieldLocation: {type: String}
        }, {_id: false}),
        active: {type: Boolean, default: true},
        docProperties: docProperties
    }),
    'propertySets'       // collection name - inferrable, but here anyways.
);

module.exports = PropertySet;