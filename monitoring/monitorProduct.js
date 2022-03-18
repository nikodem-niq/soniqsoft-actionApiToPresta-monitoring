const { CronJob } = require("cron");
const { getListOfProducts } = require("../action-middlewares/products/action-products");
const { config } = require("../config");
const { log } = require("../logs/logger");
const { putRequest } = require("../middlewares/doRequest");
const { parseDataToXML } = require("../middlewares/parser");
const { retrieveProducts, retrieveProductById } = require('../prestashop-middlewares/products/retrieveProducts');
const { retrieveStockById } = require("../prestashop-middlewares/stocks/retrieveStocks");

module.exports.hourlyJob = new CronJob('0 * * * *', async () => {
    log('info', 'STARTING CRON JOB!');
    console.log('STARTING CRON JOB!');
    const actionProductsDetails = []; // array of objects (id, price, quantity)
    const diffArray = [];
    const actionProducts = await getListOfProducts(config.category_317);
    for await(actionProduct of actionProducts) {
        actionProductsDetails.push({id: actionProduct.productId, price: actionProduct.price, quantity: actionProduct.quantity});
    }


    retrieveProducts(async (result) => {
        for await(product of result) {
            const { id } = product['$'];
            await retrieveProductById(id, async (searchedProduct) => {
                // FIND QUANTITY BY STOCK_AVAILABLES
                await retrieveStockById(id, async (searchedStock) => {
                    const quantity = searchedStock[0].quantity[0]

                    const { _ } = searchedProduct[0].meta_title[0].language[0];
                    const { price } = searchedProduct[0];
                    await compareProducts({_prestaId: id, id: _, price, quantity}, searchedProduct, searchedStock);
                })
            })
        }
    })

    const compareProducts = (prestaProduct, product, stock) => {
        return new Promise(async (resolve, reject) => {
            for(let i=0; i<actionProductsDetails.length; i++) {
                if(actionProductsDetails[i].id == prestaProduct.id) {
                    // CHANGE PRICE OF PRODUCT
                    if(actionProductsDetails[i].price != prestaProduct.price) {
                        const productToChange = product[0];
                        productToChange.price = actionProductsDetails[i].price;
                        const parsedXML = await parseDataToXML(productToChange);
                        log('info', `different price - PRESTA ${prestaProduct.id} - ${prestaProduct.price}/ id in PRESTA: ${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id} - ${actionProductsDetails[i].price} `)
                        console.log(`different price - PRESTA ${prestaProduct.id} - ${prestaProduct.price}/${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id} - ${actionProductsDetails[i].price} `)
                        const putReqPrice = await putRequest(`${config.prestaDemoApiUrl}/products/${prestaProduct._prestaId}?ws_key=${process.env.PRESTA_WEB_TOKEN}`, parsedXML)
                        if(putReqPrice.statusCode == 200) {
                            log('info', `changed price (id: ${prestaProduct._prestaId}) ${putReqPrice.statusCode}`);
                            resolve(`changed price (id: ${prestaProduct._prestaId}) ${putReqPrice.statusCode}`);
                        } else {
                            console.log(`error: ${err}`);
                            log('error', `${err}`)
                            reject(`error with price change ${prestaProduct._prestaId}`);
                        }
                    }
                    // CHANGE STOCK OF PRODUCT
                    if(actionProductsDetails[i].quantity != prestaProduct.quantity) {
                        const stockToChange = stock;
                        stockToChange[0].quantity[0] = actionProductsDetails[i].quantity.toString();
                        const parsedXML = await parseDataToXML(stockToChange);
                        console.log(`different quantity at ${i+1} - PRESTA ${prestaProduct.id}/id presta:${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
                        log('info', `different quantity at - PRESTA ${prestaProduct.id}/id presta:${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)

                        const putReqStock = await putRequest(`${config.prestaDemoApiUrl}/stock_availables/${prestaProduct._prestaId}?ws_key=${process.env.PRESTA_WEB_TOKEN}`, parsedXML)
                        if(putReqStock.statusCode == 200) {
                            log('info', `changed stock (id: ${prestaProduct._prestaId}) ${putReqStock.statusCode}`)
                            resolve(`changed stock (id: ${prestaProduct._prestaId}) ${putReqStock.statusCode}`);
                        } else {
                            log('error', `error with quantity change ${prestaProduct._prestaId}`)
                            reject(`error with quantity change ${prestaProduct._prestaId}`);
                        }
                    }
                    log('info', `item ${prestaProduct._prestaId} passed tests - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
                    console.log(`item ${prestaProduct._prestaId} passed tests - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
                    resolve(`item ${prestaProduct._prestaId} passed tests - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
                }
            }
        })
    }
})

// module.exports.monitorTest = async () => {
//     const actionProductsDetails = []; // array of objects (id, price, quantity)
//     const diffArray = [];
//     const actionProducts = await getListOfProducts(config.category_317);
//     for await(actionProduct of actionProducts) {
//         actionProductsDetails.push({id: actionProduct.productId, price: actionProduct.price, quantity: actionProduct.quantity});
//     }


//     retrieveProducts(async (result) => {
//         for await(product of result) {
//             const { id } = product['$'];
//             await retrieveProductById(id, async (searchedProduct) => {
//                 // FIND QUANTITY BY STOCK_AVAILABLES
//                 await retrieveStockById(id, async (searchedStock) => {
//                     const quantity = searchedStock[0].quantity[0]

//                     const { _ } = searchedProduct[0].meta_title[0].language[0];
//                     const { price } = searchedProduct[0];
//                     await compareProducts({_prestaId: id, id: _, price, quantity}, searchedProduct, searchedStock);
//                 })
//             })
//         }
//     })

//     const compareProducts = (prestaProduct, product, stock) => {
//         return new Promise(async (resolve, reject) => {
//             for(let i=0; i<actionProductsDetails.length; i++) {
//                 if(actionProductsDetails[i].id == prestaProduct.id) {
//                     // CHANGE PRICE OF PRODUCT
//                     if(actionProductsDetails[i].price != prestaProduct.price) {
//                         const productToChange = product[0];
//                         productToChange.price = actionProductsDetails[i].price;
//                         const parsedXML = await parseDataToXML(productToChange);
//                         log('info', `different price - PRESTA ${prestaProduct.id} - ${prestaProduct.price}/ id in PRESTA: ${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id} - ${actionProductsDetails[i].price} `)
//                         console.log(`rozna cena na na pozycji ${i+1} - PRESTA ${prestaProduct.id} - ${prestaProduct.price}/${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id} - ${actionProductsDetails[i].price} `)
//                         const putReqPrice = await putRequest(`${config.prestaDemoApiUrl}/products/${prestaProduct._prestaId}?ws_key=${process.env.PRESTA_WEB_TOKEN}`, parsedXML)
//                         if(putReqPrice.statusCode == 200) {
//                             log('info', `changed cene (id: ${prestaProduct._prestaId}) ${putReqPrice.statusCode}`);
//                             resolve(`changed cene (id: ${prestaProduct._prestaId}) ${putReqPrice.statusCode}`);
//                         } else {
//                             console.log(`error: ${err}`);
//                             log('error', `${err}`)
//                             reject(`error przy zmianie ceny produktu ${prestaProduct._prestaId}`);
//                         }
//                     }
//                     // CHANGE STOCK OF PRODUCT
//                     if(actionProductsDetails[i].quantity != prestaProduct.quantity) {
//                         const stockToChange = stock;
//                         stockToChange[0].quantity[0] = actionProductsDetails[i].quantity.toString();
//                         const parsedXML = await parseDataToXML(stockToChange);
//                         console.log(`rozna ilosc na pozycji ${i+1} - PRESTA ${prestaProduct.id}/id presta:${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
//                         log('info', `rozna ilosc - PRESTA ${prestaProduct.id}/id presta:${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)

//                         const putReqStock = await putRequest(`${config.prestaDemoApiUrl}/stock_availables/${prestaProduct._prestaId}?ws_key=${process.env.PRESTA_WEB_TOKEN}`, parsedXML)
//                         if(putReqStock.statusCode == 200) {
//                             log('info', `changed stock (id: ${prestaProduct._prestaId}) ${putReqStock.statusCode}`)
//                             resolve(`changed stock (id: ${prestaProduct._prestaId}) ${putReqStock.statusCode}`);
//                         } else {
//                             log('error', `error with quantity change ${prestaProduct._prestaId}`)
//                             reject(`error with quantity change ${prestaProduct._prestaId}`);
//                         }
//                     }
//                     log('info', `item ${prestaProduct._prestaId} passed tests - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
//                     console.log(`item ${prestaProduct._prestaId} passed tests - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
//                     resolve(`item ${prestaProduct._prestaId} passed tests - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
//                 }
//             }
//         })
//     }
// }
