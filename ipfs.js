//Required modules
const ipfsAPI = require('ipfs-api');
const express = require('express');
const fs = require('fs');
const app = express();

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

//Reading file from computer
let testFile = fs.readFileSync("./index.html");
//Creating buffer for ipfs function to add file to the system
let testBuffer = new Buffer(testFile);

//Addfile router for adding file a local file to the IPFS network without any local node
app.get('/addfile', function(req, res) {

    ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          console.log(err);
        }
        console.log(file)
      })

})
//Getting the uploaded file via hash code.
app.get('/getfile', function(req, res) {
    
    //This hash is returned hash of addFile router.
    const validCID = 'QmRewJ43SDFruF4ghSZCbnGwcuQ1oZtUUXWnk3ztmM65ZM'

    ipfs.files.get(validCID, function (err, files) {
        files.forEach((file) => {
            response = res
            response.writeHead(200, {
                'Content-Type': 'image/jpeg'
                
            });
            res.send()
        
           // var readStream = fileSystem.createReadStream(filePath);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            //file.content.pipe(response);
       
        })
      })

})

app.listen(3000, () => console.log('App listening on port 3000!'))