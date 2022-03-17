const { getImgForProduct } = require("../../action-middlewares/images/action-images");
const { downloadImages } = require("./downloadImages");
const fs = require('fs');
const FormData = require('form-data');
const { promisify } = require("util");
const resizeImg = require('resize-img');

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile)
const readFileSync = promisify(fs.readFileSync)
const unlinkFileSync = promisify(fs.unlinkSync)
const writeFileSync = promisify(fs.writeFileSync);

module.exports.createImages = async (productId_action, productId_presta) => {
    return new Promise(async (resolve, reject) => {
        try {
            const images = await getImgForProduct(productId_action);
            for(image in images) {
                console.log(`downloading image ${parseInt(image)+1} for ${productId_presta}`)
                await downloadImages(images[image], image);
            }
            await this.resizeImages();
            resolve(await this.saveImagesToPresta(productId_presta));
        } catch(err) {
            console.log(err);
        }
    })
}

module.exports.resizeImages = async () => {
    return new Promise(async (resolve, reject) => {
        const images = await readDir('./prestashop-middlewares/images/tmp_images');
        for await(image of images) {
            console.log(`resizing ${image}`)
            const resizedImage = await resizeImg(fs.readFileSync(`./prestashop-middlewares/images/tmp_images/${image}`), {
                width: 800,
                height: 800
            })

            fs.writeFileSync(`./prestashop-middlewares/images/tmp_images/${image}`, resizedImage);
            // console.log(image)
        }
        resolve('images has been resized');
    })
}

module.exports.saveImagesToPresta = async (productId_presta) => {
    return new Promise(async (resolve, reject) => {
        const files = await readDir('./prestashop-middlewares/images/tmp_images');
        for await(file of files) {
            console.log(`saving ${file} for ${productId_presta}........`);
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
                let res;
                do {
                    res = await req();
                    if(res.statusCode != 200) {
                        console.error(`${res.statusCode} error... trying to reconnect`)
                        // console.log(res)
                        // fs.writeFile('./logs/logs.txt', JSON.stringify(res), (err) => {
                        //     if(err) {
                        //         console.log(err);
                        //     }
                        // })
                    } else {
                        console.log(`img ${file} for ${productId_presta} - ${res.statusCode}`);
                    }
                } while(res.statusCode != 200)
            } catch(err) {
                throw new Error(err);
            }
            unlinkFileSync(`./prestashop-middlewares/images/tmp_images/${file}`);
        }
        resolve('saving done');
    })
} 