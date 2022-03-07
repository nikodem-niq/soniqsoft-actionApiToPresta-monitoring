require('dotenv').config();

module.exports.config = {
    baseUrl: 'https://api.action.pl/api/ade/v2',
    cdnUrl: 'https://cdn.action.pl/File.aspx?',
    prestaDemoApiUrl: 'http://localhost/presta-demo/api',
    prestaDemoWebServiceToken: process.env.PRESTA_WEB_TOKEN,
    headers: {
        method: 'get',
        CustomerId: 77176,
        UserName: 'test01',
        ActionApiKey: process.env.ACTION_API_TOKEN,
        
    },
    photos: {
        CID: 77176,
        UID: 'test01',
        PID: '6d09e5344a0617d911131949199b419b',
    }
}