const request = require("request");
const fs = require('fs');
const { config } = require("../../config");

module.exports.downloadImages = async (cdn_photo, iterator) => {
    return new Promise((resolve,reject) => {
        const download = (_url, path, callback) => {
            request.head(_url, (err, res, body) => {
              request(_url)
                .pipe(fs.createWriteStream(path))
                .on('close', callback)
            })
          }

          const pathToSave = `./prestashop-middlewares/images/tmp_images/image_${parseInt(iterator)+1}.png`
          download(cdn_photo, pathToSave, () => {
              resolve('done')
          })
    })
}