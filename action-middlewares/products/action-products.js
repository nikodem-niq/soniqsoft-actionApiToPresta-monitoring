const { config } = require("../../config");
const { doRequest } = require('../../middlewares/doRequest');

module.exports.getProductDetails = async (params) => {
    return new Promise(async resolve => {
        const detailsArray = [];
        const responseForAllProducts = await doRequest(`${config.baseUrl}/Product/${params}`);
        const { data } = JSON.parse(responseForAllProducts.body);
        for(object in data) {
            // Fetching details for product
            const responseForProduct = await doRequest(`${config.baseUrl}/ProductTechnicalSpecification/GetTreeForProduct?Language=Polish&ProductId=${data[object].productId}`);
            const detailsAboutProduct = await (JSON.parse(responseForProduct.body)["data"]);
            detailsArray.push(detailsAboutProduct);
        }

        // const responseForProduct = await doRequest(`${config.baseUrl}/ProductTechnicalSpecification/GetTreeForProduct?Language=Polish&ProductId=UZYLEVNOT0307`);
        // const detailsAboutProduct = await (JSON.parse(responseForProduct.body)["data"]);
        // detailsArray.push(detailsAboutProduct);  

        resolve(detailsArray);
    })
}