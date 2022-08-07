const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var valueConstraints = new Schema({
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
    }
});

module.exports = valueConstraints;
