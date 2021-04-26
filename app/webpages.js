const {Application} = require('express');
const {Db} = require('mongodb');

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 */

module.exports = function (app, db, dirname) {

    app.get('/', (req, res) => {
        res.sendFile(dirname + '/html/carte.html');
    });

    app.get('/batiment', (req, res) => {
        db.collection('sites_prelevements').find({"_id": req.query.id}).toArray((error, documents) => {
            if (error) res.status(500).send(error);
            res.render('popupPrelev', documents[0]);
        })
    });

    app.get('/vaccin', (req, res) => {
        db.collection('sites_vaccinations').find({"_id": parseInt(req.query.id)}).toArray((error, documents) => {
            if (error) res.status(500).send(error);
            res.render('popupVaccin', documents[0]);
        })
    });

    app.get('/stats', (req, res) => {
        res.sendFile(dirname + '/html/stats.html');
    });
}