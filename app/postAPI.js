const {Application} = require('express');
const {Db} = require('mongodb');

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 */

module.exports = function (app, db, dirname) {

    app.post('/ajoutCommentaire', (req, res) => {
        if (req.body.nom && req.body.email && req.body.id && req.body.note) {
            const filter = {"_id": id};
            if (req.body.attente !== undefined) {
                db.updateOne(filter, {$push: {"stats.attente": req.body.attente}});
            }
            if (req.body.bonDeroulement !== undefined) {
                if (req.body.bonDeroulement)
                    db.updateOne(filter, {$inc: {"stats.bonDeroulement.oui": 1}});
                else
                    db.updateOne(filter, {$inc: {"stats.bonDeroulement.non": 1}});
            }
            db.updateOne(filter, {
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
            }).catch(err => {
                res.status(500);
                console.error(err);
            })
        } else {
            res.status(500);
        }
    });

}