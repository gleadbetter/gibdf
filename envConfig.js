// map all environment variables
module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: "8080",
  //port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  whitelist: parseStringToArray(process.env.WHITELIST),
  dbname: parseMongoURL(process.env.MONGO_URL)
};

function parseStringToArray(val) {
   if (val) {
      const array = JSON.parse(val);
      return array;
   } else {
     return [];
   }
}

// DEV_MONGO_URL = 'mongodb://db_server:27017/DevGeneric'
// PROD_MONGO_URL='mongodb://dfAPI:zdEKasng@camv-d10dbprd1:27017,camv-
// d10dbprd2:27017,camv-d10xxx:2017/Generic?authSource=admin&authMechanism=SCRAM-SHA-
// 256&replicaSet=df_rs_0&readPreference=secondaryPreferred&ssl=false';
// Deal with comman in Prod long url name, but also shorter Dev string
function parseMongoURL(UrlName) {
  //console.log(`url to parse: ${UrlName}`);
  var urlToParse=null;
  var urlArr = UrlName.split(',');
  // check if we have the long string separated by comma
      if( urlArr[1]==null) {
      urlToParse=urlArr[0];
      }
      else {
      urlToParse=urlArr[1];
      }
  // pull out path becase db name is in that, after the slash
  let my_URL = new URL(urlToParse);
  let pathname= my_URL.pathname;
  var pt2=pathname.split('/');
  var dbname=pt2[1];
  //console.log(`\nPname: ${pathname} \t\tdb ${dbname}`);

  return dbname;  
  }

  module.exports = { parseMongoURL };