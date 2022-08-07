const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const docProperties = require('./models/docProperties');
const datasetProperty = require('./models/properties');
const moment = require('moment');
const format = require('util').format;

var util = require('util');

var EPprojects = require('./project');   // EP Projects is run when API is run .. should be separate app

var name = {
    "Asset": {
        file: 'asset',
        route: 'assets',
        methods: ['GET', 'PUT']
    },
    "Data": {
        file: 'data',
        route: 'data',
        methods: ['GET']
    },
    "ContinuousData": {
        file: 'continuousdata',
        route: 'continuousdata',
        methods: ['GET', 'POST', 'PUT']
    },
    "SpectrumData": {
        file: 'spectrumdata',
        route: 'spectrumdata',
        methods: ['GET', 'POST', 'PUT']
    },
    "Dataset": {
        file: 'dataset',
        route: 'dataset',
        methods: ['GET']
    },
    "Equipment": {
        file: 'equipment',
        route: 'equipment',
        methods: []
    },
    "Job": {
        file: 'job',
        route: 'jobs',
        methods: ['GET']
    },
    "MaterialDef": {
        file: 'materialDef',
        route: 'materialDefinitions',
        methods: ['GET']
    },
    "Material": {
        file: 'material',
        route: 'materials',
        methods: []
    },
    "EquipmentSetup": {
        file: 'equipmentSetup',
        route: 'equipmentSetup',
        methods: ['GET', 'POST']
    },
    "EquipmentLog": {
        file: 'equipmentLog',
        route: 'equipmentLog',
        methods: ['GET', 'POST']
    },      
    "Order": {
        file: 'order',
        route: 'orders',
        methods: []
    },
    "Part": {
        file: 'part',
        route: 'parts',
        methods: ['GET', 'PUT','POST']
    },
    "Personnel": {
        file: 'personnel',
        route: 'personnel',
        methods: ['GET', 'PUT']
    },
    "Process": {
        file: 'process',
        route: 'process',
        methods: ['PUT'],
        // TODO if this name field is still in use, update this
        // (i.e. drop "Resource" substring)
        name: 'personnelResourceRequirements.type'
    },
    "Project": {
        file: 'project',
        route: 'projects',
        methods: ['GET', 'PUT']
    },
    "Toolwear": {
        file: 'toolwear',
        route: 'toolwear',
        methods: ['GET', 'PUT']
    },
    "Type": {
        file: 'type',
        route: 'types',
        methods: ['GET', 'PUT','POST'],
        name: 'types'
    },
    "Template": {
        file: 'template',
        route: 'templates',
        methods: ['GET', 'PUT']
    },
    "Measurement": {
        file: 'measurement',
        route: 'measurements',
        methods: ['GET', 'PUT']
    },
    "Dictionary": {
        file: 'dataDictionary',
        route: 'dictionary',
        methods: ['GET', 'PUT']
    },
    "Users": {
        file: 'users',
        route: 'users',
        methods: ['GET', 'PUT']
    },
    "EndPoints": {
        file: 'endpoint',
        methods: ['GET']
    },
    "Alarms": {
        file: 'alarm',
        route: 'alarms',
        methods: ['GET', 'PUT']
    },
    "TypeNew": {
        file: 'typeNew',
        route: 'typesNew',
        methods: ['GET', 'PUT'],
    },
    // "file": {
    //     file: 'file',
    //     route: 'files',
    //     methods: ['GET', 'POST', 'PUT'],
    // },
    "Property": {
        file: 'property',
        route: 'properties',
        methods: [],
    },
    "PropertySet": {
        file: 'propertySet',
        methods: []
    },
    "PersonnelDef": {
        file: 'definitions/personnelDef',
        route: 'definitions',
        methods: ['GET', 'PUT']
    },
    "DigitalAssetDef": {
        file: 'definitions/digitalAssetDef',
        route: 'definitions',
        methods: []
    },
    "MaterialDef": {
        file: 'definitions/materialDef',
        route: 'definitions',
        methods: []
    },      
    "PhysicalAssetDef": {
        file: 'definitions/physicalAssetDef',
        route: 'definitions',
        methods: []
    }, 
    "EquipmentDef": {
        file: 'definitions/equipmentDef',
        route: 'definitions',
        methods: ['GET', 'PUT']
    },
    "DigitalAsset": {
        file: 'digitalAsset.js',
        route: 'digitalAssets',
        methods: []
    },     
    "PhysicalAsset": {
        file: 'physicalAsset.js',
        route: 'physicalAssets',
        methods: []
    }
}
var model = new Object;
Object.keys(name).forEach(thisName => {
    model[thisName] = require('./models/' + name[thisName]['file']);
});



// https://stackoverflow.com/a/11187738
Number.prototype.pads = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = "0" + s;
    }
    return s;
}

Array.prototype.peek = function () {
    return this[this.length - 1];
}

/**
 * PARAMS:
 *      obj: The object that we're projecting.
 *      keyList: The list of keys we're either keeping or throwing away. See dropQ
 *      dropQ: If true, contents of keyList are excluded from returned object.
 *          Otherwise, keys NOT in keyList are excluded from returned object.
 *      verb: verbosity of execution; Logs output if v > 0
 */
function projectObject(obj, keyList, dropQ, verb) {

    if (!Boolean(obj)) return null;
    verb = Number(verb)
    var ret = new Object;

    console.log(`KeyList:${keyList}`);

    Object.keys(obj).forEach(key => {
        //console.log(`key:  ${key}`);

        if (dropQ ^ keyList.includes(key)) {
            ret[key] = obj[key];
            if (verb > 0) console.log("copying " + key);

        } else {
            if (verb > 0) console.log("skipping " + key);
        }
    });
    return ret;
}

// TODO generalize to print to arbitrary streams (e.x. files, stdout)
function reportMessage(err, code, neMsg, response) {
    if (err) {
        console.log(code);
        console.log(err);
        try {
            if (response) response.json({"code": code, "message": err.message}), response.status(500);
        } catch (e) {
            reportMessage(e,
                "E30: Tried sending error response. Was a response already send?");
            return {"error": code};
        }
    } else if (neMsg) console.log(neMsg);
    return;
}

// This is a separate function call at port 8080 to the Mongo DB to support Mongo collections
function connectMongoose(url, callback) {

    // option used under threat of deprecation warning
    mongoose.connect(url, {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: 5,
        reconnectInterval: 1000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 60000
    }).then(
        () => {
            console.log("Connected to ***->MongoDB at: " + url);
            callback();
        },
        err => {
            reportMessage(err, "E00: error on initial connection to MongoDB at " + url, null);
            console.log("url: " + url);
            setTimeout(connectMongoose, 5000, url, callback);
        }
    );

}

function updateProjectsAndTasks () {
    //Parse URL to get dbname for project.js code
    var urlMongo = new URL(process.env.MONGO_URL);
    var db = urlMongo.pathname.substr(1);
    //projects collection
    let colName = "projects";

    console.log("Mongo Url: %s", urlMongo.href);
    console.log("Database: %s", db);
  
    //project file parse
    EPprojects.readFile('./EpFiles/projects.csv', urlMongo.href, db, "project", colName);
    //task file parse
    EPprojects.readFile('./EpFiles/tasks.csv', urlMongo.href, db, "task", colName);
}

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(recipient, subject, text_body, html_body, sender = null) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'relay.ccam.ccam-va.com',
        port: 25,
        // secure: false, // true for 465, false for other ports
        // auth: {
        //     user: testAccount.user, // generated ethereal user
        //     pass: testAccount.pass // generated ethereal password
        // }
        tls: {
            rejectUnauthorized: false
        }
    });

    if (sender == null) sender = '"Travis Taylor" <travis.taylor@ccam-va.com>';

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: sender, // sender address
        to: recipient, // list of receivers
        subject: subject, // Subject line
        text: text_body, // plain text body
        html: html_body // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    return info.messageId;
}

// try {
//     sendMail().catch(function(error, info) {
//         if(error) console.log(error.toString());
//         else console.log(info.toString());
//     });
// } catch (e) {
//     console.log('There was an issue sending an email: ' + e.toString());
// }

async function getHeartBeats() {
    var pipeline = [
        {$match: {name: {'$in': [RegExp(/.*beat/)]}}},
        {$sort: {startTime: -1, _id: -1}},
        {$group: {_id: {distinctName: "$name"}, lastdataset: {$first: {lastData: "$lastData"}}}},
        {$lookup: {from: "data", localField: "lastdataset.lastData", foreignField: "_id", as: "dataDoc"}},
        {$unwind: "$dataDoc"},
        {$project: {_id: 0, Tagname: "$_id.distinctName", "LatestRecord": {$arrayElemAt: ["$dataDoc.values", -1]}}},
        {$sort: {"LatestRecord.time": -1}}]

    var foundData = (await model["Dataset"].aggregate(pipeline));
    return foundData;
}

async function getRecentTagData(tags) {
    var explist = [];
    for (var i = 0; i < tags.length; i++) {
        var reg = new RegExp(tags[i]);
        explist.push(reg);
    }

    var pipeline = [
        {$match: {name: {'$in': explist}}},
        {$sort: {startTime: -1, _id: -1}},
        {$group: {_id: {distinctName: "$name"}, lastdataset: {$first: {lastData: "$lastData"}}}},
        {$lookup: {from: "data", localField: "lastdataset.lastData", foreignField: "_id", as: "dataDoc"}},
        {$unwind: "$dataDoc"},
        {$project: {_id: 0, Tagname: "$_id.distinctName", "LatestRecord": {$arrayElemAt: ["$dataDoc.values", -1]}}},
        {$sort: {"LatestRecord.time": -1}}]

    var foundData = (await model["Dataset"].aggregate(pipeline));
    return foundData;
}

async function createDocProperties(userName) {

    //console.log(userName);
    let newProperties = docProperties.obj;

    let user = await model['Users']['authUser'].findOne({name: userName});

    if ((user === null) || (user === undefined)) {
        console.log(`user ${user}`);
        let api = await model['Users']['authUser'].findOne({name: 'api'});
        console.log(`api ${api}`);
        if (api !== null) {
            newProperties.createdBy.id = api._id;
            newProperties.createdBy.userName = api.uuid;
            newProperties.createdBy.displayName = api.displayName;

            newProperties.lastModifiedBy.id = api._id;
            newProperties.lastModifiedBy.userName = api.uuid;
            newProperties.lastModifiedBy.displayName = api.displayName;

        }

        newProperties.createdDate = new Date();
        newProperties.rev = 0;
        newProperties.lastRevDate = new Date();

    } else {
        console.log(`user ${user}`);
        newProperties.createdBy.id = user._id;
        newProperties.createdBy.userName = user.uuid;
        newProperties.createdBy.name = user.name;
        newProperties.createdBy.displayName = user.displayName;

        newProperties.createdDate = new Date();
        newProperties.rev = 0;
        newProperties.lastRevDate = new Date();

        newProperties.lastModifiedBy.id = user._id;
        newProperties.lastModifiedBy.userName = user.uuid;
        newProperties.lastModifiedBy.name = user.name;
        newProperties.lastModifiedBy.displayName = user.displayName;
    }
    //console.log("** Properties: "+ newProperties.createdBy.id + "** Date: " + newProperties.createdDate);

    return newProperties;
}

async function updateDocProperties(userUuid) {
    let user = await model['Users']['authUser'].findOne({name: userUuid});
    let updatedDocProperties;
    if ((user !== null) && (user !== undefined)) {
        updatedDocProperties={
            lastRevDate: new Date(),
            lastModifiedBy: {
                id: user._id,
                userName: user.uuid,
                displayName: user.displayName
            }
        };
    } else {
        let api = await model['Users']['authUser'].findOne({name: 'api'});
        updatedDocProperties = {
            lastRevDate: new Date(),
            // TODO: Fix this objectId
            lastModifiedBy: {
                id: api._id,
                userName: api.uuid,
                displayName: api.displayName
            }
        };
    }

    return updatedDocProperties;
}

function createDatasetProperty(_name, _value, _metaData) {
    var newProperty = new Object();
    newProperty.name = _name;
    newProperty.value = _value;
    newProperty.metaData = _metaData;
    return newProperty;
}

async function updateOrderStatus(orderuuid, requestedStatus, userRequest) {
    var order = await model["Order"].findOne({uuid: orderuuid});
    var status = order.status;
    var currentlyActive = false;
    var jobsComplete = 0;

    // *** GEL  findOne({_id: order.routing[routingStepIndex].job})  -- Eric has change to schema
    // **  was findOne({uuid: order.routing[routingStepIndex].job})  --it's now called 'jobId'  instead of "orders.uuid"
    
    for (var routingStepIndex = 0; routingStepIndex < order.routing.length; routingStepIndex++) {
        //var job = await model["Job"].findOne({uuid: order.routing[routingStepIndex].job})
        console.log(`ID: ${orderuuid, routingStepIndex} `);
        var job = await model["Job"].findOne({_id: order.routing[routingStepIndex].job})
        console.log(job);

        if (job.status == 'ACTIVE') {
            currentlyActive = true;
        } else if (job.status == "COMPLETE") {
            jobsComplete++;
        }
    }

    console.log("Number:")
    console.log(order.currentRoutingIndex);
    console.log(order.routing.length);

    if (order.status == 'COMPLETE' && userRequest && requestedStatus != 'COMPLETE') {
        await model["Order"].findOneAndUpdate({uuid: orderuuid}, {$set: {actualEnd: null}});
    }

    //console.log(requestedStatus == 'COMPLETE' && (userRequest || (jobsComplete == order.routing.length)));
    if (requestedStatus == 'NOT READY') {
        console.log("Hit Not Ready");
        status = 'NOT READY';
    } else if (requestedStatus == 'ACTIVE' || currentlyActive) {
        console.log("Hit Active");
        status = 'ACTIVE';
        if (order.actualStart == undefined)
            await model["Order"].findOneAndUpdate({uuid: orderuuid}, {$set: {actualStart: moment()}});
    } else if (requestedStatus == 'READY' && (userRequest || order.status != 'ACTIVE')) {
        console.log("Hit Ready");
        status = 'READY';
    } else if (requestedStatus == 'COMPLETE' && (userRequest || (jobsComplete == order.routing.length))) {
        console.log("Hit Complete");
        status = 'COMPLETE';
        await model["Order"].findOneAndUpdate({uuid: orderuuid}, {$set: {actualEnd: moment()}});
    }

    if (order.status != requestedStatus && requestedStatus == 'ACTIVE') {
        console.log("An ACTIVE job is running");
    }

    //var doc = await util.getModel()["Order"].findOneAndUpdate({uuid: orderuuid}, {$set: {status: status}});
    return status;
}

// This function takes an object for fields to update (usually passed as the body of a request), updates the fields
// in the specified collection name (not always the name of the collection; see the Mongoose model for the schema in question),
// and also updates the 'docProperties' for the document (increments the revision number, and sets the last modified by fields)
//
// See /customer/put/:id endpoint for a working example
async function updateDocument(mongooseModel, id, updatedFields, user, res) {
    let newDocProperties = await updateDocProperties(user);
    console.log(id);
    mongoose.model(mongooseModel).findById(id, (err, oldDoc) => {
        console.log(oldDoc);
        if (err) throw err;

        let updatedDocProperties = {...oldDoc.docProperties._doc, ...newDocProperties};
        updatedDocProperties.rev = updatedDocProperties.rev+1;
        let updates = Object.assign(updatedFields, {docProperties: updatedDocProperties});

        oldDoc.update({$set: updates}, (err) => {
            if (err) throw err;
        });

        oldDoc.increment();
        oldDoc.save(function () {
             mongoose.model(mongooseModel).findById(id, (err, newDoc) => {
                if (err) throw err;
                res.send(newDoc);
            })
        })
    });
}

// This function takes an object for fields to update (usually passed as the body of a request), updates the fields
// in the specified collection name (not always the name of the collection; see the Mongoose model for the schema in question),
// and also updates the 'docProperties' for the document (increments the revision number, and sets the last modified by fields)
//  The difference in this routine is that we want to save the update the new, but save the orginal doc as well
//
// See /customer/put/:id endpoint for a working example
// Note: err is not handled !!!
// Updated: We create a new document for the old
async function updateDocumentSaveOld(mongooseModel, id, updatedFields, user, res) {
    let newDocProperties = await updateDocProperties(user);
    console.log('id->'+id+'<-');

    // mongoose.model(mongooseModel).find({_id: id},{_id:0}, (err, ndoc) => {  //<-- project without id
    // let the {_id:0} - project no _id, *** Use findOne instead of find so you dont get an array
    mongoose.model(mongooseModel).findOne({_id: id},{_id:0}, (err, ndoc) => {
            if (err) {
                console.log('Finding Existing Doc Error->'+err);
            }
            else  {
                console.log('Save ndoc->'+ndoc+'<-');
            }
            
            //console.log('Create New Doc Instance');
            let Ndoc = mongoose.model(mongooseModel);
            let newdoc = new Ndoc(ndoc);
            newdoc.isCurrentVersion = false;
            newdoc.active = false;
            newdoc.isNew = true; //<--------------------IMPORTANT
          
            console.log('newdoc--->'+newdoc);
            newdoc.save(function(err,results) {
                if(err) console.log('err->'+err);
                else {
                    console.log('New Instance Created');
                }
            }) 
    });

    mongoose.model(mongooseModel).findById(id, (err, oldDoc) => {

        const curVersion = JSON.stringify(oldDoc.version);        // Get existing version from Doc
        const curUpdateVers = parseInt(oldDoc.version,10)+1;      // Increment version -- different from revision
        // console.log('curVersion->'+curVersion+'<-');
        // console.log('curUpdateVers->'+curUpdateVers+'<-');
        console.log(`Current Version: ${curVersion} Updated Version: ${curUpdateVers}`);

        updatedFields.version=JSON.stringify(curUpdateVers);    

        if (err) throw err;

        let updatedDocProperties = {...oldDoc.docProperties._doc, ...newDocProperties};
        updatedDocProperties.rev = updatedDocProperties.rev+1;
        let updates = Object.assign(updatedFields, {docProperties: updatedDocProperties});

        oldDoc.update({$set: updates}, (err) => {
            if (err) throw err;
        });

        oldDoc.increment();
        oldDoc.isCurrentVersion = true;
        oldDoc.active = true;

        oldDoc.save(function () {
            mongoose.model(mongooseModel).findById(id, (err, newDoc) => {
               if (err) throw err;
               res.send(newDoc);
           })
       })

    });
}

function unflattenNode(jso) {
    //var db = JSON.parse(jso);  -- originally we needed a JSON doc
    var db = jso;
    //console.log('jso--->'+JSON.stringify(db));

    //These lines create a list of ids so that parents can be found
    // .length is incrementing dynamiclly as id's are being added.
    ids={};
    db.children.forEach(function(value)
        {
        ids[value._id]=Object.keys(ids).length;
    })

    //This is the list of visited id objects, each being processed for children
    visited={};
    
    //The root will not be visited by the main loop
    //Thus, it must be added to the output object and visited list now
    out=JSON.parse(JSON.stringify(db));
    out.children=[];                    // only need first node - all children removed
    visited[out._id]=out;               // out._id --> "_id": "5d55bf7e5e85944cbc961d20", (Root)

    //Recursive function
    //jso represents the js object id
    function unflattener(jso){
       // keep from unecessary recursions, if we already process stop!
       if (jso in visited){
           //skips visited indices -- 
           return visited[jso];
       }
       // had not yet been processed or visited
       // parent array is jso used to reference the parent object
       else{
           //recursively calls the parent of id's your processing
           //adds the object to visited list
           visited[jso]=JSON.parse(JSON.stringify(db.children[ids[jso]]));
            
           //loops through multiple parents if child has more than one subTypeOf
           for (const child of db.children[ids[jso]].subTypeOf){
                if(child in ids || child == db._id) {
                    //recursively calls the parent
                    parent=unflattener(child);
                    //adds the object to its parent
                    parent["children"].push(visited[jso]);
                }
            }
            
           //makes the object ready to accept children
           visited[jso]["children"]=[];
            
           //return to caller
           return visited[jso];
       }
    }

    // Loop through all the list of id's we got from query
    for (i=0;i<db.children.length;i++){
       unflattener(db.children[i]._id);
    }

    // Return the embeded children document
    return out;
}

async function createJobID() {
    const prefix = "JOB-" + moment().format("YYYYMMDD");
    let count = await mongoose.model('job').countDocuments({'jobId': {'$regex': prefix}});
    let id = format("%s%s", prefix, (count + 1).pads(4));
    return id;
}


module.exports = {
    getName: () => {
        return name;
    },
    getModel: () => {
        return model;
    },
    getPrs: () => {
        return prs;
    },
    getEnergy: () => {
        return energy;
    },
    getHeartBeats: getHeartBeats,
    getRecentTagData: getRecentTagData,
    // TODO: Create mount point NOT in Mogab's home directory.
    getLinuxPrefix: () => {
        return "/home/CCAM/mogab.elleithy/mnt/";
    },
    getWindowsPrefix: () => {
        return "file://sanfiler01/";
    },
    getFilePath: (isNix) => {
        return (isNix ? "mgds1" : "MGDS1") + "/G-127/Working-Local/DATA/";
    },
    projectObject: projectObject,
    reportMessage: reportMessage,

    connectMongoose: connectMongoose,
    unflattenNode: unflattenNode,        // GEL add embeded doc support of children
    sendMail: async (recipient, subject, text_body, html_body = null, sender = null) => {
        let result = "";
        try {
            result = await sendMail(recipient, subject, text_body, html_body, sender).catch(function (error, info) {
                if (error) {
                    console.log(error.toString());
                    // result = error.toString();
                } else {
                    console.log(info.toString());
                    // result = info.toString();
                }
            });
        } catch (e) {
            console.log("Error sending email: " + e.toString());
            result = e.toString();
        }
        return result;
    },
    createDocProperties: (user) => {
        return createDocProperties(user);
    },
    updateDocProperties: (user) => {
        return updateDocProperties(user);
    },
    createDatasetProperty: (name, value, meta) => {
        return createDatasetProperty(name, value, meta);
    },

    updateOrderStatus: (orderuuid, requestedStatus, userRequest) => {
        return updateOrderStatus(orderuuid, requestedStatus, userRequest);
    },
    updateDocument: (mongooseModel, id, updatedFields, user, res) => {
        return updateDocument(mongooseModel, id, updatedFields, user, res);
    },
    updateDocumentSaveOld: (mongooseModel, id, updatedFields, user, res) => {
        return updateDocumentSaveOld(mongooseModel, id, updatedFields, user, res);
    },
    updateProjectsAndTasks: updateProjectsAndTasks,
    createJobID: createJobID
};
