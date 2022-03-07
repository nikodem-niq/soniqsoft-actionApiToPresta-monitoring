const { getProductDetails } = require('./action-middlewares/products/action-products');
const { createFeatures } = require('./prestashop-middlewares/features/createFeatures');


getProductDetails(`GetByCategory?CategoryId=317&Language=Polish`).then(res => {
    createFeatures(res);
})
