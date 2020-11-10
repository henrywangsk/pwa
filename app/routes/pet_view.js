const express = require('express');
const router = express.Router();
const https = require('https');
const util = require('../util/util');

const googleGeoUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng';
const darkSkyUrl = 'https://api.darksky.net/forecast';
const darkSkyOptParams = 'exclude=minutely,hourly,daily,alerts,flags&units=si';

let myPet = {};
let responseFinal;

router.get('/pets/:petID', function(req, res) {
    console.log(`pet ID: ${req.params.petID}`);
    responseFinal = res;

    const options = {
        hostname: process.env.HOST_PET_SHELTER_API,
        port: process.env.PORT_PET_SHELTER_API,
        path: `/api/pets/${req.params.petID}`
    };

    //request pet data from PetShelterAPI service and render
    https.get(options, processShelterAPIRes)
    .on('error', (e) => {
        console.error(e);
        renderError();
     });

});

const processShelterAPIRes = function(apiRes) {
      console.log('statusCode:', apiRes.statusCode);
      console.log('headers:', apiRes.headers);
  
      apiRes.setEncoding('utf8');
      let rawData = '';
      apiRes.on('data', (chunk) => { rawData += chunk; });
      apiRes.on('end', () => {
          try {
            const petInfo = JSON.parse(rawData);
            console.log(petInfo);

            myPet.name = petInfo.name;
            myPet.type = petInfo.type;
            myPet.breed = petInfo.breed;
            myPet.latitude = petInfo.latitude;
            myPet.longitude = petInfo.longitude;

            getGeoInfo(populateGeo);

          } catch (e) {
            console.error(`process response from PetShelterAPI error: %j`, e);
            renderError();
          }
      });
}

const GEO_CACHE = {};
const getGeoInfo = function(next) {
    const cachedLocation = GEO_CACHE[`${myPet.latitude},${myPet.longitude}`];
    if (cachedLocation) {
        console.log(`retrieve location from cache: ${cachedLocation}`);
        return next({cachedLocation: cachedLocation});
    }

    const googleGeocodeAPI = `${googleGeoUrl}=${myPet.latitude},${myPet.longitude}&key=${process.env.GOOGLE_API_KEY}`;
    https.get(googleGeocodeAPI, function(geocodeRes) {
        console.log('geocode statusCode:', geocodeRes.statusCode);
    
        geocodeRes.setEncoding('utf8');
        let rawData = '';
        geocodeRes.on('data', (chunk) => { rawData += chunk; });
        geocodeRes.on('end', () => {
            try {
              const parsedData = JSON.parse(rawData);
              next(parsedData);
            } catch (e) {
              console.error(`getGeoInfo parsedData error: %j`, e);
              renderError();
            }
        });
    })
    .on('error', (e) => {
        console.error(`getGeoInfo onerror : %j`, e);
        renderError();
    });
}

const populateGeo = function(geoInfo) {
    if (geoInfo.cachedLocation) {
        myPet.location = geoInfo.cachedLocation;
    } else {
        console.log(`populateGeo geoInfo: %j`, geoInfo);

        let city = '';
        let area = '';

        const arr_address_comp = geoInfo.results[0].address_components;

        arr_address_comp.forEach(function(val) {
            if(val.types[0] === "locality" ){
              city = val.long_name;
            }
            if(val.types[0] === "administrative_area_level_1" ){
                area = val.short_name;
            }
        });

        const theLocation = `${city}, ${area}`;
        GEO_CACHE[`${myPet.latitude},${myPet.longitude}`] = theLocation;

        myPet.location = theLocation;
    }

      console.log('going to fetch weather info ...');
      getWeatherInfo(populateWeatherInfo);
}

const getWeatherInfo = function(next) {
    console.log('getWeatherInfo begin ...');

    const darkSkyAPI = `${darkSkyUrl}/${process.env.DARKSKY_API_KEY}/${myPet.latitude},${myPet.longitude}?${darkSkyOptParams}`;
    
    https.get(darkSkyAPI, function(darkskyRes) {
        console.log('darkskyRes statusCode:', darkskyRes.statusCode);
    
        darkskyRes.setEncoding('utf8');
        let rawData = '';
        darkskyRes.on('data', (chunk) => { rawData += chunk; });
        darkskyRes.on('end', () => {
            try {
              const parsedData = JSON.parse(rawData);

              //populateWeatherInfo
              next(parsedData);
            } catch (e) {
              console.error(`getWeatherInfo parsedData: %j`, e);
              renderError();
            }
        });
    })
    .on('error', (e) => {
        console.error(`getWeatherInfo onerror : %j`, e);
        renderError();
    });
}

const SHELTER_WEATHER = ['rain', 'snow', 'wind', 'hail', 'thunderstorm', 'tornado'];
const populateWeatherInfo = function(weatherInfo) {
      console.log(`weatherInfo: %j`, weatherInfo);

      myPet.needShelter = false;
      myPet.weather = '';
      myPet.picPrefix = 'normal';

      if (weatherInfo) {
          myPet.weather = weatherInfo.currently.summary;

          /*
              https://darksky.net/dev/docs#data-point-object
              machine-readable text summary of this data point
           */
          const weatherIcon = weatherInfo.currently.icon;
          if(['rain', 'snow', 'wind'].includes(weatherIcon)) {
              myPet.picPrefix = weatherIcon;
          } else if (['hail', 'thunderstorm', 'tornado'].includes(weatherIcon)) {
              myPet.picPrefix = 'wind';
          }

          myPet.needShelter = SHELTER_WEATHER.includes(weatherIcon);
      }

      renderUI();
}

const renderUI = function() {
    responseFinal.render('pet_view', {
      pageTitle: 'View Pet',
      pageID: 'pet_view',
      pet: myPet
    });
}

const renderError = function() {
    util.renderError(responseFinal, 'Oops, please try it later.');
}

module.exports = router;
