const express = require('express');
const dotenv = require('dotenv');
const app = express();

//load local environment variables from .env which can be accessed by using process.env.blabla
https://medium.com/@rafaelvidaurre/managing-environment-variables-in-node-js-2cb45a55195f
dotenv.load();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.locals.siteTitle = 'Pet Weather App';

app.use(express.static('app/public'));
app.use(require('./routes/pet_list'));
app.use(require('./routes/pet_view'));
app.use(require('./routes/pet_add'));

const server = app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});

if (process.env.NODE_ENV === 'dev') {
    const reload = require('reload');
    reload(server, app);
}

