const express = require('express');
const router = express.Router();
const util = require('../util');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
var jwtPassport = require('../jwtPassport');
const format = require('util').format;

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


/**
 * @api {get} /dictionary/all GET all dictionary documents 
 * @apiName GetAllDict
 * @apiGroup Dictionary
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiSuccess {Object[]} documents Returns all the dictionary documents.

*/ 
router.get('/all', jwtPassport.isAuthorized, async function (req, res, next) {
    try {
      var foundData = await util.getModel()["Dictionary"]["sourceDocument"].find({"active": true});
      res.json(foundData);
    } catch (e) {
      if(res.status != 401) {
        util.reportMessage(e, format(
          "E54: Error during retrieval of most recent data points for tags.",
          null), null, res);
      }
    }
  });

/**
 * @api {post} /dictionary/dataSource POST datasource documents.
 * @apiName PostDatasource
 * @apiGroup Dictionary
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {String} name Unique name for datasource
 * @apiParam {ObjectId} equipmentName Name to the equipment
 * @apiParam {Stirng} displayName Friendly name of datasource
 * @apiParamExample
 * body
 *
 */
router.post('/dataSource',  [check('name').isString().exists()], jwtPassport.isAuthorized, async function (req, res, next) {
  
  console.log(`dataSource name: ${req.body.equipmentName}`);
  try{
        var err = validationResult(req);
        if(!err.isEmpty())
            throw new Error(JSON.stringify(err.mapped()));
   
      // Should handle the user/short term token here or in the endpoint call
        var newDataSource = await (new (util.getModel()["Dictionary"]["sourceDocument"])(util.projectObject(req.body, [], true, 1)));

        newDataSource._id = new mongoose.mongo.ObjectId();
        newDataSource.dictionaryType = "dataSource";
        
        // // Check equipment info
        // var equipDoc = await util.getModel()["Equipment"]["Equipment"].findOne({ name: req.body.equipmentName });
        // if(equipDoc == undefined)
        //     throw new Error("Could not find equipment by Name");
        // var equipResource = {};

        // equipResource.id = equipDoc._id;
        // equipResource.name = equipDoc.name;
        // equipResource.name = equipDoc.component;   # Issue 63
        // newDataSource.equipmentResource = equipResource;

        var savedDs = await newDataSource.save();
        var pRes = await util.getModel()["Dictionary"]["sourceDocument"].findById(savedDs._id);
        // This is where the long term token should be handed back
        res.json(pRes);
  } catch(e){
    util.reportMessage(e, "E72: error during POST to DataDictionary collection with a data source.", null, res);
  }
})



/**
 * @api {get} /dictionary/dataSource GET datasources 
 * @apiName GetDatasources
 * @apiGroup Dictionary
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {String} [name] Name of datasource, if not provided all datasources will be returned.
 * @apiSuccess {Object} Returns object of found datasource.
 */
router.get('/dataSource', jwtPassport.isAuthorized, async function (req, res, next) {
  console.log(`dataSource name: ${req.query.name}`)
    try {
        if(req.query.name == undefined){          
            var foundData = await util.getModel()["Dictionary"]["sourceDocument"].find({dictionaryType: "dataSource", active: true});
            console.log(`dataSource (no name) foundData: ${foundData}`)
            res.json(foundData);
        }else{
            //let temp = await mongoose.model('equipment').find('query' in req ? req.query : {}).select({ "name": 1, "displayName": 1, "_id": 0});
            //let foundData = await mongoose.model('sourceDocument').find('query' in req ? req.query : {}).select({ "name": 1, "displayName": 1, "dictionaryType": 1, "_id": 0});
            // var foundData = await util.getModel()["Dictionary"]["sourceDocument"].findOne({dictionaryType: "dataSource", name: req.query.name, active: true}, 
            // function(err, doc){

            //   console.log(`dataSource (name) foundData: ${foundData}`)

            //   if(err || !foundData) {
            //       return next(`error finding name:`+err);
            //     }
            //   if(doc)
            //         res.json(doc);
            //     else return;
            // });

            let foundData = await mongoose.model('sourceDocument')
            .find('query' in req ? req.query : {})
            .select({ "name": 1, "displayName": 1, "dictionaryType": 1, "_id": 0});

            console.log(`dataSource foundData: ${foundData}`)

            if( foundData !=null) {
              res.json(foundData); }
            else  { return res.status(404).json({ err: 'Find error' });
              }
              
            }
    } catch (e) {
        util.reportMessage(e, format(
            "E54: Error during retrieval of most recent data points for tags.",
            null), null, res);
    }
});

/**
 * @api {get} /dictionary/dataTag GET filter datatags
 * @apiName GetAllDataTags
 * @apiGroup Dictionary
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParam {String} [name] Filter datatag for name, if not supplied all tags will be returned.
 * @apiParam {String} [dataType] Filter datatags for certain data types {timeseries, spectrum, continuous, ...}
 * @apiSuccess {Object} Returns all tagnames as array of objects.
 */
router.get('/dataTag', jwtPassport.isAuthorized, async function (req, res, next) {
    try {
       
        var query = {};
        query["dictionaryType"] = "tagname";
        for(var key in req.query){
            req.query[key] !== "" ? query[key] = req.query[key] : null;
        }
        query.active = true;
        // var foundData = await util.getModel()["Dictionary"]["tagDocument"].find(query);
        // Help front per Eric 1/29/2021
        var foundData = await util.getModel()["Dictionary"]["tagDocument"]
          .find(query).sort({"equipmentResource.name":1, "equipmentResource.component":1, "displayName":1});        
        res.json(foundData);
        return;
    } catch (e) {
      util.reportMessage(e, format(
        "E54: Error during retrieval of tags names.",
        null), null, res);
    }

  });


/**
 * @api {post} /dictionary/dataTag POST datatag document.
 * @apiName PostDatatagDocument
 * @apiDescription Single creation of data or do bulk insert and wrap it in an array with name 'tags'.
 * @apiGroup Dictionary
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiParamExample body
  * {   
  *     "name": "cam-ts-01:Avantes01.spectrometer",
  *     "primaryDataSourceId": "5dccc8fe3480220105cda9bd",
  *     "dictionaryType": "tagname",
  *     "displayName": "Spectrometer Data",
  *     "units": "eV",
  *     "dataType": "Number",
  *     "dataTagType": "spectrum",
  *     "interpolationType": "linear",
  *     "scale": { "addFactor": 0, "multiplyFactor": 1 },
  *     "equipmentName": "Avantes01"
  * }
 */
//router.post('/dataTag', [check('name').isString().exists(), check('primaryDataSourceId').isString().exists(), check('equipmentName').isString().exists()], jwtPassport.isAuthorized, async function (req, res, next) {
router.post('/dataTag',  jwtPassport.isAuthorized, async function (req, res, next) {
    //var tagsLen = req.body.tags.length();
    // Should handle the user/short term token here or in the endpoint call
    var savedDocuments = [];
    try{
        // If tags are not used, the this code would execute
        if(req.body.tags === undefined) {
            console.log("No Body Tags");
            console.log(`Equipment Resource componet: ${req.body.component}`);  // Issue #63  ** not typical 

            // Find datasource document
            await util.getModel()["Dictionary"]["sourceDocument"].countDocuments({_id: req.body.primaryDataSourceId}, async function(err, count){
                 
                if(err || count > 0){
                  console.log(`err ${err} cnt:${cnt}`)

                    var equipDoc = await (util.getModel()["Equipment"]["Equipment"].findOne({ name: req.body.equipmentName }));
                    if(equipDoc === null) {
                        throw new Error("Could not find Equipment");
                    }
                    else  {

                      // The utility below is used to project values ... obsolete .. 
                      // but for now, skip equipment .. not in schema, but we need it for search
                      // var saveDoc = await (new (util.getModel()["Dictionary"]["tagDocument"])(util.projectObject(req.body, ["equipmentName"], true, 1)));
                      var saveDoc = await (new (util.getModel()["Dictionary"]["tagDocument"])(util.projectObject(req.body, ["equipmentResource"], false, 1)));          
                      var equipResource = {};
                      equipResource.id = equipDoc._id;
                      equipResource.name = equipDoc.name;
                      equipResource.component = req.body.component;   // Add for Isues #63   ** not typical       
                      saveDoc.equipmentResource = equipResource;
                      console.log("*** EquipResource Doc: %O", equipResource);
        
                      try{
                          await saveDoc.save();
                      }catch(e){
                          throw new Error("DataTag Save Error: " + e + "Name:" +saveDoc.name);
                      }

                      var foundDoc = await util.getModel()["Dictionary"]["tagDocument"].findById(saveDoc._id);
                      savedDocuments.push(foundDoc);
                      res.json(saveDoc);
                      return;
                  }
                }
                else {
                    res.json({error: "E75: Provided data source id is not found in the collection."})
                    return;
                }
            });

        }else{
            // This part of the loop handles multiple tags ... loop through each ...
              req.body.tags.forEach(async function(tag)   {

              if(tag.primaryDataSourceId != null && tag.primaryDataSourceId != undefined)
              {
                await util.getModel()["Dictionary"]["sourceDocument"].countDocuments({_id: tag.primaryDataSourceId}, async function(err, count){
                  console.log(`tag count: uid: ${count}  ${req.userId}`);

                  if(count > 0){
                    var equipDoc = await (util.getModel()["Equipment"]["Equipment"].findOne({ name: tag.equipmentName }));
                    if(equipDoc === null)  {
                        throw new Error("Could not find Equipment: " + tag.equipmentName);
                    }

                    var saveDoc = await (new (util.getModel()["Dictionary"]["tagDocument"])(util.projectObject(tag, ["equipmentResource"], true, 1)));
                    var equipResource = {};
                    equipResource.id = equipDoc._id;
                    equipResource.name = equipDoc.name;
                    
                    // TODO: Could check if componet passed by body is in array of query ..  reject the post ...
                    //db.dataDictionary.distinct("equipmentResource.component",{"equipmentResource.id": equipResource.id })
                    equipResource.component = tag.component;      // Add for Isues #63    ** not typical    
                    // Below will need authentication .... for req.userId
                    saveDoc.docProperties = await util.createDocProperties(req.userId); 
                    saveDoc.equipmentResource = equipResource;
                    console.log("*** saveDoc: %O", saveDoc);

                    try{
                        await saveDoc.save();
                    }catch(e){
                      throw new Error("DataTag Save Error: " + e + "Name:" +saveDoc.name);
                    }

                    var foundDoc = await util.getModel()["Dictionary"]["tagDocument"].findById(saveDoc._id);
                    savedDocuments.push(saveDoc);
                    console.log( `save Doc ${saveDoc.name}`);

                    //console.log(`savedDocs:  ${JSON.stringify(savedDocuments)}`);
                    res.status(200).json(savedDocuments);
                    return;                    
                  }
                  else {
                    console.log( "E75: Provided data source id is not found in the collection");
                    util.reportMessage(e, "E75: Provided data source id is not found in the collection", null, res);
                    // res.json({error: "E75: Provided data source id is not found in the collection."})
                    // return;
                  }
                });
              }
              else {
                console.log( "E74: Provided data source id is either null or undefined.");
                res.json({error: "E74: Provided data source id is either null or undefined."})
                return;
              }
            })
        }

    //var pRes = await util.getModel()["Dictionary"]["tagDocument"].insertMany(req.body.tags);
  } catch(e){
    console.log( e+"E73: error during POST to DataDictionary collection with data tags.");
    util.reportMessage(e, "E73: error during POST to DataDictionary collection with data tags.", null, res);
  }

})

module.exports = router;
