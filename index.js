const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');

if (process.argv.includes('--dev')) require('dotenv').config()

const app = express();
let data = {
    regions: null,
    sites: null,
};

// CONFIGURATION ==================================
app.set('view engine', 'pug');
app.set('views', 'views/')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

async function init() {
    const db = (await mongo.MongoClient.connect(process.env.MONGO_URI, {useUnifiedTopology: true})).db('covdm');

    data.resetSites = function () {
        db.collection('sites_prelevements').find({}).toArray((error, documents) => {
            if (error) return;
            data.sites = documents;
        });
    }

    data.resetSites();

    // ROUTES =========================================
    require('./app/webpages.js')(app, db, __dirname);
    require('./app/getAPI.js')(app, db, __dirname, data);
    require('./app/postAPI.js')(app, db, __dirname, data);
    require('./app/static.js')(app, __dirname);

    // LAUNCH ========================================
    app.listen(process.env.PORT, function () {
        console.log("Serveur démarré sur le port " + process.env.PORT);
        console.log("URL : " + process.argv.includes('--dev') ? "http://localhost:" + process.env.PORT : "https://covdm.herokuapp.com")
    });
}

init();