const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const swarmConfig = require('./swarmConfig.js')
const node = new IPFS( 
    {
        "repo":"./ipfs",
        "init":false,
        "EXPERIMENTAL":{
            "pubsub":true
        },
        "config":swarmConfig()
    }
)
var express = require('express')
var path = require('path')
var fs = require("fs")
var app = express()
const fileUpload = require('express-fileupload');



var bodyParser = require('body-parser');
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: false
}));

node.on('ready', () => {
    // const room = Room(node, 'room-name')
  
    // room.on('peer joined', (peer) => {
    //   console.log('Peer joined the room', peer)
    // })
  
    // room.on('peer left', (peer) => {
    //   console.log('Peer left...', peer)
    // })
  
    // // now started to listen to room
    // room.on('subscribed', () => {
    //   console.log('Now connected!')
    // })

    node.id(function (err, identity) {
        if (err) {
          throw err
        }
        console.log(identity)
      })
  })

app.use(fileUpload());

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/saveFile',async (req,res)=>{

   // console.log(req.files);
   
    var data = await ipfsWriteSingleFile(req.files.myFile)
    console.log(data)
    return res.send(data)
// ipfsWriteSingleFile(req.files.myFile,function(data,err){
//     console.log("data",data)
//     return res.send(data)
// })
   
    //  const validCID = 'QmdwPACTcL5fuvANE95k339iiPyQ9dmGSqSHRZDyanAmwo'
  
})

  const ipfsWriteSingleFile =  async function ipfsWriteSingleFile(expressFileObject,callback){
    let data,err
    var promise = await  new Promise(async (resolve,reject)=>{
        try{
            console.log("reaching here")
         data = await node.files.add({path:"/abc.png","content":expressFileObject.data})
         console.log("reaching here 2")
         resolve(data);
        }catch(e){
            console.log("reaching here err " + e)
            err= e
            reject(e)
        }
       
    })
    console.log("isFunction(callback)",isFunction(callback))
    return isFunction(callback)?callback(data,err):promise
   
  
}

function isFunction(functionToCheck) {
    return functionToCheck && typeof functionToCheck === "function"
   }


   const ipfsReadSingleFile = async function ipfsReadSingleFile(filehash,callback) {
       
    let returnObj,err
    var promise = await  new Promise(async (resolve,reject)=>{
        try{
            if(!filehash){
                throw "FILHASH SHOULDNT BE EMPTY!!!"
            }
            node.files.get(validCID, function (err, file) {
                    console.log("err",err)
                    console.log("files",file)
                    console.log(file[0].content)
                    mimeType=getMimetype(file[0].content)
                     returnObj = {}
                    returnObj.fileBuffer = file[0].content
                    returnObj.mime = mimeType.mime
                    returnObj.ext = mimeType.ext

                    resolve(returnObj)
                    //var filepath="./myFile."+mimeType.ext

              
            })
        
        }catch(e){
            console.log("reaching here err " + e)
            err= e
            reject(e)
        }
    })
     console.log("isFunction(callback)",isFunction(callback))
     return isFunction(callback)?callback(returnObj,err):promise


   }

app.get('/getFile',async (req,res)=>{

    validCID = req.query.filehash
    var fileData = await ipfsReadSingleFile(validCID)
    let filepath = "./myFile."+fileData.ext

    fs.open(filepath, 'w', function(err, fd) {  
        if (err) {
            throw 'could not open file: ' + err;
        }
    
        // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
        fs.write(fd, fileData.fileBuffer, 0, fileData.fileBuffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('wrote the file successfully');
                return res.sendFile("./myFile."+mimeType.ext, {root: __dirname })
            });
        });
    });


})



// app.get('/getFile',async (req,res)=>{
//     validCID = req.query.filehash

//     node.files.get(validCID, function (err, files) {
//         console.log("err",err)
//         console.log("files",files)
//         files.forEach((file) => {
//             console.log(file.content)
//             mimeType=getMimetype(file.content)
//             var filepath="./myFile."+mimeType.ext
//             fs.open(filepath, 'w', function(err, fd) {  
//                 if (err) {
//                     throw 'could not open file: ' + err;
//                 }
            
//                 // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
//                 fs.write(fd, file.content, 0, file.content.length, null, function(err) {
//                     if (err) throw 'error writing file: ' + err;
//                     fs.close(fd, function() {
//                         console.log('wrote the file successfully');
//                         return res.sendFile("./myFile."+mimeType.ext, {root: __dirname })
//                     });
//                 });
//             });
           
//             });
//            })

// })

const getMimetype = (buffer) => {

    let bytes = []
    buffer.forEach((byte) => {
        bytes.push(byte.toString(16))
    })
    let hex = bytes.join('').toUpperCase()
    console.log(hex.slice(0,8))
    hex= hex.slice(0,8)

    switch (hex) {
        case '89504E47':
            return {mime:'image/png',ext:"png"}
        case '47494638':
            return {mime:'image/gif',ext:"gif"}
        case '25504446':
            return {mime:'application/pdf',ext:"pdf"}
        case 'FFD8FFDB':
        case 'FFD8FFE0':
        case 'FFD8FFE1':
            return {mime:'image/jpeg',ext:"jpeg"}
        case '504B0304':
            return {mime:'application/zip',ext:"zip"}
        default:
            return 'Unknown filetype'
    }
}


// const IPFSFactory = require('ipfsd-ctl')

// const server = IPFSFactory.createServer({ port: 12345 })

// server.start((err) => {
//   if (err) { throw err }

//   console.log('endpoint is running')

// //   server.stop((err) => {
// //     if (err) { throw err }

// //     console.log('endpoint has stopped')
// //   })
// })




let validCID = "QmRsQufzabJYx3JW9qHta5iJ8YLxt8cy7WULC6GFKmsM7V"


app.listen(3000);
// node.files.add()