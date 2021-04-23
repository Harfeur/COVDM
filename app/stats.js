const Db = require('mongodb').Db


// sort array ascending
const asc = arr => arr.sort((a, b) => a - b);
const sum = arr => arr.reduce((a, b) => a + b, 0);
const mean = arr => sum(arr) / arr.length;
// sample standard deviation
const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};
const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};
const q25 = arr => quantile(arr, .25);
const q50 = arr => quantile(arr, .50);
const q75 = arr => quantile(arr, .75);
const median = arr => q50(arr);

/**
 * Met à jour les stats d'un site
 * @param {Db} db Base de données
 * @param {String} site ID du site à modifier
 */

const updateSite = (db, site) => {
    const filter = {"_id": site};
    return new Promise((resolve, reject) => {
        db.collection('sites_prelevements').findOne(filter).then(document => {
            if (!document) {
                console.log(site);
                reject();
            }
            // Calcul de l'attente moyenne
            let attenteMoyenne = document.stats.attente.length === 0 ? 9999 : document.stats.attente.reduce((a, b) => a + b, 0) / document.stats.attente.length;
            db.collection('sites_prelevements').updateOne(filter, {$set: {"stats.attenteMoyenne": attenteMoyenne}})
                .catch(console.error);

            // Calcul de l'attente rapide
            const ATTENTE_MAXIMALE = 15;
            let attenteRapide = attenteMoyenne < ATTENTE_MAXIMALE
            db.collection('sites_prelevements').updateMany(filter, {$set: {"stats.attenteRapide": attenteRapide}})
                .catch(console.error);

            // Calcul de la moyenne des notes
            let moyenne = document.avis.length === 0 ? 0 : document.avis.reduce((nb, avis) => nb + avis.note, 0) / document.avis.length;

            db.collection('sites_prelevements').updateMany(filter, {$set: {"stats.noteMoyenne": moyenne}})
                .catch(console.error);

            console.log(`Site ${site} mis à jour`);
            resolve([document.adresse.codeRegion, document.adresse.codeDepartement]);
        })
    });
}

function calculData(documents) {
    // Calcul du meilleur site
    let moyenneNote = documents.map(site => site.avis.length === 0 ? 1 : site.avis.reduce((a, b) => a + b.note, 0) / site.avis.length);
    let meilleursSites = []
    let noteMax = 0;
    moyenneNote.forEach((note, index) => {
        if (note > noteMax) {
            noteMax = note;
            meilleursSites = [documents[index]._id];
        } else if (note === noteMax) {
            meilleursSites.push(documents[index]._id);
        }
    });
    return meilleursSites;
}


/**
 * Met à jour les stats des établissements d'un département
 * @param {Db} db Base de données
 * @param {String} departement Département à modifier
 */

const updateDepartement = (db, departement) => {
    const filter = {"adresse.codeDepartement": departement};
    return new Promise((resolve, reject) => {
        db.collection('sites_prelevements').find(filter).toArray((error, documents) => {
            if (error) {
                console.error(error);
                return;
            }

            // Calcul du nombre de sites
            db.collection('sites_prelevements').updateMany(filter, {$set: {"stats.departement.nb": documents.length}})
                .catch(console.error);

            let meilleursSites = calculData(documents);

            // Calcul des délais d'attente
            let attente = documents.map(site => site.stats.attente.length === 0 ? 15 : site.stats.attente.reduce((sum, nb) => sum + nb, 0) / site.stats.attente.length);
            let dataAttente = {
                mediane: median(attente),
                min: Math.min(...attente),
                max: Math.max(...attente),
                q1: q25(attente),
                q3: q75(attente),
                ecart_type: std(attente),
                liste: attente.map((moy, index) => {
                    return {
                        label: documents[index].rs,
                        value: moy
                    }
                })
            };

            db.collection('departement').updateOne({"properties.code": departement}, {$set: {"properties.dataAttente": dataAttente}});

            db.collection('sites_prelevements').updateMany(filter, {$set: {"stats.departement.best": false}})
                .then(() => {
                    console.log(`Département ${departement} mis à jour`);
                    return db.collection('sites_prelevements').updateOne({_id: {$in: meilleursSites}}, {$set: {"stats.departement.best": true}});
                })
                .then(resolve)
                .catch(reject);
        });
    });
}

/**
 * Met à jour les stats des établissements d'une région
 * @param {Db} db Base de données
 * @param {String} region Région à modifier
 */

const updateRegion = (db, region) => {
    const filter = {"adresse.codeRegion": region};
    return new Promise((resolve, reject) => {
        db.collection('sites_prelevements').find(filter).toArray((error, documents) => {
            if (error) {
                console.error(error);
                return;
            }

            // Calcul du nombre de sites
            db.collection('sites_prelevements').updateMany(filter, {$set: {"stats.region.nb": documents.length}})
                .catch(console.error);

            let meilleursSites = calculData(documents);


            db.collection('departement').find({"properties.codeRegion": region}).toArray((err, docs) => {
                // Calcul des délais d'attente
                let attente = docs.map(dpt => dpt.properties.dataAttente.liste.reduce((sum, nb) => sum + nb.value, 0) / dpt.properties.dataAttente.liste.length);
                let dataAttente = {
                    mediane: median(attente),
                    min: Math.min(...attente),
                    max: Math.max(...attente),
                    q1: q25(attente),
                    q3: q75(attente),
                    ecart_type: std(attente),
                    liste: attente.map((moy, index) => {
                        return {
                            label: docs[index].properties.nom,
                            value: moy
                        }
                    })
                };

                db.collection('region').updateOne({"properties.code": region}, {$set: {"properties.dataAttente": dataAttente}});

                db.collection('sites_prelevements').updateMany(filter, {$set: {"stats.region.best": false}})
                    .then(() => {
                        console.log(`Région ${region} mise à jour`);
                        return db.collection('sites_prelevements').updateOne({_id: {$in: meilleursSites}}, {$set: {"stats.region.best": true}})
                    })
                    .then(resolve)
                    .catch(reject);
            })

        });
    });

}

// FUNCTIONS

/**
 * Met à jour les stats d'un site, de son département, et de sa région
 * @param {Db} db Base de données
 * @param {String} site ID du site à modifier
 */

const updateOne = (db, site) => {
    updateSite(db, site).then(([dpt, region]) => {
        updateDepartement(db, dpt).catch(console.error);
        updateRegion(db, region).catch(console.error);
    }).catch(console.error)
}

/**
 * Met à jour les stats d'un site, de son département, et de sa région
 * @param {Db} db Base de données
 */

const updateAll = (db) => {
    return new Promise(async (resolve, reject) => {
        await db.collection('region').find({}).toArray(async (err, documents) => {
            if (err) {
                console.error(err);
                return;
            }
            for (const region of documents) {
                await updateRegion(db, region.properties.code);
            }
            console.log("Initialisation des stats regions fini")
        });

        await db.collection('departement').find({}).toArray(async (err, documents) => {
            if (err) {
                console.error(err);
                return;
            }
            for (const departement of documents) {
                await updateDepartement(db, departement.properties.code);
            }
            console.log("Initialisation des stats départements finis")
        });

        db.collection('sites_prelevements').find({}).toArray(async (err, documents) => {
            if (err) {
                console.error(err);
                return;
            }
            for (const site of documents) {
                await updateSite(db, site._id);
            }
            resolve();
            console.log("Initialisation des stats des sites finis");
        });
    });
};


// EXPORTS

module.exports.updateOne = updateOne;
module.exports.updateAll = updateAll;