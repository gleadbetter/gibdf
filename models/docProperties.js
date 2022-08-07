const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let docProperties = new Schema({
        createdBy: {
            id: {type: ObjectId, ref: 'authUser'},
            userName: String,
            displayName: String
        },
        createdDate: Date,
        rev: Number,
        lastRevDate: Date,
        lastModifiedBy: {
            id: {type: ObjectId, ref: 'authUser'},
            userName: String,
            displayName: String
        }
    },
    {_id: false}
);

docProperties.set('toObject', {getters: true});
module.exports = docProperties;
