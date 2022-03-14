const { config } = require("../../config");
const { doRequest } = require("../../middlewares/doRequest");
const { parseXMLToJs } = require("../../middlewares/parser");

module.exports.retrieveProducts = async (callback) => {
    const ProductsRes = await doRequest(`${config.prestaDemoApiUrl}/products?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(ProductsRes.body, (err,result) => {
        callback(result.prestashop.products[0].product)
    })
}

module.exports.retrieveProductById = async (id,callback) => {
    const ProductRes = await doRequest(`${config.prestaDemoApiUrl}/products/${id}?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(ProductRes.body, (err,result) => {
        callback(result.prestashop.product)
    })
}
