const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;

const alarm = mongoose.model(
    'alarm',
    new Schema({
            dataAgentName: {
                type: String,
                required: true
            },
            dataSourceName: {
                type: String,
                required: true
            },
            sourceTime: {
                type: Date,
                required: true
            },
            receiveTime: {
                type: String,
                required: false
            },
            logTime: {
                type: Date,
                default: Date.now,
                required: true
            },
            conditionName: {
                type: String,
                required: false
            },
            message: {
                type: String,
                required: true
            },
            severity: {
                type: Number,
                required: true
            },
            eventSourceName: {
                type: String,
                required: true
            },
            eventSourceId: {
                type: String,
                required: false
            },
            eventType: {
                type: String, // or Object...
                required: false
            },
            eventSourceNode: {
                type: String, // or Object...
                required: false
            },
            equipmentResourceId: {
                type: Schema.ObjectId,
                ref: 'equipment',
                required: false
            },
            emailNotification: {
                type: {
                    sentTime: {
                        type: Date
                    },
                    emailResult: {
                        type: String
                    },
                    recipients: [{type: Schema.ObjectId, ref: 'authUser'}]
                },
                required: false
            }
        }
    ),
    'alarms'
);

module.exports = alarm;
