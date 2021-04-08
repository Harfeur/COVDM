const {Application} = require('express');
const {Db} = require('mongodb');
const fs = require('fs');
const request = require('request');

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 */

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

module.exports = function (app, db, dirname) {

    app.get('/sitesPrelevements', (req, res) => {
        if (req.query.id_region) {
            db.collection('sites_prelevements').find({"adresse.codeRegion": req.query.id_region}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else {
            db.collection('sites_prelevements').find({}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        }
    });

    app.get('/regions', (req, res) => {
        db.collection('region').find({}).toArray((error, documents) => {
            if (error) res.status(500).send(error);
            res.send(documents);
        })
    });

    app.get('/image', (req, res) => {
        let urlLocale = dirname + '/streetview/' + req.query.id + '.jpg'
        try {
            if (fs.existsSync(urlLocale)) {
                res.sendFile(urlLocale);
            } else {
                db.collection('sites_prelevements').find({"_id": req.query.id}).toArray((error, documents) => {
                    if (error) res.status(500).send(error);
                    download(`https://maps.googleapis.com/maps/api/streetview?size=390x200&location=${documents[0].latitude},${documents[0].longitude}&key=${process.env.STREET_VIEW}`,
                        urlLocale, () => {
                            res.sendFile(urlLocale);
                        });
                })
            }
        } catch (err) {
            res.status(500);
        }

    })

}