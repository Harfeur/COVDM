const express = require('express');

/**
 * @param {express.Application} app Application express
 * @param {String} dirname Nom du répertoire du serveur
 */

module.exports = function (app, dirname) {

    app.use('/', express.static('public'));

}