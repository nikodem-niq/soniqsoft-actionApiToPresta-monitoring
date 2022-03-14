const { config } = require("../../config");
const { doRequest } = require("../../middlewares/doRequest");
const { parseXMLToJs } = require("../../middlewares/parser");

module.exports.retrieveFeatures = async (callback) => {
    const featuresRes = await doRequest(`${config.prestaDemoApiUrl}/product_features?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(featuresRes.body, (err,result) => {
        callback(result.prestashop.product_features[0].product_feature)
    })
}

module.exports.retrieveFeatureValues = async (callback) => {
    const featureValuesRes = await doRequest(`${config.prestaDemoApiUrl}/product_feature_values?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(featureValuesRes.body, (err,result) => {
        callback(result.prestashop.product_feature_values[0].product_feature_value);
    })
}

module.exports.retrieveFeatureById = async (id,callback) => {
    const featureRes = await doRequest(`${config.prestaDemoApiUrl}/product_features/${id}?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(featureRes.body, (err,result) => {
        callback(result.prestashop.product_feature[0])
    })
}

module.exports.retrieveFeatureValueById = async (id,callback) => {
    const featureRes = await doRequest(`${config.prestaDemoApiUrl}/product_feature_values/${id}?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(featureRes.body, (err,result) => {
        callback(result.prestashop.product_feature_value[0])
    })
}
