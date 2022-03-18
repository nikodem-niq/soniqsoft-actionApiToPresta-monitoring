const xml2js = require('xml2js-force-cdata');

module.exports.parseDataToXML = (dataToParse) => {
    delete dataToParse.manufacturer_name
    delete dataToParse.quantity
    return new Promise((resolve) => {
        const builder = new xml2js.Builder({headless: true, cdata: 'force'});
        const obj = {
            prestashop: {$: {"xmlns:xlink" : "http://www.w3.org/1999/xlink"},
                product: {
                    dataToParse
                }
            }
        }
        const xml = builder.buildObject(obj);
        const prestaXML = xml.replace('<dataToParse>', '').replace('</dataToParse>', '');
        resolve(prestaXML);
    })
}

module.exports.parseXMLToJs = (xml, callback) => {
    return xml2js.parseString(xml, callback);
}