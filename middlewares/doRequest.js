const request = require("request");
const { config } = require("../config");

module.exports.doRequest = (url) => {
    return new Promise((resolve,reject) => {
        request(url, {headers: config.headers}, (err,res,body) => {
            if(!err) {
                resolve(res);
            } else {
                reject(err);
            }
        })
    })
}