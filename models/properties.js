var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;


let datasetProperty = new Schema({
        name: {type: String, required: true},
        //value: {type: mongoose.mixed},
        metaData: { type: Object }
    },
    {_id: false, strict: false}
);



datasetProperty.set('toObject', {getters: true});

module.exports = {
    datasetProperty: datasetProperty
}
