const moment = require("moment");
const { getListOfProducts, getProductDetails, getProductDetailsById } = require("../../action-middlewares/products/action-products");
const { config } = require("../../config");
const { postRequest, doRequest, putRequest } = require("../../middlewares/doRequest");
const { parseXMLToJs } = require("../../middlewares/parser");
const fs = require('fs');
const { createImages } = require("../images/createImages");
const { default: slugify } = require("slugify");
const { logger, log } = require("../../logs/logger");



module.exports.createProduct = async () => {
    const products = await getListOfProducts(config.category_317);
    // const productDetails = await getProductDetails(config.category_317);
    // console.log(products[0].quantity)
    for await(product of products) { // CHANGE products.slice.... to products
        // console.log(product)
        try {
            if(product === undefined || product === null) {
                log('info', `POMIJAM PRODUKT (undefined)`)
                console.log('POMIJAM PRODUKT (undefined)')
            } else {             
                if(product.quantity == 0) {
                    log('info', `ADDING: ${product.productId} has quantity 0`)
                    console.log(`${product.productId} has quantity 0`);
                    await postProduct(product);
                } else {
                    await postProduct(product);
                }
            }
        } catch(err) {
            log('error', err)
        }
    }
}

const postProduct = async (product) => {
    return new Promise(async (resolve, reject) => {

        const details = await getProductDetailsById(product.productId);
        let htmlDesc = ``
        for(detail of details.sections) {
            htmlDesc += `<b>${detail.name}</b><ul>`
            for(attribute of detail.attributes) {
                htmlDesc += `<li>${attribute.name}: ${attribute.values[0]}</li>`
            }
            htmlDesc += `</ul><br><br>`
        }

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
                    <link_rewrite>
                    <language id="1"><![CDATA[${slugify(product.productName).length > 128 ? slugify(product.productName).slice(0, 128) : slugify(product.productName)}]]></language>
                    <language id="2"><![CDATA[${slugify(product.productName).length > 128 ? slugify(product.productName).slice(0, 128) : slugify(product.productName)}]]></language>
                     </link_rewrite>
                    <date_add><![CDATA[${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]]></date_add>
                    <date_upd><![CDATA[${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]]></date_upd>
                    <meta_description><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></meta_description>
                    <meta_keywords><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></meta_keywords>
                    <meta_title><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[${product.productId}]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[${product.productId}]]></language></meta_title>
                    <name><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[${product.productName.length > 128 ? product.productName.slice(0,128) : product.productName}]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[${product.productName.length > 128 ? product.productName.slice(0,128) : product.productName}]]></language></name>
                    <description>
                    <language id="1"><![CDATA[${htmlDesc}]]></language>
                    <language id="2"><![CDATA[${htmlDesc}]]></language>
                    </description>
                    <available_now><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></available_now>
                    <available_later><language id="1" xlink:href="http://localhost/presta-demo/api/languages/1"><![CDATA[]]></language><language id="2" xlink:href="http://localhost/presta-demo/api/languages/2"><![CDATA[]]></language></available_later>
                    <associations>
                    <categories nodeType="category" api="categories">
                        <category xlink:href="http://localhost/presta-demo/api/categories/${config.notebooks_category_number}">
                            <id><![CDATA[${config.notebooks_category_number}]]></id>
                        </category>
                    </categories>
                    </associations>
                </product>
            </prestashop>
        `

            const productReq = await postRequest(`${config.prestaDemoApiUrl}/products?ws_key=${process.env.PRESTA_WEB_TOKEN}`, xmlProductSchema);
            console.log(productReq);
            parseXMLToJs(productReq.body, async (err,result) => {
                try {
                    resolve(changeStockOfProduct(result.prestashop.product[0].id[0], product.quantity, product));
                    console.log(`added product (id: ${result.prestashop.product[0].id[0]}) ${productReq.statusCode}`)
                    log('info', `added product (id: ${result.prestashop.product[0].id[0]}) ${productReq.statusCode}`)
                } catch(err) {
                    console.log(result);
                    console.log(err);
                }
            })
    })
}

const changeStockOfProduct = async (productId, quantityOfProduct, productObject_action) => {
    return new Promise(async (resolve, reject) => {
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
                            log('info', `changed stock for product ${productIdInStock}, status: ${changeStockReq.statusCode}`)
                            resolve(await createImages(productObject_action.productId, productIdInStock));
                        }
                    } catch(err) {
                        log('error', err)
                    }
                })
            }
        })
    })
}