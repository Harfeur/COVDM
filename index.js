const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const stats = require('./app/stats.js');
const fetch = require('node-fetch');

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

function updateTests(db) {
    return new Promise((resolve, reject) => {
        fetch('https://dashboard.covid19.data.gouv.fr/data/code-FRA.json')
            .then(res => res.json())
            .then(r => {
                let i = r.length - 1;
                let date;
                while (!date && i !== 0) {
                    if (r[i].testsRealises) {
                        date = r[i].date
                    } else {
                        i--;
                    }
                }

                db.collection('region').find({}).toArray((err, docs) => {
                    if (err) reject(err);
                    else {
                        if (docs[0].properties.lastUpdate === date) resolve()
                        else {
                            console.log("Téléchargement des nouvelles données du gouvernement ...");
                            fetch(`https://dashboard.covid19.data.gouv.fr/data/date-${date}.json`)
                                .then(res => res.json())
                                .then(r => {
                                    r.forEach(data => {
                                        if (data.code.startsWith("REG")) {
                                            let idRegion = data.code.split("-")[1];
                                            let tests = data.testsRealises;
                                            db.collection('region').updateOne({"properties.code": idRegion},
                                                {$set: {"properties.color": tests, "properties.lastUpdate": date}});
                                        }
                                    });
                                    resolve();
                                });
                        }
                    }
                });
            })
            .catch(reject);
    });
}

async function init() {
    const db = (await mongo.MongoClient.connect(process.env.MONGO_URI, {useUnifiedTopology: true})).db('covdm');

    await updateTests(db);

    /**
     * CODE À UTILISER POUR RESET LES STATS ET LES RECALCULER
     * Peut prendre plusieurs minutes à se calculer
     */
    // await stats.updateAll(db);

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