const express = require('express');
const router = express.Router();
const moment = require('moment');
const format = require('util').format;
const util = require('../util');
var jwtPassport = require('../jwtPassport');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

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
 * @api {get} /equipment/all GET equipment documents
 * @apiDescription Filter equipment documents based on adding a URL query [name, equipmentResourceType, ...]
 * @apiName GetEquipment
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Equipment
 *
 * @apiParam {String} [name] Filter based on name of equipment resource
 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/equipment?name="Aventes01"
 *
 * @apiSuccess {Object} Equipment An array of all the retrieved equipment documents.
 */
//router.get('/all',jwtPassport.isAuthorized, async (req, res, next) => {

router.get('/all', async (req, res, next) => {
  try {
      let equip = [];
      
      console.log("Got to all route");

      // add mongoose direct - eliminate the util
      let temp = await mongoose.model('equipment').find('query' in req ? req.query : {}).populate([
        {path: 'currentSetup.propertyId'}, {path: 'currentSetup.types'}]);
        //db.equipment.find({},{uniqueName:1, name:1, displayName:1, active:1, ccam:1})
      equip = equip.concat(temp);

      res.send(equip);
  } catch (e) {
      util.reportMessage(e, "E85: error during GET from equipment collections.", null, res);
      //res.status(401).send('E85: error during GET from material definition');
  }
});



/**
 * @api {get} /equipment/ GET equipment documents
 * @apiDescription Filter equipment documents based on adding a URL query [name, equipmentResourceType, ...]
 * @apiName GetEquipmentDoc
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Equipment
 *
 * @apiParam {String} [name] Filter based on name of equipment resource
 * @apiParam {String} [equipmentResourceType] Filter based on equipmentResourceType 
 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/equipment?name="Aventes01"
 *
 * @apiSuccess {Object} Equipment document
 */
//router.get('/allp',jwtPassport.isAuthorized, async (req, res, next) => {

router.get('/allp', async (req, res, next) => {
  try {
      let equip = [];

      console.log(`query: ${req.query.name}`);
      var projection = {'name.$': 1 };

      // add mongoose direct - eliminate the util - look for paramater "?" in wildcart list {}
      // then use the select to get only the fields you need
      let temp = await mongoose.model('equipment').find('query' in req ? req.query : {}).select({ "name": 1, "displayName": 1, "_id": 0});
      equip = equip.concat(temp);

      res.send(equip);
  } catch (e) {
      util.reportMessage(e, "E85: error during GET allp from equipment collections.", null, res);
      //res.status(401).send('E85: error during GET from material definition');
  }
});



/**
 * @api {get} /equipment/ GET equipment documents
 * @apiDescription Filter equipment documents based on adding a URL query [name, equipmentResourceType, ...]
 * @apiName GetEquipmentDoc
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Equipment
 *
 * @apiParam {String} [name] Filter based on name of equipment resource
 * @apiParam {String} [equipmentResourceType] Filter based on equipmentResourceType 
 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/equipment?name="Aventes01"
 *
 * @apiSuccess {Object} Equipment document
 */
router.get('/allp',jwtPassport.isAuthorized, async (req, res, next) => {
  try {
      let equip = [];
      // var qs = { title : 'someTitle', 'places.name' : 'someName' };
      // var projection = {'places.$': 1 };
      // db.collection.find(qs, projection);

      // add mongoose direct - eliminate the util - look for paramater "?" in wildcart list {}
      let temp = await mongoose.model('equipment').find('query' in req ? req.query : {'name.$': 1});
      equip = equip.concat(temp);

      res.send(equip);
  } catch (e) {
      util.reportMessage(e, "E85: error during GET from equipment collections.", null, res);
      //res.status(401).send('E85: error during GET from material definition');
  }
});




/**
 * @api {put} /equipment/:id/setup PUT Update eqpuipment setup
 * @apiName PutEquipmentSetup
 * @apiGroup Equipment
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 *
 * @apiParam {String} id URL parameter. 24-character Mongo ID of the equipment.
 * @apiParam {Object[]} setup Request body parameter. List of objects to
 * update equipment's current setup to.
 *
 * @apiSuccess {Object} equipment Modified equipment document re-retrieved from
 * database. Returned without object wrapping.
 */
router.put('/:id/setup', jwtPassport.isAuthorized, async (req, res, next) => {
  try {
    /* req.body.setup.forEach(obj => {
      // does obj have a value (i.e. is not a type/asset)?
      if (Boolean(obj.value) && obj.value.dataType == "number")
        obj.value.value = Number(obj.value.value);
    }); */
    console.log(req.params.id);
    var r = await util.getModel()["Equipment"]["Equipment"].findByIdAndUpdate(
      req.params.id, {$set: {currentSetup: req.body.setup}}, {new: true});
    var eq = await util.getModel()["Equipment"]["Equipment"].findById(req.params.id);
    res.json(eq);
  } catch (err) {
    util.reportMessage(err, "E09: error during PUT EquipmentResource setup by _id " + req.params.id);
  }
});

/** TODO correct data from template
 * @api {get} /equipment/tags GET names and tags 
 * @apiName GetEquipmentTags
 * @apiUse DFHeader
 * @apiGroup Equipment
 * @apiVersion 0.1.0
 *
 * @apiSuccess {Object[]} tags List of all tags and their human names used to
 * generate a PRS. Returned without object wrapping.
 */
router.get('/tags', jwtPassport.isAuthorized, (req, res, next) => {
  res.json(util.getPrs().filter(
    s => Object.keys(s).includes("dataset")).map(
      t => new Object({name: t.name, tag: t.dataset })));
});


/**
 * @api {post} /equipment POST create new equipment.
 * 
 * @apiName OnboardNew
 * @apiUse DFHeader
 * @apiGroup Equipment
 * @apiVersion 0.1.0
 *
 * @apiParam {String} name Name of equipment 
 * @apiParam {String} displayName Display name of equipment
 * @apiParam {String} equipmentResourceType Type of equipment resource
 * @apiParam {String} [createBy] Name who is creating equipment
 * @apiParam {String} [createdDate] Date of creation of equipment
 * @apiParam {String} [currentJob] Current job for equipment
 * @apiParam {String} [nextScheduledJob] Next scheduled job for equipment
 *
 * @apiParamExample body
 *  {
 *      "name":"AcousticSensor01", //REQ
 *      "displayName": "Acoustic Sensor 01", 
 *      "equipmentResourceType":"Acoustic", 
 *      "createdBy":"Tim Bakker",
 *      "createdDate":"2019-11-14T03:51:12.520Z",
 *      "currentJob":"",
 *      "nextScheduledJob":"",
 *  }
 *
 * @apiSuccess {Object} equipment Returns the document of the newly create equipment.
 */
router.post('/',[check('name').isString(), check('equipmentResourceType').isString(), check('createdBy').isString(), check('createdDate').isString()], jwtPassport.isAuthorized, async function(req, res, next) {
  try {
        var err = validationResult(req);
        if(!err.isEmpty())
            throw new Error(JSON.stringify(err.mapped()));
          
        // let Mongoose validate body against eq expectation.
        var newEq = await (new (util.getModel()["Equipment"]["Equipment"])(util.projectObject(req.body, ["name", "displayName",  "equipmentResourceType", "createdBy", "createdDate", "currentJob", "nextScheduledJob" ]), false, 1));
        newEq.rev = "1";
        newEq._id = new mongoose.mongo.ObjectId();
        var pRes = await newEq.save();
        var ppRes = await util.getModel()["Equipment"]["Equipment"].findById(pRes._id);
        res.json(ppRes);
  } catch (e) {
    util.reportMessage(e, "E70: error during POST to EquipmentResource collection", null, res);
  }
})

/**
 * @api {get} /equipmentResourceTypes/all GET all resource types for equipment
 * @apiName GetEquipmentResourceTypesAll
 * @apiUse DFHeader
 * @apiGroup Equipment
 * @apiVersion 0.1.0
 * @apiSuccess {Array} All equipment resource types
 * @apiDeprecated This endpoint is no longer needed as typeing is done differently now.
 */
 //router.get('/equipmentResourceTypes', jwtPassport.isAuthorized, async function (req, res, next) {

router.get('/equipmentResourceTypes', async function (req, res, next) {
  try{
    console.log("Find Equipment Resource\n");
    docs = await util.getModel()["Equipment"]["Equipment"].find();
    list = docs.map(e => e.equipmentResourceType);
    res.json(removeDupsAndNulls(list));
  } catch (e) {
    util.reportMessage(e, "E71: error during retrieval of equipment resource types.", null, res);
  }
});

function removeDupsAndNulls(aToClean) {
  unique = [];
  aToClean.forEach(function(i){
    if(i != null)
    {
      index = unique.findIndex(item => item == i);
      if(index == -1)
      {
        unique.push(i);
      }
    }
  })
  return unique;
}

/**
 * @api {get} /equipment/byTypeIds GET Equipment by the given types ids.
 * @apiName GetEquipemntByTypeIds
 * @apiGroup Equipment
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 *
 * @apiParam {ObjectId[]} types An array of ObjectIds for the types to filter the equipment by.
 *
 * @apiSuccess {Object[]} equipment An array of equipment that have the types and their children.
 */
router.get('/byTypeIds',jwtPassport.isAuthorized, async (req, res, next) => {
  try {
      var types = req.query.types;
      let inputTypesArray = [];

      for (const typex of types){
          inputTypesArray.push(mongoose.Types.ObjectId(typex));
      }

      const pipeline = [{$match: {types: {$in: Object.values(inputTypesArray)}}}];

      const foundTypes = (await util.getModel()["Equipment"]["EquipmentView"].aggregate(pipeline).allowDiskUse(true));
      res.json(foundTypes);
  } catch (e) {
      util.reportMessage(e, "E84: error during GET of type ids", null, res);
  }
});



// RETURN a promise with a Mongo document as its first arg.
// TODO declare async?
function getEquipmentByName(name) {
  // it's okay if nothing comes of this query.
  // TODO insert skeleton document?
  return util.getModel()['EquipmentResource'].findOne({name: name});
}

module.exports = {
  router: router,
  getEquipmentByName: getEquipmentByName
};
