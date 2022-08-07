var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const docProperties = require('./docProperties');
//const equipment = require('./equipment');

const EquipmentSetup = mongoose.model(
  'equipmentSetup',                       // model name - usable for later retrieval
  new Schema({
    equipmentId: { type: Schema.Types.ObjectId, required: true },
    active: { type: Boolean, required: true },  // GEL - test was Boolean,  , cast: false
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    version: { type: Number, required: true },
    types: [ { type: Schema.Types.ObjectId } ],
    assemblies: [{ type: Schema.Types.ObjectId }],
    docProperties: docProperties,
    setup: [
        new Schema({
            types: [ { type: Schema.Types.ObjectId }],
            propertyId: { type: Schema.Types.ObjectId, required: true },
            objectType: {type: String, enum: ["reference", "value"] },
            processPropertyType: {type: String },
            itemId: {type: Schema.Types.ObjectId },
            value: new Schema({
                dataType: {
                    type: String,
                    enum: [ "boolean", "number","string"],
                    required: true
                },
                value: { type: Schema.Types.Mixed }
            },
            {_id: false}),
            date: { type: Date,required: true }
        },           
        {_id: false})
    ]
}),
  'equipmentSetups'      // collection name - infereable, but here anyways.
);

const EquipmentSetupView = mongoose.model(
    'equipmentSetupView',    // model name - usable for later retrieval
    new Schema({
        equipmentId: { type: Schema.Types.ObjectId, required: true },
        active:      { type: Boolean, required: true },
        startDate:   { type: Date, required: true },
        endDate:     { type: Date },
        version:     { type: Number, required: true },
        types: [     { type: Schema.Types.ObjectId } ],
        assemblies: [{ type: Schema.Types.ObjectId } ],
        setup: [ { type: Schema.Types.Mixed } ]
    }),
    'vEquipmentSetups'  // collection name   vEquipmentSetups
);

module.exports = {
    EquipmentSetup:EquipmentSetup,
    EquipmentSetupView:EquipmentSetupView
}
