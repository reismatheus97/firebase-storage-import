let fs = require('fs');
let path = require('path');
let moment = require('moment');
moment.locale("pt-br")
let {Storage} = require('@google-cloud/storage');


/**
 * @description Define buckets' ADMIN_SDK and ID.
 */
const BUCKETS = {
  STRINGHINI: {
    ADMIN_SDK: "/home/reismatheus97/Documents/firebase-storage-uploader/stringhini-site-firebase-adminsdk-yg8nf-72628f3c07.json",
    BUCKET_ID: 'stringhini-site'
  },
}

/**
 * @description Used to set chosen bucket data.
 */
let CURRENT = {
  ADMIN_SDK: BUCKETS["STRINGHINI"].ADMIN_SDK,
  BUCKET_ID: BUCKETS["STRINGHINI"].BUCKET_ID
}

/**
 * @description google-cloud/storage requires this .env
 * to be defined on desired firebase bucket admin sdk path
 */
process.env.GOOGLE_APPLICATION_CREDENTIALS = CURRENT.ADMIN_SDK

/**
 * @description Create bucket reference
 */
const storage = new Storage();
let bucket = storage.bucket(`${CURRENT.BUCKET_ID}.appspot.com`)

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      console.log(err)
      return
    }
    console.log("* Files:", filenames)
    filenames.forEach(function(subfolder) {
      let folderPath = dirname + subfolder

      if (!!path.extname(subfolder)) {
        let UPLOAD_PATH = folderPath.split(process.cwd() + '/')[1]
        console.log("- Desired Firebase path: ", UPLOAD_PATH)

        bucket
          .upload(folderPath, {destination: UPLOAD_PATH})
          .then(
            uploadResp => {
              console.log("+ Upload Done:")
              console.log("  - Firebase path:", uploadResp[0].metadata.name)
              console.log("  - Created at:", moment(uploadResp[0].metadata.timeCreated).format('DD/MM/YYYY HH:mm:ss'))
            },
            err => {
              console.error('- Upload Failed: ', err)
            }
          ).catch(
            err => { console.error(err) }
          );
      } else {
        folderPath += '/'
        console.log('!!! >>', folderPath)
        readFiles(folderPath, function (folder, content) {
          console.log('Folder >>', folder)
        })
      }
    })
  })
}


/* :::::  MAIN  ::::: */

console.log("::: Firebase Storage Uploader :::")
console.log(`>> Target Bucket: ${CURRENT.BUCKET_ID}`)
readFiles(process.cwd() + '/', function(file, content) {
  console.log('- Filename ->', file.metadata.name)
}, function(err) {
  throw err
})
