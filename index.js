const fs = require('fs');
const Multiprogress = require('multi-progress');
const BoxSDK = require('box-node-sdk');

const sdk = new BoxSDK({
  clientID: process.env.BOX_ID,
  clientSecret: process.env.BOX_SECRET,
});

const box = sdk.getBasicClient(process.env.BOX_TOKEN);

const multi = new Multiprogress(process.stderr);

box.folders.getItems(process.env.FOLDER_ID || process.argv[2], {fields: 'name,size'}, (err, {entries}) => {
  if(err){
    throw err;
  }
  entries.map(({id, name, size}) =>{
    box.files.getReadStream(id, null, (err, stream) => {
      if(err) {
        throw err;
      }
      stream.pipe(fs.createWriteStream(`./data/${name}`));
      var bar = multi.newBar(`  [:bar] :percent :etas  ${name}`, {
        complete: '=',
        incomplete: ' ',
        width: 50,
        total: size,
      });
      stream.on('data', (chunk) => {
        bar.tick(chunk.length);
      });
    });  
  });
});
