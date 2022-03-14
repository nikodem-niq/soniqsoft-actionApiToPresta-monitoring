const moment = require("moment");
const { getListOfProducts, getProductDetails } = require("../../action-middlewares/products/action-products");
const { config } = require("../../config");
const { postRequest, doRequest, putRequest } = require("../../middlewares/doRequest");
const { parseXMLToJs } = require("../../middlewares/parser");
const fs = require('fs');
const { createImages } = require("../images/createImages");



module.exports.createProduct = async () => {
    const products = await getListOfProducts(config.category_317);
    // console.log(products.slice(0,3));
    // const productDetails = await getProductDetails(config.category_317);
    for await(product of products.slice(0,1)) {
        try {
            postProduct(product);
            // console.log(product)
        } catch(err) {
            fs.createWriteStream('./logs/logs.txt').write(toString(err));
        }
    }
}

const postProduct = async (product) => {
    const xmlProductSchema = `
        <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
            <product>
                <id_category_default><![CDATA[3]]></id_category_default>
                <width><![CDATA[${product.sizeX}]]></width>
                <height><![CDATA[${product.sizeY}]]></height>
                <depth><![CDATA[${product.sizeZ}]]></depth>
                <weight><![CDATA[${product.weight}]]></weight>
                <ean13><![CDATA[${product.ean}]]></ean13>
                <price><![CDATA[${product.price}]]></price>
                <active><![CDATA[1]]></active>
                <available_for_order><![CDATA[1]]></available_for_order>
                <state><![CDATA[1]]></state>
                <condition><![CDATA[new]]></condition>
                <show_price><![CDATA[1]]></show_price>
                <indexed><![CDATA[1]]></indexed>
                <visibility><![CDATA[both]]></visibility>
                <date_add><![CDATA[${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]]></date_add>
                <date_upd><![CDATA[${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]]></date_upd>
                <meta_description><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></meta_description>
                <meta_keywords><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></meta_keywords>
                <meta_title><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></meta_title>
                <name><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[${product.productName}]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[${product.name}]]></language></name>
                <description><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[<p>The best is yet to come! Start the day off right with a positive thought. 8,2cm diameter / 9,5cm height / 0.43kg. Dishwasher-proof.</p>]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[<p>The best is yet to come! Start the day off right with a positive thought. 8,2cm diameter / 9,5cm height / 0.43kg. Dishwasher-proof.</p>]]></language></description>
                <description_short><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[<p>White Ceramic Mug, 325ml.</p>]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[<p>White Ceramic Mug, 325ml.</p>]]></language></description_short>
                <available_now><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></available_now>
                <available_later><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></available_later>
                <associations>
                <categories nodeType="category" api="categories">
                    <category xlink:href="http://localhost/presta-demo/api/categories/3">
                        <id><![CDATA[3]]></id>
                    </category>
                </categories>
                </associations>
            </product>
        </prestashop>
    `

    const productReq = await postRequest(`${config.prestaDemoApiUrl}/products?ws_key=${process.env.PRESTA_WEB_TOKEN}`, xmlProductSchema);
    parseXMLToJs(productReq.body, async (err,result) => {
        // console.log(productReq.statusCode)
        console.log(`added product (id: ${result.prestashop.product[0].id[0]}) ${productReq.statusCode}`)
        changeStockOfProduct(result.prestashop.product[0].id[0], product.quantity, product)
    })
}

const changeStockOfProduct = async (productId, quantityOfProduct, productObject_action) => {
    const availableStock = await doRequest(`${config.prestaDemoApiUrl}/stock_availables?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
    parseXMLToJs(availableStock.body, async (err,result) => {
        const stockAvailablesArray = [];
        for(i of result.prestashop.stock_availables[0].stock_available) {
            stockAvailablesArray.push(i);
        }
        for(let j=0; j<stockAvailablesArray.length; j++) {
            const searchedStock = await doRequest(`${config.prestaDemoApiUrl}/stock_availables/${stockAvailablesArray[j]['$'].id}?ws_key=${process.env.PRESTA_WEB_TOKEN}`);
            parseXMLToJs(searchedStock.body, async (err,result_2) => {
                try {
                    // ID OF PRODUCT IN STOCK RESOURCE
                    const productIdInStock = result_2.prestashop.stock_available[0].id_product[0]['_'];
                    if(productId == productIdInStock) {
                        const xmlStockSchema = `
                        <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
                        <stock_available>
                            <id><![CDATA[${stockAvailablesArray[j]['$'].id}]]></id>
                            <id_product><![CDATA[${productIdInStock}]]></id_product>
                            <id_product_attribute><![CDATA[0]]></id_product_attribute>
                            <id_shop><![CDATA[1]]></id_shop>
                            <id_shop_group><![CDATA[0]]></id_shop_group>
                            <quantity><![CDATA[${quantityOfProduct}]]></quantity>
                            <depends_on_stock><![CDATA[0]]></depends_on_stock>
                            <out_of_stock><![CDATA[2]]></out_of_stock>
                            <location></location>
                        </stock_available>
                        </prestashop>
                    `
                        const changeStockReq = await putRequest(`${config.prestaDemoApiUrl}/stock_availables?ws_key=${process.env.PRESTA_WEB_TOKEN}`, xmlStockSchema);
                        console.log(`changed stock for product ${productIdInStock}, status: ${changeStockReq.statusCode}`);
                        createImages(productObject_action.productId, productIdInStock)
                    }
                } catch(err) {
                    fs.createWriteStream('./logs/logs.txt').write(toString(err));
                }
            })
        }
    })
}