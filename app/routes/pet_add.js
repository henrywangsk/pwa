const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const https = require('https');
const util = require('../util/util');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//present Add Pet page to add a pet
router.get('/add', function(req, res) { renderUI(res, null, null) });

//request to create a pet
router.post('/pets', function(req, res) {

    console.log('request to create a pet: %j', req.body);

    const postData = JSON.stringify(req.body);
    // const postData = req.body;
    const options = {
        hostname: process.env.HOST_PET_SHELTER_API,
        port: process.env.PORT_PET_SHELTER_API,
        path: '/api/pets',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
    };

    //post data to PetShelterAPI service
    const petApiReq = https.request(options, (petApiRes) => {
        const statusCode = petApiRes.statusCode;

        console.log(`STATUS: ${statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(petApiRes.headers)}`);
        petApiRes.setEncoding('utf8');

        let rawData = '';
        petApiRes.on('data', (chunk) => { rawData += chunk; });
        petApiRes.on('end', () => {
            if (statusCode === 400) {
                renderUI(res, null, `Same Pet alread exists.`);
            } else {

              try {
                const parsedData = JSON.parse(rawData);
                console.log(parsedData);
                renderUI(res, `Your Pet has been added successfully. ID: ${parsedData}`, null);
              } catch (e) {
                console.error(e.message);
                util.renderError(res, 'Oops, please try it later.');
              }

            }

        });
    });

    petApiReq.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        util.renderError(res, 'Oops, please try it later.');
    });

    // write data to request body
    petApiReq.write(postData);
    petApiReq.end();
});

const renderUI = (res, info, err) => {
    res.render('pet_add', {
      pageTitle: 'Add Pet',
      infoMessage: info,
      errorMessage: err,
      pageID: 'pet_add'
    });
}

module.exports = router;
