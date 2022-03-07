const request = require('request');
const { config } = require('../../config');

const productAttributesArray = [];
const productAttributeValuesArray = [];

module.exports.createFeatures = (products) => {
    for(details in products) {
        for(let i=0; i<products[details].sections.length; i++) {
            for(let j=0; j<products[details].sections[i]['attributes'].length; j++) {
                productAttributesArray.push(products[details].sections[i]['attributes'][j].name);
                for(let k=0; k<products[details].sections[i]['attributes'][j].values.length; k++) {
                    productAttributeValuesArray.push(products[details].sections[i]['attributes'][j].values[k]);
                }
            }
        }
    }

    const uniqueAttributesArray = [...new Set(productAttributesArray)];
    const uniqueAttributeValuesArray = [...new Set(productAttributeValuesArray)];
    console.log(uniqueAttributesArray)
    console.log(uniqueAttributeValuesArray)

    // postFeatures(uniqueAttributesArray)
}

const postFeatures = (attributes, values) => {
    // Post attribues
    for(let i=0; i<attributes.length; i++) {
        const xmlAttritbutesSchema = `
        <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
            <product_feature>
                <name>
                <language id="1"><![CDATA[ ${attributes[i]} ]]></language>
                <language id="2"><![CDATA[ ${attributes[i]} ]]></language>
                </name>
            </product_feature>
        </prestashop>
        `

        request.post(`${config.prestaDemoApiUrl}/product_features?ws_key=${process.env.PRESTA_WEB_TOKEN}`, {headers: { method: 'POST'
        }, body: xmlAttritbutesSchema}, (err,res) => {
            console.log(res);
        })
    }

    // Post values for attributes
    for(let j=0; j<values.length; j++) {
        const xmlValuesSchema = `
        <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
            <product_feature_value>
                <id_feature><![CDATA[]]></id_feature>
                <custom><![CDATA[]]></custom>
                <value>
                <language id="1"><![CDATA[]]></language>
                <language id="2"><![CDATA[]]></language>
                </value>
            </product_feature_value>
        </prestashop>
        `

        request.post(`${config.prestaDemoApiUrl}/product_feature_values?ws_key=${process.env.PRESTA_WEB_TOKEN}`, {headers: { method: 'POST'
        }, body: xmlValuesSchema}, (err,res) => {
            console.log(res);
        })
    }
}