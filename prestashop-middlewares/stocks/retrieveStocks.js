const { config } = require("../../config");
const { doRequest } = require("../../middlewares/doRequest");
const { parseXMLToJs } = require("../../middlewares/parser");


module.exports.retrieveStockById = async (id,callback) => {
    const StockRes = await doRequest(`${config.prestaDemoApiUrl}/stock_availables/${id}?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(StockRes.body, (err,result) => {
        callback(result.prestashop.stock_available)
    })
}