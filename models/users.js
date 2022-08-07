var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;
const docProperties = require('./docProperties');

const authUser = mongoose.model(
    'authUser',
    new Schema({
        name: String,
        uuid: String,
        displayName: String,
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        ref: { 'type': Array, 'default': []},
        secret: {type: ObjectId, ref: "authSecret"},
        roles: [{type: ObjectId, ref: "authRole"}],
        docProperties: docProperties,
        active: Boolean
    }),
    'authUsers'
)

const authSecret = mongoose.model(
    "authSecret",
    new Schema({
        secretType: String,
        secret: String,
        previousSecrets: { 'type': Array, 'default': [] },
        docProperties: docProperties,
        expirationDate: Date,
        sourceOfLastUpdate: String
    }),
    'authSecrets'
)

const authRole = mongoose.model(
    "authRole",
    new Schema({
        name: String,
        uuid: String,
        displayName: String,
        description: String,
        docProperties: docProperties,
        authorizations: [{type: ObjectId, ref: 'endpoint'}]
    }),
    'authRoles'
)

const userRolesView = mongoose.model(
    "userRolesView",
    new Schema({
        name: String,
        uuid: String,
        displayName: String,
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        createdBy: String,
        createdDate: Date,
        rev: Number,
        lastModifiedBy: String,
        lastModifiedDate: Date,
        roles: [new Schema({
            name: String,
            uuid: String,
            displayName: String,
            description: String,
            createdBy: String,
            createdDate: Date,
            rev: Number,
            lastModifiedBy: String,
            lastModifiedDate: Date,
            authorizations: [{type: ObjectId, ref: 'endpoint'}]
        })],
        active: Boolean
    }),
    'vUsersWithRoles'
)

module.exports = {
    authUser: authUser,
    authSecret: authSecret,
    authRole: authRole,
    userRolesView: userRolesView
}