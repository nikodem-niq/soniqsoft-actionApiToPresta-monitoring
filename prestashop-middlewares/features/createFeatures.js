const request = require('request');
const { config } = require('../../config');
const { postRequest } = require('../../middlewares/doRequest');
const { parseXMLToJs } = require('../../middlewares/parser');

const productAttributesArray = [];

module.exports.createFeatures = (products) => {
    for(details in products) {
        for(let i=0; i<products[details].sections.length; i++) {
            for(let j=0; j<products[details].sections[i]['attributes'].length; j++) {
                productAttributesArray.push({name:products[details].sections[i]['attributes'][j].name, values:products[details].sections[i]['attributes'][j].values});
            }
        }
    }

    let uniqueObjArray = [
        ...new Map(productAttributesArray.map((item) => [item["name"], item])).values(),
    ];

    postFeatures(uniqueObjArray)
}

const postFeatures = async (features) => {
    // Post attribues
                for(let i=0; i<features.length; i++) {
                    const xmlAttritbutesSchema = `
                    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
                        <product_feature>
                            <name>
                            <language id="1"><![CDATA[ ${features[i].name} ]]></language>
                            <language id="2"><![CDATA[ ${features[i].name} ]]></language>
                            </name>
                        </product_feature>
                    </prestashop>
                    `
                const attributesReq = await postRequest(`${config.prestaDemoApiUrl}/product_features?ws_key=${process.env.PRESTA_WEB_TOKEN}`, xmlAttritbutesSchema);
                    parseXMLToJs(attributesReq.body, async (err, result) => {
                        const { id } = result.prestashop.product_feature[0];
                        if(typeof features[id] === undefined) {
                            features[id].values = [0];
                        } else {
                            for(let j=0; j<features[i].values.length; j++) {
                                    const xmlValuesSchema = `
                                    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
                                        <product_feature_value>
                                            <id_feature><![CDATA[${id}]]></id_feature>
                                            <custom><![CDATA[0]]></custom>
                                            <value>
                                            <language id="1"><![CDATA[${features[i].values[j]}]]></language>
                                            <language id="2"><![CDATA[${features[i].values[j]} ]]></language>
                                            </value>
                                        </product_feature_value>
                                    </prestashop>
                                    `
                        
                                    await postRequest(`${config.prestaDemoApiUrl}/product_feature_values?ws_key=${process.env.PRESTA_WEB_TOKEN}`, xmlValuesSchema);
                            }
                        }
                    });
                }
}