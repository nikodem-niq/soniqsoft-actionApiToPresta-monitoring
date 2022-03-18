const { hourlyJob, monitorTest } = require('./monitoring/monitorProduct');
const { createProduct } = require('./prestashop-middlewares/products/createProduct');


// Check for argvs
const Args = process.argv.slice(2);
if(Args) {
    switch(Args[0]) {
        case 'create_product':
            createProduct();
            break;
        case 'monitor_start':
            hourlyJob.start();
            // monitorTest();
            break;
        default:
            console.log(`no args specified`);
            break;
    }
}
