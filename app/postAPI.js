const {Application} = require('express');
const {Db} = require('mongodb');

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 */

module.exports = function (app, db, dirname, data) {

    app.post('/ajoutCommentaire', (req, res) => {
        console.log(req.body)
        if (req.body.nom && req.body.email && req.body.id && req.body.note) {
            const filter = {"_id": req.body.id};
            if (req.body.attente !== undefined) {
                db.collection('sites_prelevements').updateOne(filter, {$push: {"stats.attente": req.body.attente}});
            }
            if (req.body.bonDeroulement !== undefined) {
                if (req.body.bonDeroulement)
                    db.collection('sites_prelevements').updateOne(filter, {$inc: {"stats.bonDeroulement.oui": 1}});
                else
                    db.collection('sites_prelevements').updateOne(filter, {$inc: {"stats.bonDeroulement.non": 1}});
            }
            db.collection('sites_prelevements').updateOne(filter, {
                $push: {
                    "avis": {
                        "nom": req.body.nom,
                        "email": req.body.email,
                        "message": req.body.message === "" ? "Pas de commentaire" : req.body.message,
                        "note": req.body.note
                    }
                }
            }).then(() => {
                res.send("Ok");
                data.sites = null;
            }).catch(err => {
                res.status(500);
                console.error(err);
            })
        } else {
            res.status(500);
        }
    });

}