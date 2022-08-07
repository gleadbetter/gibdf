var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;
const docProperties = require('./docProperties');

const dataTagTypes = Object.freeze({
    timeseries: 'timeseries',
    continuous: 'continuous',
    spectrum: 'spectrum',
    manual: 'manual'
});


const dictionaryTypes = Object.freeze({
    tagname: 'tagname',
    datasource: 'dataSource',
    eventprovider: 'eventProvider'
});


// Eric - 11/12/20 -  the "sourceDocument" schema needs a little work (remove currentDataSet, scale, and equipmentResource).
// 	1) dataType must match one of the enums [Boolean, Double, Int32, String]
//  2) active: true  -- this should be in your POST.  Gib – let’s make “active” a required field 
const tagDocument = mongoose.model(
    'tagDocument',     // model name - usable for later retrieval
    new Schema({  // modelled schema
        //dictionaryType: {type: String, required: true, enum: Object.values(dictionaryTypes)},
        dictionaryType: {
            type: String,
            default: "tagname",
            enum: ["tagname"],
            required: true
        },
    
        name: {type: String, required: true, unique: true},
        displayName: String,
        description: String,
        dataTagType: {type: String, default: "timeSeries", required: true, enum: Object.values(dataTagTypes)},             // Type of dataset (timeseries, continuous, spectrum,....)
        dataType:    {type: String, enum : ['Boolean','Double','Int32','String'], required: true},     // Type of data  (Number, String, bool,....)
        units: String,
        equipmentResource: new Schema({
            id:   {type: ObjectId, required: true},
            uuid: {type: ObjectId},
            name: {type: String, required: true},
            component: {type: String, required: false}  // GEL Add 2/1/2021 - Tag info Issue #63
            },
            {_id: false}
        ),
        displayRange: new Schema({
            min: {type: Number },
            max: {type: Number },
            },
            {_id: false}
        ),
        interpolationType: {
            type: String,
            default: "stair",
            enum: [
                "linear",
                "stair"
            ]
        },
        scale: new Schema({
            addFactor: {
                type: Number,
                default: 0
            },
            multiplyFactor: {
                type: Number,
                default: 1
            },
        }),
        primaryDataSourceId: {type: ObjectId, required: true},
        altDataSourceId: ObjectId,                       
        active: {type:Boolean, default:true, required:true},   // GEL - add
        type:   {type: String},
        subType:{type: String},        
        docProperties: docProperties
    }),
    'dataDictionary'
);
// eric change 11/19/20 - dataSourceType - field updates
const sourceDocument = mongoose.model(
    'sourceDocument',     // model name - usable for later retrieval
    new Schema({          // modelled schema
        dictionaryType: {type: String, required: true, default: "dataSource"},
        name: {type: String, required: true, unique: true},
        displayName: {type: String, required: true},
        description: {type: String},
        dataSourceType: {
            type: String,
            enum: [
                "CDH API",
                "OPC UA",
                "MTC Agent",
                "API Client"
            ],
            required: true
        },
        dataSourceProperties: {
            type: Schema.Types.Mixed
        },        
        active: {
            type: Boolean,
            default: true,
            required: true
        },
    }),
    'dataDictionary'
);

/**
 *      NOTE: Below is for the VIEW collection
 *      Question? Is this necessary ?? or just schema with empty values.
 */
const tagView = mongoose.model("tagView",
    new Schema({
        dictionaryType: String,
        name: String,
        displayName: String,
        description: String,
        units: String,
        dataType: {type: String, required: true}, // Type of dataset (timeseries, continuous, spectrum,....)
        dataTagType: {type: String, required: true, enum: Object.values(dataTagTypes)}, // Type of dataset (timeseries, continuous, spectrum,....)
        interpolationType: String,
        equipmentResource: new Schema({
                id: ObjectId,
                name: String,
				component: String                 // GEL Add 2/1/2021 - Tag info Issue #63
            },
            {_id: false}),
        currentDataSet: ObjectId,
        scale: new Schema({
                addFactor: Number,
                multiplyFactor: Number
            },
            {_id: false}),
        primaryDataSourceId: ObjectId,
        altDataSourceId: ObjectId,
        createdBy: String,
        createdDate: Date,
        rev: String,
        lastModifiedBy: String,
        LastModifiedDate: Date,
        dataSource: {
            dictionaryType: String,
            name: String,
            displayName: String,
            description: String,
            units: String,
            dataType: String,
            interpolationType: String,
            equipment: new Schema({
                    id: ObjectId,
                    name: String,
                    uuid: String
                },
                {_id: false}),
            currentDataSet: ObjectId,
            scale: new Schema({
                    addFactor: Number,
                    multiplyFactor: Number
                },
                {_id: false}),
            primaryDataSourceId: ObjectId,
            altDataSourceId: ObjectId,
            createdBy: String,
            createdDate: Date,
            rev: String,
            lastModifiedBy: String,
            lastModifiedDate: Date
        }
    }),
    "vTagsWithSources");


const eventView = mongoose.model("eventView",
    new Schema({
        eventName: String,
        equipmentResourceId: {type: Schema.ObjectId, ref: 'equipment'}
    }),
    "vDataDictionaryEventItems");

//module.exports = TagDictionary;
module.exports = {
    sourceDocument: sourceDocument,
    tagDocument: tagDocument,
    tagView: tagView
};
