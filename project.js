const FS = require("fs");
const MONGOCLIENT = require("mongodb").MongoClient;
const util = require('util');

function readFile(fileAddress, _MongoURL, db_name, type, collection_name) {
    let t = type;
    let MongoURL = _MongoURL;
    console.log(MongoURL);
    console.log(db_name);
    FS.readFile(fileAddress, "utf8", function (err, data) {
        if (err)
            console.log(err);
        parseFile(data, t, MongoURL, db_name, collection_name)
    });
}

function parseFile(data, type, MongoURL, db_name, collection_name) {
    let header = [];
    let first = true;
    let open = false;
    let values = [];
    let word = "";
    let first_character = true;

    for (let i = 0; i < data.length; i++) {
        let character = data[i];
        if (character === '\n') {
            (first ? header : values).push(word);
            word = "";
            if (!first)
                createObject(values, header, type, MongoURL, db_name, collection_name);
            first = false;
            values.length = 0;
            open = false;


        } else if (character === "," && !open) {
            (first ? header : values).push(word);
            first_character = true;
            word = "";


        } else if (character === "\"" && open) {
            open = false;


        } else if (character === "\"" && !open && first_character) {
            open = true;
            first_character = false;


        } else {
            word = word + character;
        }
    }
}

function createObject(values, header, type, MongoURL, db_name, collection_name) {
    let mapVal2Obj = {
        "Priority": "Ep_priority",
        "Status": "Ep_status",
        "Duration": "Ep_scheduledDuration",
        "Is Milestone": "Ep_isMilestone",
        "Activity parent ID": "Ep_dependency",
        "Project Manager": "Ep_manager"
    };
    let mapVal2DateObj = {
        "Start date": "Ep_scheduledStartDate",
        "End date": "Ep_scheduledEndDate",
        "Project act. compl. date": "Ep_actualEndDate",
        "Activity act. compl. date": "Ep_actualEndDate"
    };
    let object = {};
    let id = "";
    let projectNum = "";
    if (type === "project") {
        for (let i = 0; i < header.length; i++) {
            if (header[i] === "Name") {
                id = values[i];
                if (["D-", "G-", "E-", "Z-"].includes(id.substring(0, 2)))
                    id = id.substring(0, id.indexOf(" "));

                object["Ep_projectName"] = values[i];

                // Map the "Priority", "Status", "Duration", and "Project Manager"
                // headers and values to their EP counterparts.
            } else if (Object.keys(mapVal2Obj).includes(header[i]))
                object[mapVal2Obj[header[i]]] = values[i];

            // Map the "Start date", "End date", and "Project act. compl. date" headers and values
            // to their EP counterparts, with blank checks.
            else if (Object.keys(mapVal2DateObj).includes(header[i]))
                object[mapVal2DateObj[header[i]]] =
                    (values[i] === "") ? (null) : (new Date(values[i]));

            else if (header[i] === "Customers")
                object["Ep_customers"] = values[i].split(",");

            if (i === (header.length - 1))
                upsert_project(object, id, MongoURL, db_name, collection_name);
        }
    } else if (type === "task") {
        for (let i = 0; i < header.length; i++) {
            if (header[i] === "Project name") {
                id = values[i];
                if (["D-", "G-", "E-", "Z-"].includes(id.substring(0, 2)))
                    id = id.substring(0, id.indexOf(" "));

            } else if (header[i] === "Name") {
                object["Ep_task_id"] = values[i].substring(0, values[i].indexOf(" "));
                if (isNaN(object["Ep_task_id"]))
                    object["Ep_task_id"] = values[i];
                object["Ep_taskDescription"] = values[i];

                // Map the "Is Milestone", "Status", "Duration", and "Activity parent ID" headers and values
                // to their EP counterparts.
            } else if (Object.keys(mapVal2Obj).includes(header[i]))
                object[mapVal2Obj[header[i]]] = values[i];

            // Map the "Start date", "End date", and "Actual act. compl. date" headers and values
            // to their EP counterparts, with blank checks.
            else if (Object.keys(mapVal2DateObj).includes(header[i]))
                object[mapVal2DateObj[header[i]]] =
                    (values[i] === "") ? (null) : (new Date(values[i]));

            else if (header[i] === "Assignees")
                object["Ep_assignees"] = values[i].split(",");
            
            else if(header[i] === "ID")
                object["Ep_taskNum"] = values[i];

            if (i === (header.length - 1)) {
                let upsert_success = false;
                while (!upsert_success) {
                    upsert_success = upsert_task(object, id, MongoURL, db_name, collection_name);
                }
            }
        }
    }
}

async function upsert_project(object, id, MongoURL, db_name, collection_name) {
    let document = object;
    let mongoClientPromise = MONGOCLIENT.connect(MongoURL, async function (err, client) {
        try{
            let db = client.db(db_name);
            await db.collection(collection_name).updateOne({"Ep_project_id": id}, {$set: document}, {upsert: true}, async function (err, result) {
                console.log(util.format("Updating project %s", id));
                try {
                    await client.close();
                } catch (e) {
                    console.log(e)
                }
            });
        }
        catch(e) {
            console.log("Something went wrong in Projects");
        }
    });
}

async function upsert_task(object, id, MongoURL, db_name, collection_name) {
    let document = object;
    let mongoClientPromise = MONGOCLIENT.connect(MongoURL, async function (err, client) {
        try {
            if (err) {
                try {
                    console.log("Couldn't connect, trying again for %s", id);
                } catch (e) {
                    console.log(e);
                }
                return false;
            } else {
                let db = client.db(db_name);
    
                await db.collection(collection_name).find({"Ep_project_id": id, "Ep_tasks.Ep_task_id": document.Ep_task_id}).toArray(
                    async function (err, results) {
                        
                        //console.log(util.format("Returned %d projects.", results.length));
                        if (results.length === 0) {
                            //console.log(util.format("%s doesnt exist %s", id, document.Ep_task_id));
                            await db.collection(collection_name).updateOne({"Ep_project_id": id}, {$addToSet: {"Ep_tasks": document}}, {upsert: true},
                                async function (err, result) {
                                    try {
                                        await client.close();
                                    } catch (e) {
                                        console.log(e)
                                    }
                                });
    
                        } else {
                            //console.log(util.format("%s exists %s", id, document.Ep_task_id));
                            await db.collection(collection_name).updateOne({
                                    "Ep_project_id": id,
                                    "Ep_tasks.Ep_task_id": document.Ep_task_id
                                }, {$set: {"Ep_tasks.$": document}}, {upsert: true},
                                async function (err, result) {
                                    try {
                                        await client.close();
                                    } catch (e) {
                                        console.log(e);
                                    }
                                });
                        }
                    });
                return true;
            }
        }
        catch (e) {
            console.log("Something went wrong in tasks")
        }
    });
}

module.exports = {
    readFile: readFile
};