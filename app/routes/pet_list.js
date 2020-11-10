const express = require('express');
const router = express.Router();
const https = require('https');
const util = require('../util/util');

router.get('/', function(req, res) {
    console.log(`API HOST: ${process.env.HOST_PET_SHELTER_API}`);

    const options = {
        hostname: process.env.HOST_PET_SHELTER_API,
        port: process.env.PORT_PET_SHELTER_API,
        path: '/api/pets'
    };

    //request pet data from PetShelterAPI service and render
    https.get(options,

        (apiRes) => {
            console.log('statusCode:', apiRes.statusCode);
            console.log('headers:', apiRes.headers);
        
            apiRes.setEncoding('utf8');
            let rawData = '';
            apiRes.on('data', (chunk) => { rawData += chunk; });
            apiRes.on('end', () => {
                try {
                  const parsedData = JSON.parse(rawData);
                  console.log(parsedData);
                  renderData(parsedData);
                } catch (e) {
                  console.error(e.message);
                  util.renderError(res, 'Oops, please try it later.');
                }
            });

        })

    .on('error', (e) => {
        console.error(e);
        util.renderError(res, 'Oops, please try it later.');
     });

    const renderData = function(pets) {
        res.render('pet_list', {
            pageTitle: 'Home',
            pets: pets,
            pageID: 'pet_list',
            googleMapApiKey: process.env.GOOGLE_API_KEY
        });
    };

});

module.exports = router;
