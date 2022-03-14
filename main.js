const { getProductDetails, getListOfProducts } = require('./action-middlewares/products/action-products');

const { createFeatures } = require('./prestashop-middlewares/features/createFeatures');
const { retrieveFeatures, retrieveFeatureValues, retrieveFeatureById, retrieveFeatureValueById } = require('./prestashop-middlewares/features/retrieveFeatures');
const { testShow } = require('./prestashop-middlewares/images/createImages');

const { createProduct } = require('./prestashop-middlewares/products/createProduct');
const { retrieveProducts, retrieveProductById } = require('./prestashop-middlewares/products/retrieveProducts');


// getProductDetails(`GetByCategory?CategoryId=317&Language=Polish`).then(res => {
//     createFeatures(res);
// })

// retrieveFeatureValueById(1,(result) => {
//     console.log(result);
// });

// getListOfProducts(`GetByCategory?CategoryId=317&Language=Polish`).then(res => {

//     console.log(res)
// });

// getProductDetails(`GetByCategory?CategoryId=317&Language=Polish`).then(res => {
//     console.log(res[0]);
// })

// testShow('MOBACENOT1995');

// retrieveProductById(33,(result) => {
//     console.log(result);
// })

createProduct();
