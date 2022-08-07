var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

var setupSchema = new Schema({
    uuid: String,
    name: String,
    description: String,
    // if setupDef.objectType == "reference":
    // NOTE: field can't be named "type" because that's reserved by Mongoose.
    assetType: {
      uuid: String,
      collection: String,
      id: ObjectId
    },
    // Holds the material or asset related to the type
    item: {
      uuid: String,
      collection: String,
      id: ObjectId
    },
    // if setupDef.objectType == "value":
    value: {
      dataType: String,
      units: String,
      // TODO cast value as Number (from HTTP String) when dataType demands it.
      value: Mixed
    }
  },
  {_id: false}
);

module.exports = setupSchema
