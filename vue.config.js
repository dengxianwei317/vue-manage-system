module.exports = {
    baseUrl: './',
    assetsDir: 'static',
    productionSourceMap: false,
    devServer: {
        proxy: {
            '/api':{
                target:'http://localhost:9090',
                changeOrigin:true,
                pathRewrite:{
                    '^/api': '/'
                }
            }
        }
    }
}