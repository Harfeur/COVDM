var region = {};
var departement = {};
var nbSiteReg = [];
var nbSiteDep = [];
var couleur = [];
var totalSite = 0;
var nbAvis = [];
var avis = [];




const urlParams = new URLSearchParams(window.location.search);
let id_region = urlParams.get('id_region');

//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------
//Données
$.get("/regions").done(dataR => {


    //création object pour chaque région
    dataR.forEach(elt => {
        region[elt.properties.code] = {
            "name": elt.properties.nom,
            // y = nombre de site par région
            "y": 0,
            "nbSite":0,
            "exploded": true
        } 
        couleur.push(elt.properties.color)
    });
    
    //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------
    $.get("/departements", {id_region: id_region}).done(dataD => {
        dataD.forEach(oel => {
            departement[oel.properties.code] = {
                "name": oel.properties.nom,
                // y = nombre de site par département
                "y":0,
                "nbSite":0,
                //"nbAvis": []
            }
        })

        //Données
        $.get("/sitesPrelevements", {id_region: id_region}).done(dataP => {


            //maj region
            dataP.forEach(obj => {
                //ajout du site par région
                region[obj.adresse.codeRegion].y += 1
                region[obj.adresse.codeRegion].nbSite += 1

                // var avis = {
                //     "y": (obj.avis).length,
                //     "rs": obj.rs,
                //     "ville": obj.adresse.ville,
                // }  
                if(id_region){
                    if (departement[obj.adresse.codeDepartement] != null) {                   
                        departement[obj.adresse.codeDepartement].y += 1                  
                        departement[obj.adresse.codeDepartement].nbSite += 1
                        //avis["label"] =  departement[obj.adresse.codeDepartement].name                              
                        //departement[obj.adresse.codeDepartement].nbAvis.push(avis)
                    }
                }
                

                //nbAvis.push(avis)
            });

            totalSite = dataP.length

            //mis en pourcentage + ajout dans liste pour les datas chart pie
            for (const [key, value] of Object.entries(region)) {
                region[key].y = ((value.y * 100) / totalSite).toFixed(1)
                nbSiteReg.push(value)
            }
            for (const [key, value] of Object.entries(departement)) {
                departement[key].y = ((value.y * 100) / totalSite).toFixed(1)
                nbSiteDep.push(value)
            }

            //Chargement
            $('body').addClass('loaded');


            //affichage chart pie
            if (!id_region) {
                //couleur
                CanvasJS.addColorSet("couleurRegion", couleur);
                //nb site par region 
                var chart = new CanvasJS.Chart("chartContainer", {
                    colorSet: "couleurRegion",
                    exportEnabled: true,
                    animationEnabled: true,
                    title: {
                        text: "Nombre de sites de prélèvements par région"
                    },
                    legend: {
                        cursor: "pointer",
                    },
                    data: [{
                        type: "pie",
                        showInLegend: false,
                        toolTipContent: "{name}: <strong>{y}%</strong> <br>Nombre de site de prélèvement : {nbSite}" ,
                        indexLabel: "{name} - {y}%",
                        dataPoints: nbSiteReg
                    }]
                });

                chart.render();
            } else {      
                //nb site par département pour une région donnée
                var chartnbSiteDepart = new CanvasJS.Chart("chartContainerDepart", {
                    exportEnabled: true,
                    animationEnabled: true,
                    title: {
                        text: "Nombre de sites de prélèvements par département de la région " + region[id_region].name
                    },
                    legend: {
                        cursor: "pointer",
                    },
                    data: [{
                        type: "pie",
                        showInLegend: false,
                        toolTipContent: "{name}: <strong>{y}%</strong> <br>Nombre de site de prélèvement : {nbSite}" ,
                        indexLabel: "{name} - {y}%",
                        dataPoints: nbSiteDep
                    }]
                });

                chartnbSiteDepart.render();

            }

        });

    });

});