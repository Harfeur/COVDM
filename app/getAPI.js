const {Application} = require('express');
const {Db} = require('mongodb');
const fs = require('fs');
const request = require('request');

// Télécharge une image depuis internet
function download(uri, filename, callback) {
    request.head(uri, () => {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 * @param {Object} data Mémoire cache
 */

module.exports = function (app, db, dirname, data) {

    app.get('/sitesPrelevements', (req, res) => {
        if (req.query.id_region) {
            db.collection('sites_prelevements').find({"adresse.codeRegion": req.query.id_region.toString()}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else if (req.query.id_departement) {
            db.collection('sites_prelevements').find({"adresse.codeDepartement": req.query.id_departement.toString()}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else {
            if (data.sites) res.send(data.sites);
            else db.collection('sites_prelevements').find({}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                data.sites = documents;
                res.send(documents);
            })
        }
    });

    app.get('/sitesVaccinations', (req, res) => {
        if (req.query.id_region) {
            db.collection('sites_vaccinations').find({"adresse.codeRegion": req.query.id_region.toString()}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else if (req.query.id_departement) {
            db.collection('sites_vaccinations').find({"adresse.codeDepartement": req.query.id_departement.toString()}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else {
            if (data.vacc) res.send(data.vacc);
            else db.collection('sites_vaccinations').find({}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                data.vacc = documents;
                res.send(documents);
            })
        }
    });

    app.get('/regions', (req, res) => {
        if (data.regions) res.send(data.regions);
        else db.collection('region').find({}).toArray((error, documents) => {
            if (error) res.status(500).send(error);
            data.regions = documents;
            res.send(documents);
        })
    });

    app.get('/departements', (req, res) => {
        if (req.query.id_region) {
            db.collection('departement').find({"properties.codeRegion": req.query.id_region}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else if (req.query.id_departement) {
            db.collection('departement').find({"properties.code": req.query.id_departement.toString()}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        } else {
            db.collection('departement').find({}).toArray((error, documents) => {
                if (error) res.status(500).send(error);
                res.send(documents);
            })
        }
    })

    app.get('/image', (req, res) => {
        let urlLocale = dirname + '/streetview/' + req.query.id + '.jpg'
        try {
            if (fs.existsSync(urlLocale)) {
                res.sendFile(urlLocale);
            } else {
                if (isNaN(req.query.id)) {
                    db.collection('sites_prelevements').find({"_id": req.query.id}).toArray((error, documents) => {
                        if (error) res.status(500).send(error);
                        console.log(`Téléchargement d'une image depuis Google Street pour le lieu ${req.body.id}`)
                        download(`https://maps.googleapis.com/maps/api/streetview?size=390x200&location=${documents[0].latitude},${documents[0].longitude}&key=${process.env.STREET_VIEW}`,
                            urlLocale, () => {
                                res.sendFile(urlLocale);
                            });
                    });
                } else {
                    db.collection('sites_vaccinations').find({"_id": req.query.id}).toArray((error, documents) => {
                        if (error) res.status(500).send(error);
                        console.log(`Téléchargement d'une image depuis Google Street pour le lieu ${req.body.id}`)
                        download(`https://maps.googleapis.com/maps/api/streetview?size=390x200&location=${documents[0].latitude},${documents[0].longitude}&key=${process.env.STREET_VIEW}`,
                            urlLocale, () => {
                                res.sendFile(urlLocale);
                            });
                    });
                }

            }
        } catch (err) {
            res.status(500);
        }
    })

}