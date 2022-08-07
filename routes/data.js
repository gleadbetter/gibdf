const express = require('express');
const router = express.Router();                          // Router required to direct paths
const util = require('../util');
const moment = require('moment');
const format = require('util').format;
var jwtPassport = require('../jwtPassport');
const {check, validationResult} = require('express-validator');

/**
 * @apiDefine DFHeader @apiVersion 0.1.0
 * @apiHeader (Digital Factory header) {String} Content-Type application/json
 * @apiHeader (Digital Factory header) {String} Authorization Users JWT token Ex.: JWT <token>
 * @apiHeaderExample {json} Header-example
 *  {
 *      "Content-Type" : "application/json",
 *      "Authorization": "JWT <token>",
 *  }
 *
 */

// get the latest data point in a dataset before a particular time.
// useful for when we're want the value(s) of slow-changing data.
async function getLastBefore(setName, lastTime) {
    try {
        var q = {"name": setName, 'startTime': {'$lte': lastTime.toDate()}};
        console.log("getLastBefore:", q);
        // find all the datasets that begin before our target time
        var _dataset = await util.getModel()["Dataset"].find(q);
        // get the latest dataset, assuming they're ordered by _id,
        // and _id sorting is chronological
        var dataset = _dataset.peek();
        var endData = await util.getModel()["Data"].findById(dataset.lastData);
        while (moment(endData.startTime).isAfter(lastTime))
            endData = await util.getModel()["Data"].findById(endData.previousData);

        // endData is now last data doc whose startTime is before target time.
        var beforeTime = endData.values.filter(
            e => moment(e.time).isSameOrBefore(lastTime));
        return beforeTime.peek();

    } catch (e) {
        util.reportMessage(e, format(
            "E28: error during find for last data of %s before %s.",
            setName, lastTime), null, null);
        return {'error': e};
    }
}

// given a dataset document, return the first data docuement
async function getFirstAfter(dataset, firstTime) {
    // console.log("getFirstAfter(%s, %s)", dataset._id, firstTime.format());
    try {
        if (dataset.length == 1) {
            // assuming this is the correct dataset, we have no other option
            return await util.getModel()["Data"].findById(dataset.firstData);
        }
        // determine which data document to begin stitching.
        // var q3 = { dataset: dataset._id,
        //   startTime: {'$lte': firstTime.toDate()} };
        /* Despite pl. data != datum (see below), I refuse datas
         * https://en.wiktionary.org/wiki/datum#English
         * https://en.wiktionary.org/wiki/data#English */
        // (await util.getModel()["Data"].collection.getIndexes({full: true})).forEach(index =>
        //   console.log('index:', index));
        //var q4 = {"dataset": dataset._id};
        // drop "values" field
        //var datum = await util.getModel()["Data"].find(q4).select('-values').sort('startTime');
        // console.log("returned: data.find(%s)...", JSON.stringify(q4));
        //var i = datum.findIndex(e => firstTime.isBefore(e.startTime));
        // try { console.log("datum.findIndex(...) => %s@%d", String(datum[i]._id), i); }
        // catch (e) { console.log("Unable to report on %d = datum.findIndex(...)", i); }
        /* switch (i) {
          case -1: var startData = datum.peek(); break;
          case 0: var startData = datum[0]; break;
          default: var startData = datum[i - 1]; break;
        } */
        // console.log("%s[%d]: %s", dataset._id, i, startData._id, startData.startTime);
        // (await util.getModel()["Data"].find(q3).sort({startTime: -1}))[0];
        // if (startData) console.log('pre-iter: ', startData._id);

        // assumes *Time parameters are moment objects.
        var dsQuery1 = {'dataset': dataset._id, 'startTime': {'$lte': firstTime.toDate()}};
        // endTime is unreliable. Aggregate to get the true last time.
        var pipeline = [
            {'$match': dsQuery1},
            {'$sort': {'startTime': -1, '_id': -1}},
            {'$limit': 1}
        ];


        /* try {
          startData = await util.getModel()["Data"].aggregate(pipeline);
        } catch (e) {
          console.log("[%d/%d] %s", i, datum.length, firstTime.format());
        } */
        // code from old iteration method, but shouldn't produce incorrect results.
        // EDIT: omission of the following code actually results in errors (during current correction),
        //   but pre/post iter _id's are rarely different. TODO investigate
        //startData.trueEndTime = moment(startData.values.peek().time);
        // console.log(/*startData.values,*/
        //   startData.values.peek(), startData.trueEndTime);
        // while (startData && firstTime.isAfter(startData.trueEndTime)) {
        //   startData = await util.getModel()["Data"].findById(startData.nextData);
        //   if (startData == null) break;
        //   startData.trueEndTime = moment(startData.values.peek().time);
        //   console.log(dataset.name, String(startData._id), startData.trueEndTime);
        //   // console.log(/*startData.values,*/
        //   //   startData.values.peek(), startData.trueEndTime);
        // }
        // if (startData) console.log('post-iter:', startData._id);
        var startDatum = await util.getModel()["Data"].aggregate(pipeline);

        // Grab the true end time of the last
        startDatum[0].trueEndTime = moment(startDatum[0].values.peek().time);

        return startDatum[0];
    } catch (e) {
        util.reportMessage(e, format(
            "E32: error during find for first data of %s after %s.",
            dataset.name, firstTime), null, null);
        return {'error': e};
    }
}

async function getDatasetsWithin(setName, startTime, endTime) {
    // console.log("getDatasetsWithin(%s, %s, %s)",
    //   setName, startTime.format(), endTime.format());
    try {
        // assumes *Time parameters are moment objects.
        var dsQuery1 = {'name': setName, 'startTime': {'$lte': startTime.toDate()}};
        var dsQuery2 = {'name': setName, 'startTime': {'$gt': startTime.toDate(), '$lte': endTime.toDate()}};

        var pipeline = [
            {'$match': dsQuery1},
            {'$sort': {'startTime': -1, '_id': -1}},
            {'$limit': 1}];

        var firstDataSet = (await util.getModel()["Dataset"].aggregate(pipeline));
        console.log(firstDataSet);

        pipeline = [
            {'$match': dsQuery2},
            {'$sort': {'startTime': 1, '_id': -1}}];

        var remDataSets = (await util.getModel()["Dataset"].aggregate(pipeline));
        console.log(remDataSets);

        return firstDataSet.concat(remDataSets);

    } catch (e) {
        util.reportMessage(e, format(
            "E31: error during find for dataset %s between %s and %s.",
            setName, startTime, endTime), null, null);
        return {'error': e};
    }
}

// given a dataset and upper and lower time limits,
// collect and return all data from those datasets within that time.
async function getDataWithin(dataset, startTime, endTime) {
    // console.log("getDataWithin(%s {%s, %s}\n, %s, %s)", dataset._id,
    //   moment(dataset.startTime).format(),
    //   moment(dataset.endTime).format(),
    //   startTime.format(), endTime.format());
    try {
        // determine which data document to begin stitching.
        // var startData = await util.getModel()["Data"].findById(dataset.firstData);
        var startData = await getFirstAfter(dataset, startTime);
        if (!startData || startData.error) {
            // startData became null/undefined/bad. report the error
            var ret = {
                'error': format("Reached null during iteration of %s:%s",
                    dataset._id.toString(), dataset.name)
            };
            console.log(ret);
            return ret;
        }
        // is this the ONLY data document we'll be needing?
        if (endTime.isSameOrBefore(startData.trueEndTime)) {
            // console.log("ASSERT: %s <= %s",
            //   endTime.format(), moment(startData.trueEndTime).format());
            console.log("Returning data from %s,\nTime: [%s, %s]",
                startData._id, moment(startData.startTime).format(),
                moment(startData.values.peek().time).format());
            return startData.values.slice(
                startData.values.findIndex(e => startTime.isSameOrBefore(e.time)),
                startData.values.findIndex(e => endTime.isBefore(e.time))
            );
        }
        // we know startData is truthy (i.e. neither undefined not null).
        var ret = startData.values.slice(
            // determine where in startData to begin stitching.
            startData.values.findIndex(e => startTime.isSameOrBefore(e.time)));

        // determine which data document will be the last in stitching
        var endData = await util.getModel()["Data"].findById(startData.nextData);
        var middle = 0;
        if (endData) {
            endData.trueEndTime = endData.values.peek().time;
            /*console.log("Discovered {data | [%s, %s]}",
              moment(endData.startTime).format(),
              moment(endData.trueEndTime).format());*/
            while (endTime.isAfter(endData.startTime)) {
                ret = ret.concat(endData.values.slice(
                    endData.values.findIndex(e => startTime.isSameOrBefore(e.time)),
                    endData.values.findIndex(e => endTime.isBefore(e.time))
                ));
                // console.log(JSON.stringify(process.memoryUsage()));
                if (endData.nextData == null) break;
                endData = await util.getModel()["Data"].findById(endData.nextData);
                middle += 1;
                // FIXME: what to do when endData is null?
                if (!endData) break;
                endData.trueEndTime = endData.values.peek().time;
                /* console.log("Discovered {data | [%s, %s]}",
                   moment(endData.startTime).format(),
                   moment(endData.trueEndTime).format());*/
            }
        }

        console.log(format("Found data (%d): [%s, %s, %s]",
            ret.length, startData._id,
            (middle > 0 ? format("..., (%d more), ...", middle) : ''),
            (endData ? endData._id : "(null)")
        ));
        return ret;
    } catch (e) {
        util.reportMessage(e, format(
            "E19: error during stitching data of %s/%s between %s and %s.",
            dataset.name, dataset._id, startTime, endTime), null, null);
        return {'error': e};
    }
}

// old not used?
async function stitch(setName, startTime, endTime) {
    try {
        var datasets = await getDatasetsWithin(setName, startTime, endTime);
        // console.log(dataset);
        if (datasets == undefined || datasets.length < 1) {
            var dsQuery1 = {'name': setName, 'startTime': {'$lte': endTime.toDate()}};
            var dsQuery2 = {'lastDataVal.time': {'$gte': startTime.toDate()}};
            var ret = {
                'error': "No dataset found matching the following query:",
                'query1': dsQuery1,
                'query2': dsQuery2
            };
            console.log("[r/data.js]\n", ret);
            return ret;
        }

        if (datasets.length == 1)
            return (await getDataWithin(datasets[0], startTime, endTime));
        var ret = [];
        for (var i = 0; i < datasets.length; i++) {
            if (i == 0) // First dataset we use start of search span
                ret = ret.concat(await getDataWithin(datasets[i], startTime, endTime));
            else	// Subsequent datasets we start at beginning of dataset
                ret = ret.concat(await getDataWithin(datasets[i], moment(datasets[i].startTime), endTime));
        }

        return ret;

    } catch (e) {
        util.reportMessage(e, format(
            "E18: error during stitching data of %s between %s and %s.",
            setName, startTime, endTime), null, null);
        return {'error': e};
    }
}

/**
 * @api {get} /data/before GET data before time
 * @apiDescription Get the last data point in a given dataset before a given time.
 * @apiName GetDataBefore
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiDeprecated
 *
 * @apiParam {String} name The name of the dataset we want data from
 * @apiParam {String} time The upper bound of the open interval before which we
 * want data.
 *
 * @apiSuccess {Object} value Single data value object before the requested
 * time. Includes timestamp, quality, and (scaled) value. Returned without
 * object wrapping.
 */
router.get('/before', jwtPassport.isAuthorized, async function (req, res, next) {
    console.log("Query:", req.query);
    try {
        var last = await getLastBefore(
            req.query.name, moment(req.query.time));
        // XXX: this just logs the error but still returns the erroneous object.
        if ('error' in last) console.log(last.error);
        res.json(last);
    } catch (e) {
        util.reportMessage(e, format(
            "E36: error during retrieval of last data of %s before %s.",
            req.query.name, req.query.time), null, res);
    }
});

/**
 * @api {get} /data/after GET data after time
 * @apiDescription Get the first data point in a given dataset after a given time.
 * @apiName GetDataAfter
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiDeprecated
 *
 * @apiParam {String} name The name of the dataset we want data from
 * @apiParam {String} time The lower bound of the open interval after which we
 * want data.
 *
 * @apiSuccess {Object} value Single data value object after the requested
 * time. Includes timestamp, quality, and (scaled) value. Returned without
 * object wrapping.
 */
router.get('/after', jwtPassport.isAuthorized, async function (req, res, next) {
    console.log("Query:", req.query);
    try {
        var ds = (await util.getModel()["Dataset"].findOne({
            name: req.query.name,
            startTime: {'$gte': moment(req.query.time)}
        }))[0];
        var last = await getFirstAfter(ds, moment(req.query.time));
        // XXX: this just logs the error but still returns the erroneous object.
        if ('error' in last) console.log(last.error);
        res.json(last);
    } catch (e) {
        util.reportMessage(e, format(
            "E36: error during retrieval of first data of %s after %s.",
            req.query.name, req.query.time), null, res);
    }
});

/**
 * @api {get} /data/stitch GET all data in a given dataset between start and end
 * @apiName GetDataStitch
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiDeprecated use now (#TimeSeriesData:GetTimeseriesData)
 *
 * @apiParam {String} name The name of the dataset we want data from
 * @apiParam {String} start The lower bound of the closed interval in which we
 * want data.
 * @apiParam {String} end The upper bound of the closed interval in which we
 * want data.
 *
 * @apiSuccess {Object[]} values Data value objects between the requested
 * times. Includes timestamp, quality, and (scaled) value. Returned without
 * object wrapping.
 */
router.get('/stitch', jwtPassport.isAuthorized, async function (req, res, next) {
    console.log("Query:", req.query);
    // console.log("Body:", req.body);
    try {
        var _stitch = await stitch(
            req.query.name, moment(req.query.start), moment(req.query.end));
        // XXX: this just logs the error but still returns the erroneous object.
        if ('error' in _stitch) console.log(_stitch.error);
        res.json(_stitch);
    } catch (e) {
        util.reportMessage(e, format(
            "E17: error during retrieval of stitched data of %s between %s and %s.",
            req.query.name, req.query.start, req.query.end), null, res);
    }
});


/**
 * @api {get} /data/tagdata GET data from multiple tags during a given time range.
 * @apiName GetTagData
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiDeprecated use now (#TimeSeriesData:GetTimeseriesData)
 *
 * @apiParam {Date} start The lower bound of the closed interval in which we
 * want data.
 * @apiParam {Date} end The upper bound of the closed interval in which we
 * want data.
 * @apiParam {Number} resolution The resolution of the data to be returned.
 * @apiParam {Number} qod Only data with this Quality of Data is allowed to be returned.
 * @apiParam {String[]} tags Array of tag names.
 *
 * @apiSuccess {Object[]} values Data value objects between the requested
 * times. Includes timestamp, quality, and (scaled) value.
 */
// For getting data by multiple tags
router.get('/tagdata', jwtPassport.isAuthorized, async function (req, res, next) {
    console.log("Query:", req.query);
    // console.log("Body:", req.body);
    try {
        //tags[], start, end, resolution, qod
        var tags = req.query.tags;
        console.log(tags.length);
        var taglist = [];
        for (var i = 0; i < tags.length; i++) {
            var reg = new RegExp(tags[i]);
            taglist.push(reg);
        }
        var strt = new Date(req.query.start);
        var end = new Date(req.query.end);
        var resolution = parseInt(req.query.resolution);
        var qodToInclude = parseInt(req.query.qod);

        var pipeline = [{
            $facet:
                {
                    "firstDataSets":
                        [{'$match': {'name': {'$in': taglist}, startTime: {'$lte': strt}}},
                            {$sort: {name: 1, startTime: -1, "_id": -1}},
                            {
                                $group: {
                                    _id: {dsName: "$name"},
                                    dsName: {$first: "$name"},
                                    dsId: {$first: "$_id"},
                                    dsStartTime: {$first: "$startTime"},
                                    dsEndTime: {$first: "$endTime"},
                                    dsFirstData: {$first: "$firstData"},
                                    dsLastData: {$first: "$lastData"},
                                    dsCount: {$first: "$count"},
                                    dsLength: {$first: "$length"},
                                    dsjobID: {$first: "$jobID"}
                                }
                            }
                        ],
                    "remDataSets":
                        [{'$match': {'name': {'$in': taglist}, startTime: {'$gt': strt, '$lte': end}}},
                            {
                                '$project': {
                                    dsName: "$name",
                                    dsId: "$_id", dsStartTime: "$startTime", dsEndTime: "$endTime",
                                    dsFirstData: "$firstData", dsLastData: "$lastData", dsUnits: "$units",
                                    dsType: "$type", dsSubtype: "$subType", dsCount: "$count",
                                    dsLength: "$length", dsEquipmentID: "$equipmentID", dsjobID: "$jobID"
                                }
                            }
                        ]
                }
        },
            {'$project': {allDataSets: {$concatArrays: ["$firstDataSets", "$remDataSets"]}}},
            {'$unwind': "$allDataSets"},
            {'$replaceRoot': {newRoot: "$allDataSets"}},
            {'$lookup': {from: "data", localField: "dsId", foreignField: "dataset", as: "dataDocs"}},
            {'$unwind': "$dataDocs"},
            {
                $project: {
                    _id: 0,
                    dsName: 1,
                    dsId: 1,
                    dsStartTime: 1,
                    dsEndTime: 1,
                    dsFirstData: 1,
                    dsLastData: 1,
                    dsCount: 1,
                    dsLength: 1,
                    dsjobID: 1,
                    "DataDocs": {
                        _id: "$dataDocs._id",
                        startTime: "$dataDocs.startTime",
                        endTime: "$dataDocs.endTime",
                        index: "$dataDocs.index",
                        previousData: "$dataDocs.previousData"
                    }
                }
            },
            {
                $facet:
                    {
                        "firstDataDoc":
                            [{$match: {"DataDocs.startTime": {$lt: strt}}},
                                {$sort: {"DataDocs.startTime": -1, "DataDocs._id": -1}},
                                {
                                    $group: {
                                        _id: "$dsName", dsName: {$first: "$dsName"},
                                        dsStartTime: {$first: "$dsStartTime"}, dsEndTime: {$last: "$dsEndTime"},
                                        dsFirstData: {$first: "$dsFirstData"}, dsLastData: {$last: "$dsLastData"},
                                        DataDocsArray: {$push: "$DataDocs"}
                                    }
                                },
                                {$addFields: {DataDocs: {$slice: ["$DataDocsArray", 1]}}},
                                {
                                    $project: {
                                        _id: 1,
                                        dsName: 1,
                                        dsStartTime: 1,
                                        dsEndTime: 1,
                                        dsFirstData: 1,
                                        dsLastData: 1,
                                        DataDocs: 1
                                    }
                                }
                            ],
                        "remDataDocs":
                            [{$match: {"DataDocs.startTime": {$gte: strt, $lte: end}}},
                                {$sort: {"DataDocs.startTime": 1, "DataDocs._id": 1}},
                                {
                                    $group: {
                                        _id: "$dsName", dsName: {$first: "$dsName"},
                                        dsStartTime: {$first: "$dsStartTime"}, dsEndTime: {$last: "$dsEndTime"},
                                        dsFirstData: {$first: "$dsFirstData"}, dsLastData: {$last: "$dsLastData"},
                                        DataDocs: {$push: "$DataDocs"}
                                    }
                                }
                            ]
                    }
            },
            {'$project': {dsName: 1, allDataDocs: {$concatArrays: ["$firstDataDoc", "$remDataDocs"]}}},
            {'$unwind': "$allDataDocs"},
            {'$unwind': "$allDataDocs.DataDocs"},
            {'$project': {"_id": 0, "tag": "$allDataDocs.dsName", "ddId": "$allDataDocs.DataDocs._id"}},
            {'$lookup': {from: "data", localField: "ddId", foreignField: "_id", as: "allValues"}},
            {'$unwind': "$allValues"},
            {
                $project:
                    {
                        "_id": 0, tag: 1, values: {
                            $filter: {
                                input: "$allValues.values", as: "valueObject",
                                cond: {
                                    $and: [{$gte: ["$$valueObject.time", strt]},
                                        {$lte: ["$$valueObject.time", end]},
                                        {$gte: ["$$valueObject.qod", qodToInclude]}]
                                }
                            }
                        }
                    }
            },
            {$unwind: "$values"},
            {
                $project: {
                    "time": {
                        "$subtract":
                            [
                                {"$subtract": ["$values.time", new Date("1970-01-01")]},
                                {
                                    "$mod": [
                                        {"$subtract": ["$values.time", new Date("1970-01-01")]},
                                        resolution
                                    ]
                                }
                            ]
                    }, "tag": 1, "value": "$values.value", "qod": "$values.qod"
                }
            },
            {
                $group: {
                    _id:
                        "$time", "time": {$addToSet: {"k": "time", "v": {"$add": [new Date("1970-01-01"), "$time"]}}},
                    "items": {$push: {"k": "$tag", "v": "$value",}}
                }
            },
            {'$project': {readings: {$arrayToObject: {$concatArrays: ["$time", "$items"]}}}},
            {$replaceRoot: {newRoot: "$readings"}},
            {$sort: {"time": 1, "_id": 1}}];


        var foundData = (await util.getModel()["Dataset"].aggregate(pipeline).allowDiskUse(true));
        res.json(foundData);
    } catch (e) {
        util.reportMessage(e, format(
            "E53: Error during retrieval of data by tag(s) between %s and %s.",
            req.query.start, req.query.end), null, res);
    }
});


/**
 * @api {get} /data/recent GET recent data for all tags or by a reg exp.
 * @apiName GetDataRecent
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {String[]} [filter] An array of Regular Expressions to filter the recent data.
 * @apiSuccess {Object[]} data Returns an array of objects for each tag with the tag name and the latest record.
 */
router.get('/recent', jwtPassport.isAuthorized, async function (req, res, next) {
    //console.log("Query:", req.query);
    // console.log("Body:", req.body);
    try {
        //var filter = new RegExp(req.query.filter || '');
        //RegExp(/^CAM-TS/)
        var exp = (req.query.filter || ['']);
        console.log(exp.length);
        var explist = [];
        for (var i = 0; i < exp.length; i++) {
            var reg = new RegExp(exp[i]);
            explist.push(reg);
        }

        var pipeline = [
            {$match: {name: {'$in': explist}}},
            {$sort: {startTime: -1, _id: -1}},
            {$group: {_id: {distinctName: "$name"}, lastdataset: {$first: {lastData: "$lastData"}}}},
            {$lookup: {from: "data", localField: "lastdataset.lastData", foreignField: "_id", as: "dataDoc"}},
            {$unwind: "$dataDoc"},
            {$project: {_id: 0, Tagname: "$_id.distinctName", "LatestRecord": {$arrayElemAt: ["$dataDoc.values", -1]}}},
            {$sort: {"LatestRecord.time": -1}}];

        var foundData = (await util.getModel()["Dataset"].aggregate(pipeline));
        res.json(foundData);
        //res.json({message: "Coming soon!"})
    } catch (e) {
        util.reportMessage(e, format(
            "E54: Error during retrieval of most recent data points for tags.",
            null), null, res);
    }
});

// holds datasets being used for time series data (it is an object for quick lookup).
// Its keys are tagIds, and each key's value is an object with the following fields:
// tagId (somewhat redundant)
// dataset_id - reference to open dataset
// tagName - tag's name
// datasource - tag's data source

activeDatasets = {};
let currentDay = new Date().getUTCDay();
checkDay();

function newDay() {// <---------- UNTESTED
    return new Promise((resolve, reject) => {
        if (currentDay == new Date().getUTCDay())
            return resolve(false);
        else {
            currentDay = new Date().getUTCDay();
            return resolve(true);
        }
    })
}

async function checkDay() {// <---------- UNTESTED
    if (await newDay()) {
        for (let activeDataset in activeDatasets) {
            restartActiveDataset(activeDataset);
        }
    }
    setTimeout(checkDay, 1000);
}

async function restartActiveDataset(activeDataset) {// <---------- UNTESTED
    let datasetDocument = await util.getModel()["Dataset"].findById(activeDataset["dataset_id"]);
    await closeDataset(datasetDocument);
    createNewDataset(activeDataset, null);
}


/**
 * @api {post} /data/timeseriesdata POST data to timeseries tags
 * @apiName PostTimeseriesData
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {String} name Name of tag
 * @apiParam {ObjectId} dataSourceID Datasource ID
 * @apiParam {Array} [data] Data array of objects with time, value keys
 *
 * @apiParamExample Usage Example
 *  {
 *      "tagName": "cam-ts-01:Avantes01.spectrometerTime",
 *      "primaryDataSourceId": "5de3a1929d305c0fa5dc4cfd",
 *      "data": {
 *          "time": "2019-11-17T12:40:06.4826558Z",
 *          "value": 42
 *      }
 *  }
 *
 * @apiSuccess {Object} Including a message and the tag ID which can be used for a subsequent PUT
 */

    // router.post("/timeseriesdata", [
    //     check('tagName').isString().exists(), 
    //     check('primaryDataSourceId').isString().exists()
    // ],  async (req, res) => {
        router.post("/timeseriesdata", [
            check('tagName').isString().exists(), 
            check('primaryDataSourceId').isString().exists()
        ], jwtPassport.isAuthorized, async (req, res) => {
    try{
      var err = validationResult(req);
      if(!err.isEmpty())
        throw new Error(JSON.stringify(err.mapped()));

     
      let tagName = req.body.tagName;
      let dataSourceID = req.body.primaryDataSourceId;
      let data = req.body.data;
      console.log(req.body);
      console.log("recieved request");

      // tagName and dataSourceID are mandatory fields
      if (tagName === undefined) {
        console.log("Someone attempted to create a new dataset without passing tagName");
        return res.end(JSON.stringify({ "status": "error", "reason": "'tagName' must be defined" }));
      }
      if (dataSourceID === undefined) {
        console.log("Someone attempted to create a new dataset without passing dataSourceID");
        return res.end(JSON.stringify({ "status": "error", "reason": "'dataSourceID' must be defined" }));
      }

      //look for tag+source combination in the API stored array
      console.log("checking memory in API stored array");
      var datasetMetadata = await checkMemory(tagName, dataSourceID);
      // not currently in memory from the previous POST?
      if (datasetMetadata === null) {
        console.log("not in memory, checking db");

        await checkDB(tagName, dataSourceID)
            .then(function(result){ 
                if(result == null)  {
                    throw new Error("No valid tagName");
                }
                datasetMetadata = result;
                })
            .catch( (error) => {
                console.error("Error: " + error);
                res.status(400).json({ error: 'Invalid TagName' }); 
                //throw new Error("Error: " + error);
                });

        // tagName and dataSourceID are mandatory fields
        if (tagName === undefined) {
            console.log("Someone attempted to create a new dataset without passing tagName");
            return res.end(JSON.stringify({"status": "error", "reason": "'tagName' must be defined"}));
        }
        if (dataSourceID === undefined) {
            console.log("Someone attempted to create a new dataset without passing dataSourceID");
            return res.end(JSON.stringify({"status": "error", "reason": "'dataSourceID' must be defined"}));
        }

        // Tag info does exist now 
        // look for tag+source combination
        console.log("checking memory since we have tag+source");
        var datasetMetadata = await checkMemory(tagName, dataSourceID);
        if (datasetMetadata === null) {
            console.log("Metadata not in memory, checking db");

            await checkDB(tagName, dataSourceID).then(function (result) {
                datasetMetadata = result;
            });

            if (datasetMetadata === null) { // the tag+source combination does not exist.
                console.log("Metadata not in db");
                console.log("Someone attempted to create a new dataset for '%s' + '%s' and it did not exist", tagName, dataSourceID);
                return res.end(JSON.stringify({
                    "status": "error",
                    "reason": "tag + source combination does not exist"
                }));
            }

            //look for tag+source combination
            console.log("checking memory for tagName and dataSource");
            datasetMetadata = await checkMemory(tagName, dataSourceID);
            if (datasetMetadata === null) {
                console.log("tagname not in memory, checking db");
                await checkDB(tagName, dataSourceID).then(function (result) {
                    datasetMetadata = result;
                });
                console.log("Metadata:"+datasetMetadata);
                if (datasetMetadata === null) { // the tag+source combination does not exist.
                    console.log("tag+source not in db");
                    console.log("Someone attempted to create a new dataset for '%s' + '%s' and it did not exist", tagName, dataSourceID);
                    return res.end(JSON.stringify({
                        "status": "error",
                        "reason": "tag + source combination does not exist"
                    }));
                } else {//combination exists in the db
                    //cache the dataset for better performance
                    activeDatasets[datasetMetadata["tagId"]] = datasetMetadata;
                    await cleanPreviousDatasets(datasetMetadata); //add endtime to each open datasets of the tag
                    await createNewDataset(datasetMetadata, req.userId);      //create new dataset and save _id to datasetMetadata
                    if (data !== undefined) { //add data to the dataset if data is defined.
                        console.log("there is data");
                        await addData(data, datasetMetadata); // add data to set
                        return res.end(JSON.stringify({"status": "good", "tagId": datasetMetadata["tagId"]}));
                    }
                    return res.end(JSON.stringify({"status": "good", "tagId": datasetMetadata["tagId"]}));
                }
            } else {//combination already exists in memory
                await cleanPreviousDatasets(datasetMetadata); //add endtime to each open datasets of the tag
                await createNewDataset(datasetMetadata, req.userId); //create new dataset and save _id to datasetMetadata
                if (data !== undefined) { //add data to the dataset if data is defined.
                    console.log("Combination exists in memory ... there is data");
                    await addData(data, datasetMetadata); // add data to set
                    return res.end(JSON.stringify({"status": "good", "tagId": datasetMetadata["tagId"]}));
                }
                return res.end(JSON.stringify({"status": "good", "tagId": datasetMetadata["tagId"]}));
            }
        // Dont think the below gets executed
        return res.end(JSON.stringify({ "status": "good", "tagId": datasetMetadata["tagId"] }));
        }
    }
    return res.end(JSON.stringify({ "status": "good", "tagId": datasetMetadata["tagId"] }));
  }catch (err) {
        util.reportMessage(err, "E09: error during POST Timeseries data");
    } 
});

/*
* @api {post} /data/timeseriesdatabulk POST data to timeseries with MULTIPLE tags and data
* @apiName PostTimeseriesData
* @apiGroup TimeSeriesData
* @apiUse DFHeader
* @apiVersion 0.1.0
* @apiParam {String} name Name of tag
* @apiParam {ObjectId} dataSourceID Datasource ID
* @apiParam {Array} [data] Data array of objects with time, value keys

 The bulk insert is mainly to address the need for a driver payload of multiple tags.
   (see below)
{
  "tags": [
    {
      "tagName": "CAM-TS-01:AccuraSpray_velocity",
      "primaryDataSourceId": "5c8fa23abd566c37c0a7bf0c",
      "data": [
        {
          "time": "2019-11-17T12:40:06.4826558Z",
          "value": 42
        },
        {
          "time": "2019-11-17T12:41:06.4826558Z",
          "value": 43
        },
        {
          "time": "2019-11-17T12:42:06.4826558Z",
          "value": 44
        },
        {
          "time": "2019-11-17T12:43:06.4826558Z",
          "value": 45
        }
      ]
    },
    {
      "tagName": "CAM-TS-01:AccuraSpray_temperature",
      "primaryDataSourceId": "5c8fa23abd566c37c0a7bf0c",
      "data": [
        {
          "time": "2019-11-17T12:40:06.4826558Z",
          "value": 46
        },
        {
          "time": "2019-11-17T12:41:06.4826558Z",
          "value": 47
        },
        {
          "time": "2019-11-17T12:42:06.4826558Z",
          "value": 48
        },
        {
          "time": "2019-11-17T12:43:06.4826558Z",
          "value": 49
        }
      ]
    }
  ]
}
    // Endopoint /timeseriesdatabulk
    // Purpose: -- Allow multiple data tags/point to be sent in bulk
    //   The old enpoint /timeseriesdata required a POST with the tagname && primaryDataSourceId followed by a PUT of datapoints
    //     ** note ** there appears to me to be a bug if the POST has multiple data points
    //   The new endpoint will not require put, but possible could still be used
    //   Part of the bulk process will be evaluated, but it appears Mongoose is already bulking the data points.
    //
    // The Data payload shown below
    // Validate payload has an array of tags/data points  ** Crucial **
    // Create another loop for each Tag and Data -- as done in the old API -- this is a separate loop
    //   -- loop for the array of tags to validate we are searching for tags that exist note: queries against vTagsWithSources() -
    // Similar to the old - look for data docs, API memory (previous POSTS), create or updated Docs based on required data points
    // Parse out the Tag and datasetID to feed to similar old code functionality
    //  ** Note the old code has issues with the POST adding data values -- may have to fix -- or make like the PUT
    //  May  have to return bad Tags or data points not updated?. . . . .
    //  ?? What do we do if we fail on a tag? -- suggest error code partial -- return failed tag -- not sure on cleanup
    //  ?? What do we do for drivers creating new TAGS? We assume all tags have been configured.
  }
*/
//router.post("/timeseriesdatabulk", [check('tags').exists()], async (req, res) => {
router.post("/timeseriesdatabulk", jwtPassport.isAuthorized, [check('tags').exists()], async (req, res) => {
    
    var err = validationResult(req);
       if(!err.isEmpty())
         throw new Error(JSON.stringify(err.mapped()));

    console.log("Request - Show Tags---")
    var data = req.body.tags;
    console.log("tag len %d:",data.length);
    console.log(data);

    // loop and check if tag names and dataSourcID exist
    for (var i=0; i<data.length; i++){
        var tagName = data[i].tagName;
        var primaryDataSourceId = data[i].primaryDataSourceId;
        console.log("tag:"+tagName+" pid:"+primaryDataSourceId);

      // tagName and dataSourceID are mandatory fields
      if (tagName === undefined) {
        console.log("Someone attempted to create a new dataset without passing tagName");
        return res.end(JSON.stringify({ "status": "error", "reason": "'tagName' must be defined" }));
      }
      if (primaryDataSourceId === undefined) {
        console.log("Someone attempted to create a new dataset without passing dataSourceID");
        return res.end(JSON.stringify({ "status": "error", "reason": "'primaryDataSourceId' must be defined" }));
      }
    }

    // print out array of data points
    // for(var i=0; i<data.length; i++) { 
    //         console.log(data[i]);
    // }

    // loop and check tag names and dataSourcID are in the cache or db
      for (var i=0; i<data.length; i++){
        var tagName = data[i].tagName;
        var primaryDataSourceId = data[i].primaryDataSourceId;
        console.log("Checking tag:"+tagName+" pid:"+primaryDataSourceId);

        // wait for the array of results
        let isFalse = await Promise.all([
            checkValidTagAndPidinAPIorDB(tagName, primaryDataSourceId),
        ]);

        //var isFalse =checkValidTagAndPidinAPIorDB(tagName, primaryDataSourceId);
        console.log(isFalse);
        if(isFalse === true) {
            return res.end(JSON.stringify({ "status": "error", "reason": "tag + source combination does not exist" }));
        }
      }

      //If we have not returned by this point, we have tags to add
      for (var i=0; i<data.length; i++){
        var tagName = data[i].tagName;
        var primaryDataSourceId = data[i].primaryDataSourceId;
        console.log("Adding tag:"+tagName+" pid:"+primaryDataSourceId);

        // wait for the array of results
        let isFalse = await Promise.all([
            addTagAndPid(tagName, primaryDataSourceId, data[i].data, req),
        ]);
        if(isFalse) {
            console.log("Adding Tag STATUS: Good");
        }
        else {
            console.log("Adding Tag STATUS: Bad");
        }
      }

      return res.end(JSON.stringify({ "status": "good", "tagId":"simpleTest' done" }));
    
});

//search through memory for an active dataset containing the specified tagName and dataSource
async function checkValidTagAndPidinAPIorDB(tagName, primaryDataSourceId) {

  try {

    //look for tag+source combination in the API stored array
    console.log("checking api cache");
    var datasetMetadata = await checkMemory(tagName, primaryDataSourceId);

    // not currently in memory from the previous POST?
    if (datasetMetadata === null) {
        console.log("not in cache, checking db");

        await checkDB(tagName, primaryDataSourceId).then(function(result){
            datasetMetadata = result;
        });
        // check the db
        if (datasetMetadata === null) { // the tag+source combination does not exist.
            console.log("not in db");
            console.log("Someone attempted to create a new dataset for '%s' + '%s' and it did not exist", tagName, primaryDataSourceId);
            return true;
            //return res.end(JSON.stringify({ "status": "error", "reason": "tag + source combination does not exist" }));
        }
    }
  } catch(err){
      console.log("Error in tag verify:"+err);
    return true;
  }
return false;
}

//at this point tags exist and they are in the db or cache
async function addTagAndPid(tagName, primaryDataSourceId, data, req) {
    try {
        // Tag info does exist now 
        // look for tag+source combination
        console.log("checking cache ... ");
        datasetMetadata = await checkMemory(tagName, primaryDataSourceId);

        if (datasetMetadata === null) {
            console.log("not in cache..., checking db")
            await checkDB(tagName, primaryDataSourceId).then(function(result){
                datasetMetadata = result;
            });
            console.log(datasetMetadata);

            if (datasetMetadata === null) { // the tag+source combination does not exist.
                console.log("not in db");
                console.log("Someone attempted to create a new dataset for '%s' + '%s' and it did not exist", tagName, primaryDataSourceId);
                return true;
                //return res.end(JSON.stringify({ "status": "error", "reason": "tag + source combination does not exist" }));
            }
            else {//combination exists in the db
                //cache the dataset for better performance
                activeDatasets[datasetMetadata["tagId"]] = datasetMetadata;
                await cleanPreviousDatasets(datasetMetadata); //add endtime to each open datasets of the tag
                await createNewDataset(datasetMetadata, req.userId);      //create new dataset and save _id to datasetMetadata
                if (data !== undefined) {                     //add data to the dataset if data is defined.
                    console.log("Db has tag, there is data")
                    await addData(data, datasetMetadata);     // add data to set
                    return false;
                    //return res.end(JSON.stringify({ "status": "good", "tagId": datasetMetadata["tagId"] }));
                }
                return false;
                //return res.end(JSON.stringify({ "status": "good", "tagId": datasetMetadata["tagId"] }));
            }
        }
        else {//combination already exists in memory
            await cleanPreviousDatasets(datasetMetadata);        //add endtime to each open datasets of the tag
            await createNewDataset(datasetMetadata, req.userId); //create new dataset and save _id to datasetMetadata
            if (data !== undefined) {                            //add data to the dataset if data is defined.
                console.log("there is data");
                await addData(data, datasetMetadata); // add data to set
                console.log("***Data added****")
                return false;
                //return res.end(JSON.stringify({ "status": "good", "tagId": datasetMetadata["tagId"] }));
            }
        return false;
        //return res.end(JSON.stringify({ "status": "good", "tagId": datasetMetadata["tagId"] }));
        }
      }
    catch(err) {
        console.log("Add Tag/Pid Error:"+err);
        return true;
    }

}

/**
 * @api {put} /data/timeseriesdata/:id PUT data to timeseries tags
 * @apiName PutTimeseriesData
 * @apiGroup TimeSeriesData
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {ObjectId} :id ObjectId of the Tag as returned in the POST for timeseries data. Notice this is NOT the datset ID
 * @apiParam {Array} data Data array of objects with time, value keys
 * @apiParamExample Usage Example
 *  {
 *      "data": {
 *          "time": "2019-11-17T12:40:06.4826558Z",
 *          "value": 42
 *      }
 *  }
 *
 *   id = Is the tagname you get from the POST
 * @apiSuccess {Object} value Single data value object after the requested
 */
router.put("/timeseriesdata/:id", jwtPassport.isAuthorized, async (req, res) => {
    let tagId = req.params.id;
    let data = req.body.data;

    if (data === undefined)
        return res.end(JSON.stringify({"status": "bad", "reason": "data is a required body parameter"}));

    else if (tagId === undefined)
        return res.end(JSON.stringify({"status": "bad", "reason": "tagId is a required URL parameter"}));

    else if (activeDatasets[tagId] === undefined)
        return res.end(JSON.stringify({"status": "bad", "reason": "no active set for " + tagId}));
    else {
        await addData(data, activeDatasets[tagId]);
        return res.end(JSON.stringify({"status": "good", "tagId": tagId}));
    }
});

/**
 * @api {get} /data/timeseriesdata GET data for timeseries tags
 * @apiName GetTimeseriesData
 * @apiGroup Timeseries data
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {ObjectId} :id ObjectId of the Tag as returned in the POST for timeseries data. Notice this is NOT the datset ID
 * @apiParam {Array} data Data array of objects with time, value keys
 * @apiParamExample Usage Example
 *      curl -i http://baseURL/api/v0.1.0/data/timeseriesdata?start=2019-11-10T13:00:00.000Z&end=2019-11-12T17:00:00.000Z&tags[]=CAM-TS-01:MultiCoat.J1_TT_01&tags[]=CAM-TS-01:MultiCoat.J1_TT_02&resolution=1&qod=192
 * @apiParamExample Usage Example
 *  {
 *      "data": {
 *          "time": "2019-11-17T12:40:06.4826558Z",
 *          "value": 42
 *      }
 *  }
 *
 * @apiSuccess {Object} value Single data value object after the requested
 */
//router.get('/timeseriesdata', jwtPassport.isAuthorized, async function (req, res, next) {
router.get('/timeseriesdata', async function (req, res, next) {
    console.log("Query:", req.query);

    //console.log("Body:", req.body);
    try {
        var url = req.originalUrl;
        console.log(decodeURI(url));

        var tags = req.query.tags;
        console.log(tags.length);
        var taglist = [];

        // disabled wild cards for now. eventually do a look up on all tags caught
        // and their data dictionary equivalents
        for (var i = 0; i < tags.length; i++) {
            //var reg = new RegExp(tags[i]);
            //taglist.push(reg);
            taglist.push(tags[i]);
            console.log(tags[i])
        }
        let foundData;
        let conditionMap = [];
        await Promise.all(
            taglist.map(async (element) => {
                let dataDictionary = await util.getModel()["Dictionary"]["tagDocument"].findOne({"name": element});
                conditionMap.push([element, dataDictionary.displayName]);
            })
        );

        if (req.query.job === undefined) {
            var strt = new Date(req.query.start);
            var end = new Date(req.query.end);
            var resolution = parseInt(req.query.resolution);
            var qodToInclude = parseInt(req.query.qod);
            // format query search
            if (req.query.conditions != undefined) {
                let conditions = await getConditions(req.query.conditions);
                let matches = await buildmatch(conditions, conditionMap);
                let aggQuery = await buildAggQuery(taglist, strt, end, resolution, qodToInclude, matches);
                foundData = (await util.getModel()["Dataset"].aggregate(aggQuery).allowDiskUse(true));
            } else {
                let aggQuery = await buildAggQuery(taglist, strt, end, resolution, qodToInclude, null);
                foundData = (await util.getModel()["Dataset"].aggregate(aggQuery).allowDiskUse(true));
            }
            console.log("start: " + strt.toISOString());
            console.log("end: " + end.toISOString())
        } else {
            //var strt = new Date(req.query.start);
            //var end = new Date(req.query.end);
            let job = await util.getModel()["Job"].findById(req.query.job);
            let strt = job.actualStart;
            let end = job.actualEnd;
            var resolution = parseInt(req.query.resolution);
            var qodToInclude = parseInt(req.query.qod);
            // format query search
            if (req.query.conditions != undefined) {
                let conditions = await getConditions(req.query.conditions);
                let matches = await buildmatch(conditions, conditionMap);
                let aggQuery = await buildAggQuery(taglist, strt, end, resolution, qodToInclude, matches);
                foundData = (await util.getModel()["Dataset"].aggregate(aggQuery).allowDiskUse(true));
            } else {
                let aggQuery = await buildAggQuery(taglist, strt, end, resolution, qodToInclude, null);
                foundData = (await util.getModel()["Dataset"].aggregate(aggQuery).allowDiskUse(true));
            }
        }
        foundData = await JSON.stringify(foundData);
        console.log(conditionMap);

        await asyncForEach(conditionMap, (async (element) => {
            await console.log(" 0 " + await foundData.substring(0, 200));
            foundData = await foundData.split("\"" + element[1] + "\"");
            foundData = await foundData.join("\"" + element[0] + "\"");
            await console.log(" 1 " + await foundData.substring(0, 200))
        }));
        console.log("time");
        foundData = await JSON.parse(foundData);
        res.json(foundData);

        //res.json(foundData);
        //res.json({message: "It worked!!"})
    } catch (e) {
        util.reportMessage(e, format(
            "E55: Error during retrieval of time series data.",
            null), null, res);
    }
});


//search through memory for an active dataset containing the specified tagName and dataSource
async function checkMemory(tagName, dataSource) {
    return new Promise(async (resolve, reject) => {
        //save copy of keys in case of a modification.
        let activeDatasetsKeys = Object.keys(activeDatasets);
        let count = activeDatasetsKeys.length;

        console.log("checking %d active datasets", count);
        if (count === 0)
            return resolve(null);

        //iterate over active datasets to find matchig tagName and dataSource
        for (i = 0; i < count; i++) {
            let key = activeDatasetsKeys[i];
            if (activeDatasets[key]["tagName"] == tagName && activeDatasets[key]["dataSource"] == dataSource)
               {
                console.log("Get active datasets: ", activeDatasets[key]["tagName"]);       
                return resolve(activeDatasets[key]);
               }
            if (i == count - 1)//if the last key is not the tagName+dataSource, return null
                {
                console.log("No  active datasets: ");       
                return resolve(null);
                }
        }
    });
}

//check the view containing data tags with sources for an instance of the tagName and dataSourceID  combination
async function checkDB(tagName, dataSource) {
    return new Promise(async (resolve, reject) => {
        let result = await util.getModel()["Dictionary"]["tagView"].findOne({
            $or: [
                {"altDataSourceId.uuid": dataSource},
                {"dataSource.uuid": dataSource},
                {"primaryDataSourceId": dataSource}
            ],
            name: tagName
        });
        if (result == null)
            return resolve(null);
        else {
            return resolve({
                tagId: result._id,
                tagName: tagName,
                dataSource: dataSource
            });
        }
    });
}

//close datasets of the same tagName/tagId where endTime is null.
//datasets are marked malformed if the api server cant close it.
async function cleanPreviousDatasets(datasetMetadata) {
    return new Promise(async (resolve, reject) => {
        let openDatasets = await util.getModel()["Dataset"].find({
            endTime: null,
            isMalformed: {"$exists": false},
            "$or": [
                {
                    dataTagID: datasetMetadata.tagId
                },
                {
                    name: datasetMetadata.tagName //deprecated. included for backwards compatibility
                }
            ]
        });
        console.log("found %d open datasets", openDatasets.length);
        promises = [];
        for (let dataset of openDatasets) {
            promises.push(closeDataset(dataset));
        }
        await Promise.all(promises);
        return resolve(null)
    });
}

//sets end time to start time if the length is 0, otherwise, the last value in the last document's time stamp.
async function closeDataset(dataset) {
    return new Promise(async (resolve, reject) => {
        //this if satement doesnt work. the condition triggers, but the save doesnt occur.
        if (dataset["startTime"] === null || dataset["startTime"] === undefined) {
            dataset["isMalformed"] = 1;
            await dataset.save();
            return resolve(true);
        } else {
            if (dataset.length == 0) {//a length of 0 indicates a dataset that was never fully initialized
                dataset.endTime = dataset.startTime;
                await dataset.save();
                return resolve(true); // success
            } else {
                if (dataset.lastData == null) {//this should never happen. documents are in the set, but there isnt a pointer to the last document.
                    dataset["isMalformed"] = 1;
                    await dataset.save();
                    console.log("error closing dataset with _id " + dataset["_id"]);
                    return resolve(false);
                } else {//set the endTime fo the dataset to the endTime of the last data document's last point.
                    let dataDoc = await util.getModel()["Data"].findById(dataset["lastData"]);
                    dataset["endTime"] = dataDoc["values"][dataDoc["valueCount"] - 1]["time"];
                    await dataset.save();
                    return resolve(true);
                }
            }
        }
    })
}

//creates a new dataset for a tag.  userId
async function createNewDataset(datasetMetadata, userId ) {
    return new Promise(async (resolve, reject) => {
        let newDatasetDocument = new (util.getModel()["Dataset"])({
            startTime: await getStartTime(datasetMetadata),
            endTime: null,
            firstData: null,
            lastData: null,
            name: datasetMetadata["tagName"], // deprecated
            dataTagID: datasetMetadata["tagId"],
            count: 1000,
            length: 0,
            jobId: null,
            docProperties: await util.createDocProperties(userId)
        })
        await newDatasetDocument.save();
        datasetMetadata["dataset_id"] = newDatasetDocument["_id"];
        return resolve(true);
    });
}

//find the start time between the greater of the current time on the system and the end time of the most recent dataset.
async function getStartTime(datasetMetadata) {
    return new Promise(async (resolve, reject) => {
        let currentDatetime = new Date();
        let greatestDataset = await util.getModel()["Dataset"].find({$or: [{"name": datasetMetadata["tagName"]}, {"dataTagID": datasetMetadata["tagId"]}]}, null, {
            sort: {endTime: -1},
            limit: 1
        });
        console.log(greatestDataset);
        if (greatestDataset == null || greatestDataset == undefined) {
            return resolve(currentDatetime);
        } else {
            if (greatestDataset["endTime"] == null || currentDatetime > greatestDataset["endTime"])
                return resolve(currentDatetime);
            else
                return resolve(greatestDataset["endTime"])
        }
    })
}

//boolean return for if the parameter is an object.
isObject = function (a) {
    return (!!a) && (a.constructor === Object);
};

// -- comes from put with numberious data records
// -- or the POST with data values in a tag
// {
// 	"data":[    
//       {"time": "2020-11-17T12:52:06.4826558Z", "value": 14},    
//       {"time": "2020-11-17T12:53:06.4826558Z", "value": 15},
//       {"time": "2020-11-17T12:54:06.4826558Z", "value": 16}        
//     ]  
	
// }
async function addData(data, datasetMetadata) {
    return new Promise(async (resolve, reject) => {
        //console.log("Adding DATA -->"+data)
        if (Array.isArray(data)) {
            //console.log("Data is array passed")
            await parseData(data, datasetMetadata);
            return resolve(true);
        }
        else if (isObject(data)) {//object
            console.log("Data is object passed")
            console.log([data])
            await parseData([data], datasetMetadata);  
            return resolve(true);
        }
        else{
            console.log("Error Data is primitive, exit")
            return resolve(false);
        }
    });
}

// data will be the data point in the POST
async function parseData(data, datasetMetadata) {
    return new Promise(async (resolve, reject) => {
        //console.log("ParseData: %d",data.length);
        let count = data.length;
        let modifiedDocuments = [];
        let dataDoc = {};     // json object of data

        // See if the dataset collection exists
        // The datadoc holds a reference to the first and last documents in the data collection
        // Use the schema to test dataset id value
        let dataset = await util.getModel()["Dataset"].findById(datasetMetadata["dataset_id"]);

        // ObjectId of the (data?) document containing the last datapoint
        // There is really no reason lastData should be null unless there is some type of anomily? or a new document is created
        // but don't query if there are no documents existing ... not sure why we don't return with an error?
        // if you don't make this test --> UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'save' of null
        if (dataset["lastData"] != null) {
            // Get the created document
            dataDoc = await util.getModel()["Data"].findById(dataset["lastData"]);
            //console.log("Should have data doc, get and push to modify:");
            modifiedDocuments.push(dataDoc);
        }
  
        // push document into an array
        // console.log("Dataset :>"+dataset);
        modifiedDocuments.push(dataset);

        // Mongoose will do data.updateOne for multiple data points with .save()
        // Note: appendData is called to check the limits and need for documents
        // count: is the number of datapoints either with the POST or PUT - the put will have multiple data points
        for (let idx = 0; idx < count; idx++) {
            //console.log("idx:%d count:%d",idx,count);

            // // wait for the array of results -- does not do much here, but seemed like a good idea
            // let isFalse = await Promise.all([
            //     dataDoc = await appendData(data[idx], dataset, dataDoc),
            // ]);
            dataDoc = await appendData(data[idx], dataset, dataDoc);

            // for the last datapoint (we are done) save all associated data values but only for data doc
            if ((count>1 && (idx == count-1)) ||  (idx==count-1)  ) {
                //console.log("Insert Values count:%d idx:%d",count-1,idx);

                // we only come here for the saving to the data document 
                await dataDoc.save()
                return resolve(true);
            }
            else {
                //console.log("Skipping Final save:%d",count);
            }
        }
    })
}

// dataset may be created, or updated, or not modified at all - only the 
async function appendData(dataPoint, dataset, dataDoc) {
    return new Promise(async (resolve, reject) => {
        // validate if no values set? - required fields - should normally be there
        if(dataPoint["time"] === null || dataPoint["time"] === undefined)
            dataPoint["time"] = new Date();
        if (dataPoint["qod"] === null || dataPoint["qod"] === undefined)
            dataPoint["qod"] = 192;

        // No  data document? - create one
        if (dataset["length"] == 0) {
            // Create document
            //console.log("create DATA doc");
            dataDoc = await insertDataDocument(dataset["_id"], 0, null);
            // updated the data doc with new values
            dataDoc["values"].push({time:dataPoint["time"], value:dataPoint["value"], qod:dataPoint["qod"]});
            dataDoc["startTime"] = dataPoint["time"];
            dataDoc["endTime"] = dataPoint["time"];
            dataDoc["valueCount"] = dataDoc["valueCount"] + 1;

            // Dont put a datapoint in with a less time the alread exists
            if (dataPoint["time"] < dataset["startTime"])
                dataset["startTime"] = dataPoint["time"];

            dataset["firstData"] = dataDoc["_id"];
            dataset["lastData"] = dataDoc["_id"];
            dataset["length"] = dataset["length"] + 1;

            console.log("**Save data & dataset document**");
            await dataDoc.save();
            await dataset.save();
            return resolve(dataDoc);
        }
        // Is the data document at max?
        else {
            // we think this is the check for 1000 - as the dataset[count] should be intialized 
            if (dataDoc["valueCount"] == dataset["count"]) {
                // New document to add
                newDataDoc = await insertDataDocument(dataset["_id"], dataDoc["index"] + 1, dataDoc["_id"]);
                newDataDoc["values"].push(dataPoint);
                newDataDoc["startTime"] = dataPoint["time"];
                newDataDoc["endTime"] = dataPoint["time"];
                newDataDoc["valueCount"] = newDataDoc["valueCount"] + 1;

                // update old document to link to this new document
                dataDoc["nextData"] = newDataDoc["_id"];
                dataset["lastData"] = newDataDoc["_id"];
                dataset["length"] = dataset["length"] + 1;

                //console.log("Save all new & old data & dataset document");
                await newDataDoc.save();
                await dataDoc.save();
                await dataset.save();
                return resolve(newDataDoc);
            }
            // This is the case when we just got data points but have no need to update data document today
            else {
                //console.log("Datapoint added");
                dataDoc["values"].push({time:dataPoint["time"], value:dataPoint["value"], qod:dataPoint["qod"]});
                dataDoc["valueCount"] = dataDoc["valueCount"] + 1;
                dataDoc["endTime"] = dataPoint["time"];
                //await dataDoc.save();                       // TEST *** Works!! but adds points one at a time
                return resolve(dataDoc);
            }
        }
    })
}
// Create a new data doc
async function insertDataDocument(dataset_id, index, previousDataPointer) {
    return new Promise(async (resolve, reject) => {
        let newDataDocument = new (util.getModel()["Data"])({
            previousData: previousDataPointer,
            startTime: null,
            endTime: null,
            dataset: dataset_id,
            values: [],
            valueCount: 0,
            count: 1000,
            index: index,
            nextData: null,
        });
        await newDataDocument.save();
        return resolve(newDataDocument);
    })
}

async function buildmatch(conditions, conditionMap) {
    let matches = [];
    await Promise.all(
        conditions.map(async (element) => {
            let characteristics = await getStats(element, conditionMap);
            if (characteristics.op == ">") {
                await matches.push({"$match": {[characteristics.tag]: {"$gt": characteristics.val}}})
            } else if (characteristics.op == "<") {
                await matches.push({"$match": {[characteristics.tag]: {"$lt": characteristics.val}}})
            } else if (characteristics.op == ">=") {
                await matches.push({"$match": {[characteristics.tag]: {"$gte": characteristics.val}}})
            } else if (characteristics.op == "<=") {
                await matches.push({"$match": {[characteristics.tag]: {"$lte": characteristics.val}}})
            } else if (characteristics.op == "!") {
                await matches.push({"$match": {[characteristics.tag]: {"$ne": characteristics.val}}})
            } else if (characteristics.op == "=") {
                await matches.push({"$match": {[characteristics.tag]: {"$eq": characteristics.val}}})
            }
        })
    );
    return matches;
}

async function getStats(condition, conditionMap) {
    let characteristics = {};
    let word = "";
    let foundOp = false;
    let closedOp = false;
    for (char in condition) {
        if (!closedOp && foundOp && !(condition[char] == "<" || condition[char] == ">" || condition[char] == "=" || condition[char] == "!")) {
            console.log(word);
            console.log(condition[char]);
            characteristics.op = word;
            word = "";
            closedOp = true;
        }
        if (!foundOp && (condition[char] == "<" || condition[char] == ">" || condition[char] == "=" || condition[char] == "!")) {
            let dataDictionary = await util.getModel()["Dictionary"]["tagDocument"].findOne({uuid: word});
            conditionMap.push([word, dataDictionary.displayName]);
            characteristics.tag = dataDictionary.displayName;
            console.log(characteristics.tag);

            foundOp = true;
            word = ""
        }
        word += condition[char];
    }

    if (parseFloat(word) != NaN)
        characteristics.val = parseFloat(word);
    else
        characteristics.val = word;
    return characteristics;

}

async function getConditions(rawConditions, conditionTagRaw, conditionTagFriendly) {
    if (rawConditions == undefined)
        return null;
    stringConditions = [];
    stringCondition = "";
    for (char in rawConditions) {
        if (rawConditions[char] == ";") {
            await stringConditions.push(stringCondition);
            stringCondition = "";
            continue;
        }
        stringCondition += rawConditions[char]
    }
    if (stringCondition != "")
        stringConditions.push(stringCondition);
    return stringConditions;
}

async function buildAggQuery(taglist, strt, end, resolution, qodToInclude, matches) {
    var agg = [
        {
            $facet:
                {
                    "firstDataSets":
                        [{'$match': {'name': {'$in': taglist}, startTime: {'$lte': strt}}},
                            {$sort: {name: 1, startTime: -1, "_id": -1}},
                            {
                                $group: {
                                    _id: {dsName: "$name"},
                                    dsName: {$first: "$name"},
                                    dsId: {$first: "$_id"},
                                    dsStartTime: {$first: "$startTime"},
                                    dsEndTime: {$first: "$endTime"},
                                    dsFirstData: {$first: "$firstData"},
                                    dsLastData: {$first: "$lastData"},
                                    dsCount: {$first: "$count"},
                                    dsLength: {$first: "$length"},
                                    dsjobID: {$first: "$jobID"}
                                }
                            }
                        ],
                    "remDataSets":
                        [{'$match': {'name': {'$in': taglist}, startTime: {'$gt': strt, '$lte': end}}},
                            {
                                '$project': {
                                    dsName: "$name",
                                    dsId: "$_id", dsStartTime: "$startTime", dsEndTime: "$endTime",
                                    dsFirstData: "$firstData", dsLastData: "$lastData", dsUnits: "$units",
                                    dsType: "$type", dsSubtype: "$subType", dsCount: "$count",
                                    dsLength: "$length", dsEquipmentID: "$equipmentID", dsjobID: "$jobID"
                                }
                            }
                        ]
                }
        },
        {'$project': {allDataSets: {$concatArrays: ["$firstDataSets", "$remDataSets"]}}},
        {'$unwind': "$allDataSets"},
        {'$replaceRoot': {newRoot: "$allDataSets"}},
		{$lookup: {from: "dataDictionary", localField: "dsName", foreignField: "name", as: "displayDocs"}},
        {$unwind: "$displayDocs"},
        {'$lookup': {from: "data", localField: "dsId", foreignField: "dataset", as: "dataDocs"}},
        {'$unwind': "$dataDocs"},
        {
            $project: {
                _id: 0,
                dsName: 1,
                dsId: 1,
                dsStartTime: 1,
                dsEndTime: 1,
                dsFirstData: 1,
                dsLastData: 1,
                dsCount: 1,
                dsLength: 1,
                dsjobID: 1,
				"displayDocs.displayName": 1,
                "DataDocs": {
                    _id: "$dataDocs._id",
                    startTime: "$dataDocs.startTime",
                    endTime: "$dataDocs.endTime",
                    index: "$dataDocs.index",
                    previousData: "$dataDocs.previousData"
                }
            }
        },
        {
            $facet:
                {
                    "firstDataDoc":
                        [{$match: {"DataDocs.startTime": {$lt: strt}}},
                            {$sort: {"DataDocs.startTime": -1, "DataDocs._id": -1}},
                            {
                                $group: {
                                    _id: "$dsName", dsName: {$first: "$dsName"},
                                    dsStartTime: {$first: "$dsStartTime"}, dsEndTime: {$last: "$dsEndTime"},
                                    dsFirstData: {$first: "$dsFirstData"}, dsLastData: {$last: "$dsLastData"},
									"displayName": {$first: "$displayDocs.displayName"},
                                    DataDocsArray: {$push: "$DataDocs"}
                                }
                            },
                            {$addFields: {DataDocs: {$slice: ["$DataDocsArray", 1]}}},
                            {
                                $project: {
                                    _id: 1,
                                    dsName: 1,
                                    dsStartTime: 1,
                                    dsEndTime: 1,
                                    dsFirstData: 1,
                                    dsLastData: 1,
									displayName: 1,
                                    DataDocs: 1
                                }
                            }
                        ],
                    "remDataDocs":
                        [{$match: {"DataDocs.startTime": {$gte: strt, $lte: end}}},
                            {$sort: {"DataDocs.startTime": 1, "DataDocs._id": 1}},
                            {
                                $group: {
                                    _id: "$dsName", dsName: {$first: "$dsName"},
                                    dsStartTime: {$first: "$dsStartTime"}, dsEndTime: {$last: "$dsEndTime"},
                                    dsFirstData: {$first: "$dsFirstData"}, dsLastData: {$last: "$dsLastData"},
									"displayName": {$first: "$displayDocs.displayName"},
                                    DataDocs: {$push: "$DataDocs"}
                                }
                            }
                        ]
                }
        },
        {'$project': {dsName: 1, displayName:1, allDataDocs: {$concatArrays: ["$firstDataDoc", "$remDataDocs"]}}},
        {'$unwind': "$allDataDocs"},
        {'$unwind': "$allDataDocs.DataDocs"},
        {'$project': {"_id": 0, "tag": "$allDataDocs.dsName", "displayName": "$allDataDocs.displayName", "ddId": "$allDataDocs.DataDocs._id"}},
        {'$lookup': {from: "data", localField: "ddId", foreignField: "_id", as: "allValues"}},
        {'$unwind': "$allValues"},
        {
            $project:
                {
                    "_id": 0, tag: 1, displayName:1, values: {
                        $filter: {
                            input: "$allValues.values", as: "valueObject",
                            cond: {
                                $and: [{$gte: ["$$valueObject.time", strt]},
                                    {$lte: ["$$valueObject.time", end]},
                                    {$gte: ["$$valueObject.qod", qodToInclude]}]
                            }
                        }
                    }
                }
        },
        {$unwind: "$values"},
        {
            $project: {
                "time": {
                    "$subtract":
                        [
                            {"$subtract": ["$values.time", new Date("1970-01-01")]},
                            {
                                "$mod": [
                                    {"$subtract": ["$values.time", new Date("1970-01-01")]},
                                    resolution
                                ]
                            }
                        ]
                }, "tag": 1, displayName: 1, "value": "$values.value", "qod": "$values.qod"
            }
        },
        {
            $group: {
                _id:
                    "$time", "time": {$addToSet: {"k": "time", "v": {"$add": [new Date("1970-01-01"), "$time"]}}},
                "items": {$addToSet: {"k": "$displayName", "v": "$value"}}
            }
        },
        {'$project': {readings: {$arrayToObject: {$concatArrays: ["$time", "$items"]}}}},
        {$replaceRoot: {newRoot: "$readings"}},
        {$sort: {"time": 1, "_id": 1}}
    ];

    if (matches != null && matches != undefined)
        matches.forEach(async (element) => {
            await agg.push(element);
        });
    return agg;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    router: router,
    stitch: stitch,
    getLastBefore: getLastBefore
};
