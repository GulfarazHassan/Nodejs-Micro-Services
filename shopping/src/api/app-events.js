const ShopService = require('../services/shopping-service')

module.exports = (app) => {
    const service = new ShopService();
    app.use('/app-events', (req, res, next) => {
        const { payload } = req.body;
        service.SubscribeEvents(payload)
        console.log('==========  Shopping Service received Event ==========')
        return res.status(200).json(payload);
    });
}