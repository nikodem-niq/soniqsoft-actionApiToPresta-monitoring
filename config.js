require('dotenv').config();

module.exports.config = {
    baseUrl: 'https://api.action.pl/api/ade/v2',
    cdnUrl: 'https://cdn.action.pl/File.aspx?',
    prestaDemoApiUrl: 'http://localhost/presta-demo-v2/api',
    presta_host: 'http://localhost',
    presta_api_path: '/presta-demo-v2/api',
    prestaDemoWebServiceToken: process.env.PRESTA_WEB_TOKEN,
    headers: {
        method: 'get',
        CustomerId: process.env.CID,
        UserName: process.env.UID,
        ActionApiKey: process.env.ACTION_API_TOKEN,
        'accept': '/',
        'user-agent':'*' 
        
    },
    // prestaHeaders: 
    // {  'accept': '/',
    // 'user-agent':'*' },
    photos: {
        CID: process.env.CID,
        UID: process.env.UID,
        PID: process.env.PID,
    },
    category_317: `GetByCategory?CategoryId=317&Language=Polish`,
    notebooks_category_number: 3
}