var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var setupSchema = require('./setupSchema');
const docProperties = require('./docProperties');

const Equipment = mongoose.model(
    'equipment',          // model name - usable for later retrieval
    new Schema({          // modelled schema
        name: {type: String, required: true, unique: true},
        displayName: String,
        equipmentResourceType: {type: String, required: true},
        equipmentClasses: {type: Array, "default": []},
        misc: Object,
        ccam: Object,
        description: Object,
        surfacing: Object,
        electrical: Object,
        location: Object,
        integration: Object,
        maintenance: Object,
        dimensions: Object,
        setupDef: [new Schema({
                uuid: String,
                name: String,
                description: String,
                required: Boolean,
                // expected to be one of {"reference", "value"}
                objectType: String,
                // if objectType == "reference":
                referenceRequirement: {
                    collection: String,
                    filter: Object
                },
                // if objectType == "value":
                valueRequirement: {
                    enumerated: Boolean,
                    enumeratedValues: Array,
                    upperBound: Number,
                    dataType: String,
                    units: String
                }
            },
            {_id: false}
        )],
        currentJob: String,
        nextScheduledJob: String,
        docProperties: docProperties,
        pointOfContact: [{type: Schema.ObjectId, ref: 'authUser'}],
        currentSetup: [new Schema({
            item: {type: Schema.ObjectId, refPath: 'currentSetup.processPropertyType'},
            objectType: String,
            processPropertyType: String,
            propertyId: {type: Schema.ObjectId, ref: 'property'},
            propertyName: String,
            types: [{
                type: Schema.ObjectId,
                ref: 'type'
            }],
            required: Boolean,
            value: new Schema({
                dataType: String,
                value: Schema.Types.Mixed
            }, {_id: false})
        }, {_id: false})]
    }),
    'equipment'  // collection name
);

const EquipmentView = mongoose.model(
    'equipmentView',          // model name - usable for later retrieval
    new Schema({              // modeled schema
        name: {type: String, required: true, unique: true},
        displayName: String,
        equipmentResourceType: {type: String, required: true},
        equipmentClasses: {type: Array, "default": []},
        misc: Object,
        ccam: Object,
        description: Object,
        surfacing: Object,
        electrical: Object,
        location: Object,
        integration: Object,
        maintenance: Object,
        dimensions: Object,
        setupDef: [new Schema({
                uuid: String,
                name: String,
                description: String,
                required: Boolean,
                // expected to be one of {"reference", "value"}
                objectType: String,
                // if objectType == "reference":
                referenceRequirement: {
                    collection: String,
                    filter: Object
                },
                // if objectType == "value":
                valueRequirement: {
                    enumerated: Boolean,
                    enumeratedValues: Array,
                    upperBound: Number,
                    dataType: String,
                    units: String
                }
            },
            {_id: false}
        )],
        currentJob: String,
        nextScheduledJob: String,
        docProperties: docProperties,
        pointOfContact: [{type: Schema.ObjectId, ref: 'authUser'}],
        currentSetup: [setupSchema]
    }),
    'vEquipmentAllTypes'  // collection name
);

module.exports = {
    Equipment:Equipment,
    EquipmentView:EquipmentView
}
