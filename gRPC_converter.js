const protoLoader = require('@grpc/proto-loader');
const grpcLibrary = require('grpc');
const REMOTE_URL = "localhost:50051";
var fs = require('fs');
const { rejects } = require('assert');

let options = {
    keepCase: true, //Preserve field names. The default is to change them to camel case.
    longs: String,  //The type to use to represent long values. Defaults to a Long object type.
    enums: String,  //The type to use to represent enum values. Defaults to the numeric value
    defaults: true, //Set default values on output objects. Defaults to false.
    oneofs: true    //Set virtual oneof properties to the present field's name. Defaults to false.
};

let protoFileName = './conversion.proto';
 
const packageDefinition = protoLoader.loadSync(protoFileName, options);
const packageObject = grpcLibrary.loadPackageDefinition(packageDefinition);
let conversion = packageObject.conversion;
let conversionService = new conversion.Converter(REMOTE_URL, grpcLibrary.credentials.createInsecure());

function main() { //test per verificare come funziona gRPC

  let connection = conversionService.fileConvert();

  
  binary = fs.readFileSync('./TaskImages/image.jpg');

  var wstream = fs.createWriteStream('./TaskImages/convertedImage.png');

  connection.on('data', function(chunk){ 
    //converted image + resultmetadata, sent as a series of chunks
    if(chunk.meta !== undefined){
      console.log(chunk.meta.success);
    }
    else
      wstream.write(chunk.file); //come distringuere
  });

  connection.on('end', function() {  // The server has finished sending
    wstream.end(); 
  });

  connection.on('error', function(e) {
    console.log(e);// An error has occurred and the stream has been closed.
  });
  
  //wstream.on('close')

  for (let index = 0; index < binary.length; index+=1024) {
    if(index === 0){
      //let metadata = {file_type_origin: "jpg", file_type_target: "png"};
      connection.write({meta: {file_type_origin: "jpg", file_type_target: "png"}});
    }
    else{
      connection.write({file: binary.slice(index-1024, index)});
    }
  } 
  connection.end();
}
 

 
//main();
 

