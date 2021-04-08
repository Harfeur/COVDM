var cluster = {};
var siteP = [];
var couleur = [];
var total = 0;
var nbAvis = [];
var avis = [];




const urlParams = new URLSearchParams(window.location.search);
let id_region = urlParams.get('id_region');

//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------
//Données
$.get("/regions").done(dataR => {


    //création object pour chaque région
    dataR.forEach(elt => {
        cluster[elt.properties.code] = {
            "name": elt.properties.nom,
            "y": 0,
            "exploded": true
        }
        couleur.push(elt.properties.color)
    });

    //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------


    //Données
    $.get("/sitesPrelevements",{id_region :id_region}).done(dataP => {
        
        
        //maj cluster
        dataP.forEach(obj => {
            cluster[obj.adresse.codeRegion].y += 1
            total += 1
            
                 var avis  = {
                    "y": (obj.avis).length,
                    "label": obj.rs,
                    "ville":obj.adresse.ville,
                    "exploded": true}
                    
            nbAvis.push(avis)
            
            
        });

        //console.log(nbAvis);
        //mis en pourcentage + ajout dans liste pour les datas chart pie
        for (const [key, value] of Object.entries(cluster)) {
            cluster[key].y = ((value.y * 100) / total).toFixed(1)
            siteP.push(value)
        }
        //console.log(siteP);

        //Chargement
        $('body').addClass('loaded');

        //couleur
        CanvasJS.addColorSet("couleurRegion", couleur);





        //affichage chart pie
        if(!id_region){    
         //nb site par region 
        var chart = new CanvasJS.Chart("chartContainer", {
            colorSet: "couleurRegion",
            exportEnabled: true,
            animationEnabled: true,
            title: {
                text: "Nombre de sites de prélèvements par Région"
            },
            legend: {
                cursor: "pointer",
            },
            data: [{
                type: "pie",
                showInLegend: false,
                toolTipContent: "{name}: <strong>{y}%</strong>",
                indexLabel: "{name} - {y}%",
                dataPoints: siteP
            }]
        });
        
        chart.render();  
        }else{    
            //Pour chaque région nb avis
            var chartAvis = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,
                exportEnabled: true,
                theme: "light1", // "light1", "light2", "dark1", "dark2"
                title:{
                    text: "Nombre d'avis par site en "+cluster[id_region].name
                },
                data: [{
                    type: "column", //change type to bar, line, area, pie, etc
                    //indexLabel: "{y}", //Shows y value on all Data Points
                    indexLabelFontColor: "#5A5757",
                      indexLabelFontSize: 16,
                    indexLabelPlacement: "outside",
                    toolTipContent: "<b>{label}</b><br>Ville: {ville}<br><br>Nombre d'avis : {y}",
                    dataPoints: nbAvis
                }]
            }); 
            chartAvis.render();
        }

    });


});

