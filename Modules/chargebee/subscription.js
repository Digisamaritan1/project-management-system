const chargebee = require("chargebee");
const config = require("../../Config/config");

chargebee.configure({
    site : config.CHARGEBEE_SITE,
    api_key : config.CHARGEBEE_API_KEY
});


exports.getSubscriptionCard = (req,res) => {
    try {
        if (req.params.id === undefined) {
            res.status(400).json({message: 'id is required'});
            return;
        }
        chargebee.payment_source.retrieve(req.params.id).request(function(error,result) {
            if(error){
              res.status(400).json({message: error});
            }else{
                res.status(200).json(result);
            }
        });

    } catch (error) {
        res.status(400).json({message: error});
    }
};


exports.getSubscriptionTransection = (req,res) => {
    try {
        if (req.params.id === undefined) {
            res.status(400).json({message: 'id is required'});
            return;
        }
        chargebee.transaction.list({
            limit : 100,
            "subscription_id[is]" : req.params.id
        }).request(function(error,result) {
            if(error){
              res.status(400).json({message: error});
            }else{
                res.status(200).json(result);
            }
        });

    } catch (error) {
        res.status(400).json({message: error});
    }
};