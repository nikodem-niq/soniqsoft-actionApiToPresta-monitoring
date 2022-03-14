const { getImgForProduct } = require("../../action-middlewares/images/action-images");
const { config } = require("../../config");
const { downloadImages } = require("./downloadImages");
const fs = require('fs');
const FormData = require('form-data');
const { promisify } = require("util");
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile)
const unlinkFile = promisify(fs.unlink)

module.exports.createImages = async (productId_action, productId_presta) => {
    try {
        const images = await getImgForProduct(productId_action);
        for(image in images) {
            await downloadImages(images[image], image);
        }
        await this.saveImagesToPresta(productId_presta);
    } catch(err) {
        console.log(err);
    }
}

module.exports.deleteImagesLocal = async () => {
    const files = await readDir('./prestashop-middlewares/images/tmp_images');
    for await(file of files) {
        try {
            unlinkFile(`./prestashop-middlewares/images/tmp_images/${file}`, (err) => {
                if(err) {
                    throw new Error(err);
                }
    
                console.log(`file removed`);
            })
        } catch(err) {
            // lOG WHY WONT DELETED
        }
    }
}
module.exports.saveImagesToPresta = async (productId_presta) => {
    const files = await readDir('./prestashop-middlewares/images/tmp_images');
    for await(file of files) {
        const file_read = await readFile(`./prestashop-middlewares/images/tmp_images/${file}`);

        const req = () => new Promise((resolve) => {
            const _FormData = new FormData();
            _FormData.append('image', file_read, {filename: file})
            _FormData.submit({
                host: 'localhost',
                path: `/presta-demo-v2/api/images/products/${productId_presta}?ws_key=${process.env.PRESTA_WEB_TOKEN}`
            }, (err,response) => {
                resolve(response);
            }) 
        })

        try {
            const res = await req();
            if(res.statusCode != 200) {
                // log to LOGS!!!!
            }
            console.log(file,res.statusCode)
        } catch(err) {
            throw new Error(err);
        }
    }
    
    await this.deleteImagesLocal();
} 