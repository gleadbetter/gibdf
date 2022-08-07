This is a very simple file upload and retrieve done in GridFS

1) First make sure you do an "npm install"
2) Then run "npm start"
3) Then open the browser at "http://localhost:5000/"
4) Choose a file to load - it will select from your file system
5) The default Mong Database is determined by the env file
6) You can use Postman {{baseUrl}}/upload   : baseUrl --> http://localhost:5000

`const  mongoUrl =process.env.MONGO_URL;`

This is read from the .env file .. make sure you have this configured

```# EXAMPLE '.env' FILE
# The '.env' can be used to set default environment variables
# these values will be overridden by system environment variables
PORT=8080
MONGO_URL=mongodb://dfAdmin:Cc%40m!123@camv-d10dbdev1:27017/DevGeneric?authSource=admin
MONGO_URI=mongodb://localhost:27017/DevGeneric&& node bin/www
MONGO_DB=DevGeneric
NODE_ENV=development
WHITELIST=["http://localhost","http://localhost:80","http://camv-d10dfdev1","http://camv-d10dfdev1:80","http://CCAM-CND72485CV","http://CCAM-CND72485CV:80"]
```

It will be created in Mongo documents  "uploads"
uploads.chunks
uploads.files

Below is how the uploads.files would be loaded in Compass
```
{"_id":{"$oid":"620427b1903898331420b50a"},
"length":33796,
"chunkSize":261120,
"uploadDate":{"$date":"2022-02-09T20:44:33.309Z"},
"filename":"TSNodeRed.png","md5":"6d3bf18e51963c16b323de1f7a1130b0",
"contentType":
"image/png"}```





