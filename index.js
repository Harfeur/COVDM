const express = require('express');
const mongo = require('mongodb');

if (process.argv.includes('--dev')) require('dotenv').config()

const app = express();

// CONFIGURATION ==================================
app.set('view engine', 'pug');
app.set('views', 'views/')

// ROUTES =========================================



// LAUNCH ========================================
async function init() {
    const db = (await mongo.MongoClient.connect(process.env.MONGO_URI)).db('covdm');
    require('./app/webpages.js')(app, db, __dirname);
    require('./app/getAPI.js')(app, db, __dirname);
    require('./app/postAPI.js')(app, db, __dirname);
    require('./app/static.js')(app, __dirname);


    app.listen(process.env.PORT, function () {
        console.log("Serveur démarré sur le port " + process.env.PORT);
    });
}

init();