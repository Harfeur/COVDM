const {Application} = require('express');
const {Db} = require('mongodb');

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 */

module.exports = function (app, db, dirname) {

    app.get('/sitesPrelevements', (req, res) => {
        db.collection('sites_prelevements').find({}).toArray((error, documents) => {
            if (error) res.status(500).send(error);
            res.send(documents);
        })
    })

}