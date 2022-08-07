const express = require('express');
const router = express.Router();    
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

// Mongo URI - for local testing, but can read from envirionment if you want to change it there -- 
// const mongoUrl = 'mongodb://localhost:27017/mongouploads';
// console.log(`\r\n**** In the app.js module - Gridfs db mongoURI url:${mongoUrl}\r\n`);
const  mongoUrl =process.env.MONGO_URL;
const dataBaseName = process.env.MONGO_DB

// Debug to see what we got from the environment
console.log(`\r\nmongoUrl: ${mongoUrl} `);
console.log(`dbname: ${dataBaseName} `);

// Create mongo connection
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);

const conn = mongoose.createConnection(mongoUrl, 
    {   useNewUrlParser: true,
        useUnifiedTopology: true
    });


//  TODO: DeprecationWarning: GridStore is deprecated fix
// https://www.topcoder.com/thrive/articles/storing-large-files-in-mongodb-using-gridfs
//  gfs - --- gridFSBucket

//  Init gfs   
let gfs=null;

//  Init gridFSBucket  
//let gridFSBucket=null;

// Build from Demo code https://www.youtube.com/watch?v=3f5Q9wDePzY
// https://data-flair.training/blogs/mongodb-gridfs-tutorial/

conn.once('open', () => {
    //Init stream
    gfs= Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');

    //gridFSBucket= Grid(conn.db, mongoose.mongo);
    //gridFSBucket.collection('uploads');
})

//create file storage
const storage = new GridFsStorage({
    url:mongoUrl,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file:(req,file) =>{
       console.log("(storage) file-->"+JSON.stringify(file,null,2));

       return new Promise((resolve,reject) =>{
         crypto.randomBytes(16, (err, buf)=>{
         if(err) {
          return reject(err);
          }

      //const filename = buf.toString('hex') + path.extname(file.originalname);
      const filename = file.originalname;

      console.log(`\r\n**** storage **** `);
      console.log(`\r\n**** file:${filename}`);
      console.log(`**** Dest:${file.destination}\r\n`); 

      const fileinfo = {
          filename:filename,
          bucketName:'uploads'   //<---- GridFS collection
           };
           resolve(fileinfo);
         });
       });
      }
    });
    const upload = multer({storage} );


// The code below was used for testing headers ...
// // @route POST /tpost 
// // @desc upload file to db - test
router.post('/tpost', (req,res) =>{

    // output the headers
    console.log("*************** HEADER *****************");
    console.log(req.headers);

    // capture the encoded form data
    console.log("\r\n*************** DATA *****************");
    req.on('data', (data) => {
      console.log(data.toString());
    });

    console.log("*************** REQ *****************");
    console.log(req.body, req.files);
    //console.log('Body- ' + JSON.stringify(req.body));
    //console.log(req.body, req.files);
      
      // var file = req.files.file;
      // console.log(file.name);
      // console.log(file.type);
      res.status(200).send('OK');
  
  })



// @route GET /api/gfs/files
// @desc Display all files in JSON
// Each file in the array
// {
//     "_id": "620c06832e555301f4562fdf",
//     "length": 36855,
//     "chunkSize": 261120,
//     "uploadDate": "2022-02-15T20:01:07.354Z",
//     "filename": "IR_layer21.png",
//     "md5": "f2dafa4176b196f080b19d6ec18aaf79",
//     "contentType": "image/png"
// },
router.get('/files', (req,res) => {
    
    gfs.files.find().toArray((err,files) => {
        // Check if  we have files
        console.log(`\r\n**** Files:${files.length}\n`); 
        if(!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        // Files exist, regurn JSON
        return res.json(files);
    })
});


// @route GET /api/gfs/all
// @desc Display all files in JSON - Default route
router.get('/all', (req,res) => {
    
    gfs.files.find().toArray((err,files) => {
        // Check if files
        if(!files || files.length === 0) {
            res.render('index', {files:false});
        }
        else {
            files.map(file => {
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/bmp')
                {
                    file.isImage=true;
                } else{
                    file.isImage=false;
                }
            });
            // Files exist, send to the view via render
            res.render('index',{files: files});
        }
    })
});


// @route POST /upload - this is middleware code setup for GridFS
// @desc upload file to db
router.post('/upload', upload.single('file'), (req,res) =>{


      // output the headers
      console.log("*************** HEADER *****************");
      console.log(req.headers);

      console.log("*************** REQ *****************");
      console.log(req.body, req.files);

    //console.log("req-->"+JSON.stringify(req,null,2));
    //console.log(`file--> ${file}`);

    console.log(`\r\n**** Upload **** \r\n`);
    console.log(`File name: " ${req.file.filename}`);
    console.log(`File size: " ${req.file.size}`);


    // capture the encoded form data  - will show all the data
    //   console.log("*************** DATA *****************");
    //   req.on('data', (data) => {
    //     console.log(data.toString());
    //   });

    res.json({file: req.file})
    //res.redirect('/');
})



// @route GET /file/:filename
// @desc Display single file in JSON
router.get('/file/:filename', (req,res) => {
    console.log(`\r\n**** Filename:${req.params.filename}\n`); 
    gfs.files.findOne({ filename: req.params.filename},(err,file) => {
        console.log(`File ${file}`);
        // Check if file
        if(!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exist'
            });
        }
        // Files exist
        return res.json(file);
    })
});





// @route GET /image
// @desc Display image file in JSON
router.get('/image/:filename', (req,res) => {
    gfs.files.findOne({ filename: req.params.filename},(err,file) => {
        console.log(`**** Get File ${req.params.filename} ****` );
        // Check if file found and has content 
        if(!file)  {
            return res.status(404).json({
                err: 'File Does not exist'
            });
        }
        else if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            
            return res.status(404).json({
                err: 'Not  image file'
            });
        }
    })
});



// @route DELETE /files/:id
// @desc Delete file
router.delete('/dfiles/:id', (req, res) => {
    gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
        if(err) {
            console.log('Error deleting file');
            return res.status(404).json({ err: err });
        }

        res.redirect('/');
    })
});

// export to be imported in app.js
module.exports = router;



