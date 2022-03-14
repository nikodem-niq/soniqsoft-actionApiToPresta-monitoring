const xml2js = require('xml2js-force-cdata');

module.exports.parseDataToXML = (dataToParse) => {
    const xmlObject = {
        "prestashop" : {
            "xmlns:xlink": 'http://www.w3.org/1999/xlink',
        },
        id: dataToParse.id,
    }
    
    const builder = new xml2js.Builder({headless: true, cdata: 'always'});
    const xml = builder.buildObject(dataToParse);
    console.log(xml);
}

module.exports.parseXMLToJs = (xml, callback) => {
    return xml2js.parseString(xml, callback);
}