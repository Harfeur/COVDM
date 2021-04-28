const {Application} = require('express');
const {Db} = require('mongodb');
const stats = require('./stats.js');

/**
 * @param {Application} app Application express
 * @param {Db} db Base de données
 * @param {String} dirname Nom du répertoire du serveur
 */

module.exports = function (app, db, dirname, data) {

    app.post('/ajoutCommentaire', (req, res) => {
        if (req.body.nom && req.body.email && req.body.id && req.body.note) {
            if (isNaN(req.body.id)) {
                const filter = {"_id": req.body.id};
                console.log(`Ajout d'infos au lieu ${req.body.id} :`);
                if (req.body.attente !== undefined) {
                    console.log(`- Attente de ${req.body.attente} minutes`);
                    db.collection('sites_prelevements').updateOne(filter, {$push: {"stats.attente": req.body.attente}});
                }
                if (req.body.bonDeroulement !== undefined) {
                    console.log(`- Bon déroulement ${req.body.bonDeroulement}`)
                    if (req.body.bonDeroulement)
                        db.collection('sites_prelevements').updateOne(filter, {$inc: {"stats.bonDeroulement.oui": 1}});
                    else
                        db.collection('sites_prelevements').updateOne(filter, {$inc: {"stats.bonDeroulement.non": 1}});
                }
                console.log(`- Note de ${req.body.note}/5`);
                console.log(`- Commentaire de ${req.body.nom} (${req.body.email})`);
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
                    stats.updateOne(db, req.body.id);
                }).catch(err => {
                    res.status(500);
                    console.error(err);
                })
            } else {
                const filter = {"_id": parseInt(req.body.id)};
                console.log(`Ajout d'infos au lieu ${req.body.id} :`);
                if (req.body.attente !== undefined) {
                    console.log(`- Attente de ${req.body.attente} minutes`);
                    db.collection('sites_vaccinations').updateOne(filter, {$push: {"stats.attente": req.body.attente}});
                }
                if (req.body.bonDeroulement !== undefined) {
                    console.log(`- Bon déroulement ${req.body.bonDeroulement}`)
                    if (req.body.bonDeroulement)
                        db.collection('sites_vaccinations').updateOne(filter, {$inc: {"stats.bonDeroulement.oui": 1}});
                    else
                        db.collection('sites_vaccinations').updateOne(filter, {$inc: {"stats.bonDeroulement.non": 1}});
                }
                console.log(`- Note de ${req.body.note}/5`);
                console.log(`- Commentaire de ${req.body.nom} (${req.body.email})`);
                db.collection('sites_vaccinations').updateOne(filter, {
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
                    stats.updateOne(db, req.body.id);
                }).catch(err => {
                    res.status(500);
                    console.error(err);
                })
            }
        } else {
            res.status(500);
        }
    });

    app.post('/majHoraire', (req, res) => {
        if (req.body.id && req.body.heureO && req.body.heureF && req.body.jour) {
            let jour = req.body.jour;
            let update;
            switch (jour) {
                case "lundi":
                    update = {$set: {"horaires.lundi": [req.body.heureO, req.body.heureF]}};
                    break;
                case "mardi":
                    update = {$set: {"horaires.mardi": [req.body.heureO, req.body.heureF]}};
                    break;
                case "mercredi":
                    update = {$set: {"horaires.mercredi": [req.body.heureO, req.body.heureF]}};
                    break;
                case "jeudi":
                    update = {$set: {"horaires.jeudi": [req.body.heureO, req.body.heureF]}};
                    break;
                case "vendredi":
                    update = {$set: {"horaires.vendredi": [req.body.heureO, req.body.heureF]}};
                    break;
                case "samedi":
                    update = {$set: {"horaires.samedi": [req.body.heureO, req.body.heureF]}};
                    break;
                case "dimanche":
                    update = {$set: {"horaires.dimanche": [req.body.heureO, req.body.heureF]}};
                    break;
            }
            console.log(`Mise à jour dans la base pour le lieu ${req.body.id} et le jour ${jour} : ${req.body.heureO}-${req.body.heureF}`);
            if (isNaN(req.body.id)) {
                const filter = {"_id": req.body.id};
                db.collection('sites_prelevements').updateOne(filter, update).then(() => {
                    res.send("Ok");
                    data.resetSites();
                }).catch(err => {
                    res.status(500);
                    console.error(err);
                })
            } else {
                const filter = {"_id": parseInt(req.body.id)};
                db.collection('sites_vaccinations').updateOne(filter, update).then(() => {
                    res.send("Ok");
                    data.resetSites();
                }).catch(err => {
                    res.status(500);
                    console.error(err);
                })
            }
        } else {
            res.status(500);
        }

    });

    app.post('/majURL', (req, res) => {
        if (req.body.id) {
            console.log(`Mise à jour dans la base pour le lieu ${req.body.id} : nouvel url : ${req.body.url}`);
            if (isNaN(req.body.id)) {
                const filter = {"_id": req.body.id};
                let update = {$set: {"web_rdv": req.body.url}};
                db.collection('sites_prelevements').updateOne(filter, update).then(() => {
                    res.send("Ok");
                    data.resetSites();
                }).catch(err => {
                    res.status(500);
                    console.error(err);
                })
            } else {
                const filter = {"_id": req.body.id};
                let update = {$set: {"web_rdv": req.body.url}};
                db.collection('sites_vaccinations').updateOne(filter, update).then(() => {
                    res.send("Ok");
                    data.resetSites();
                }).catch(err => {
                    res.status(500);
                    console.error(err);
                })
            }
            
        } else {
            res.status(500);
        }
    });
}