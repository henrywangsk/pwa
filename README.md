# Pet Weather App
Pet Weather App - a showcase of a web application based on Node.js


## To set up on a local machine

- Download and Install Node.js https://nodejs.org/en/

- Checkout the latest code https://github.com/henry-wxf/pwa.git

- Go to the pwa directory (the root of the code directory), create a file named .env and set these variables (replace the following 2 API Keys with yours, see https://developers.google.com/maps/documentation/javascript/tutorial?hl=en_US
  and https://darksky.net/dev/docs):
```
HOST_PET_SHELTER_API=henry-pet-shelter-api.herokuapp.com
PORT_PET_SHELTER_API=443
GOOGLE_API_KEY=<replace_with_your_key>
DARKSKY_API_KEY=<replace_with_your_key>
```

- Then run:
```
npm install
npm start
```

- Play with it http://localhost:3000/


## Play the live instance on [HeroKu](https://henry-pet-weather-app.herokuapp.com/)
