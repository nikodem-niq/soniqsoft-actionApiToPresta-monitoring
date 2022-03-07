const { config } = require("../../config");
const { doRequest } = require("../../main");


module.exports.getImgForProduct = async id => {
    // Fetching IMG for product
    const productImgRes = await doRequest(`${config.baseUrl}/ProductPictures?Language=Polish&ProductId=${id}`);
    const imagesArray = [];
    const cdnUrlPhoto = `${config.cdnUrl}CID=${config.photos.CID}&UID=${config.photos.UID}&PID=${config.photos.PID}&P=`
    imagesArray.push(JSON.parse(productImgRes.body));
    const imagesPathObject = [];
    for(let i=0; i<imagesArray[0].data.images.length; i++) {
        imagesPathObject.push(`${cdnUrlPhoto}${imagesArray[0].data.images[i].path}`)
    }

    return imagesPathObject

}