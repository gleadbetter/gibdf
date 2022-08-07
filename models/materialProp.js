var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var materialProp = new Schema({
    name: String,
    description: String,
    value: new Schema({
        value: Mixed,
        dataType: String,
        units: String
      },
      {_id: false}
    )
  },
  {_id: false}
)

module.exports = materialProp
