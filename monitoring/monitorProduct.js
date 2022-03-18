const { CronJob } = require("cron");
const { getListOfProducts } = require("../action-middlewares/products/action-products");
const { config } = require("../config");
const { putRequest } = require("../middlewares/doRequest");
const { parseDataToXML } = require("../middlewares/parser");
const { retrieveProducts, retrieveProductById } = require('../prestashop-middlewares/products/retrieveProducts');
const { retrieveStockById } = require("../prestashop-middlewares/stocks/retrieveStocks");


module.exports.everyOneSecJob = new CronJob('* * * * *', async () => {
    // actionProductsDetails = []; // array of objects (id, price, quantity)
    // const actionProducts = await getListOfProducts(config.category_317);
    // for await(actionProduct of actionProducts) {
    //     actionProductsDetails.push({id: actionProduct.productId, price: actionProduct.price, quantity: actionProduct.quantity});
    // }


    retrieveProducts((result) => {
        console.log(result);
        // for await(product of result)
    })
})

module.exports.monitorTest = async () => {
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
                    // prestaProductsDetails.push({_prestaId: product['$'].id, id: _, price, quantity})
                    // console.log({_prestaId: product['$'].id, id: _, price, quantity});
                    // console.log(product['$'].id)
                    const res = await compareProducts({_prestaId: id, id: _, price, quantity}, searchedProduct, searchedStock);
                    console.log(res);
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

                        console.log(`rozna cena na na pozycji ${i+1} - PRESTA ${prestaProduct.id} - ${prestaProduct.price}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id} - ${actionProductsDetails[i].price} `)
                        try {
                            const putReqPrice = await putRequest(`${config.prestaDemoApiUrl}/products/${prestaProduct._prestaId}?ws_key=${process.env.PRESTA_WEB_TOKEN}`, parsedXML)
                            if(putReqPrice.statusCode == 200) {
                                resolve(`Zmieniono cene (id: ${prestaProduct._prestaId}) ${putReqPrice.statusCode}`);
                            }
                        } catch(err) {
                            console.log(`error: ${err}`);
                            reject(`Blad przy zmianie ceny produktu ${prestaProduct._prestaId}`);
                        }
                    }
                    // CHANGE STOCK OF PRODUCT
                    if(actionProductsDetails[i].quantity != prestaProduct.quantity) {
                        console.log(`ID W PRESCIE: ${prestaProduct._prestaId} w prescie ${prestaProduct.quantity} a w action ${actionProductsDetails[i].quantity}`)
                        const stockToChange = stock;
                        stockToChange[0].quantity[0] = actionProductsDetails[i].quantity.toString();
                        const parsedXML = await parseDataToXML(stockToChange);
                        console.log(`rozna ilosc na pozycji ${i+1} - PRESTA ${prestaProduct.id}//id presta:${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)

                        const putReqStock = await putRequest(`${config.prestaDemoApiUrl}/stock_availables/${prestaProduct._prestaId}?ws_key=${process.env.PRESTA_WEB_TOKEN}`, parsedXML)
                        console.log(putReqStock.body)
                        if(putReqStock.statusCode == 200) {
                            resolve(`Zmieniono stock (id: ${prestaProduct._prestaId}) ${putReqStock.statusCode}`);
                        } else {
                            reject(`Blad przy zmianie ilosci produktu ${prestaProduct._prestaId}`);
                        }
                    }
                    resolve(`WSZYSTKO TO SAMO - na pozycji ${i+1} - PRESTA ${prestaProduct.id}//${prestaProduct._prestaId}, ACTION ${actionProductsDetails[i].id}`)
                }
            }
        })
    }
}
