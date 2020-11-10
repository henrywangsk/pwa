
const util = {

    renderError: function(res, error) {
        res.render('error', {
            pageTitle: 'Error',
            error: error,
            pageID: 'error'
        });
    }

};

module.exports = util;