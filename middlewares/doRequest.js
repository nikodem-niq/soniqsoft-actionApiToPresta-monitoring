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

module.exports.postRequest = (url, body) => {
    return new Promise((resolve,reject) => {
        request.post(url, {headers: {method: 'post', 'Content-Type': 'text/xml'}, body}, (err,res,body) => {
            if(!err) {
                resolve(res);
            } else {
                reject(err);
            }
        })
    })
}

module.exports.putRequest = (url, body) => {
    return new Promise((resolve,reject) => {
        request.put(url, {headers: {method: 'put', 'Content-Type': 'text/xml'}, body}, (err,res,body) => {
            if(!err) {
                resolve(res);
            } else {
                reject(err);
            }
        })
    })
}