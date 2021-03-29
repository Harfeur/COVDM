var cluster = {};

 
//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------

//Données
$.get("/regions").done(dataR => {


    //création des markerclustergroup pour chaque région
    dataR.forEach(elt => {
        cluster[elt.properties.code] = {
            "nom": elt.properties.nom,
            "nbSP": 0
        }
    });

    //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------


    //Données
    $.get("/sitesPrelevements").done(dataP => {

        dataP.forEach(obj => {
            cluster[obj.adresse.codeRegion].nbSP += 1
        });


        //Chargement
        $('body').addClass('loaded');

        console.log(cluster);
    });


});
