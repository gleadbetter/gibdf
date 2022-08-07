var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const docProperties = require('./docProperties');
//const equipment = require('./equipment');



const EquipmentLogbook = mongoose.model(
    'equipmentLogbook',
  
  new Schema({
      equipmentId: { type: Schema.Types.ObjectId, required: true },
      active: { type: Boolean, required: true },  
      dateTime: { type: Date, required: true },
      version: { type: Number, required: true },
      types: [ { type: Schema.Types.ObjectId } ],
      userId: {type: Schema.Types.ObjectId, ref: 'authUser' },
      notes: [{type: String}],
      docProperties: docProperties
  }),
  'equipmentLogbooks'      // collection name - inferrable, but here anyways.
  );
  

module.exports = {
    EquipmentLogbook:EquipmentLogbook
}
