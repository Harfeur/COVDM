var region = {};
var departement = {};
var nbSiteReg = [];
var nbSiteDep = [];
var couleur = [];
var totalSite = 0;
var meilleureSite = [];
var depBestSite = {};




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
            }
            depBestSite[oel.properties.code] = {
                "name":oel.properties.nom,
                "bestSite": []
            }
        })

        //Données
        $.get("/sitesPrelevements", {id_region: id_region}).done(dataP => {


            //maj region
            dataP.forEach(obj => {
                //ajout du site par région
                region[obj.adresse.codeRegion].y += 1
                region[obj.adresse.codeRegion].nbSite += 1
 
                if(id_region){
                    if (departement[obj.adresse.codeDepartement] != null) {                   
                        departement[obj.adresse.codeDepartement].y += 1                  
                        departement[obj.adresse.codeDepartement].nbSite += 1

                        //meilleure site
                        if(obj.avis.length != 0){
                            var nbA = 0
                            obj.avis.forEach(a => {
                                nbA += a.note
                            })
                            var totalA = nbA / obj.avis.length
                            var siteAvis = {
                                "y":totalA,
                                "label":obj.rs,
                                "ville": obj.adresse.ville,
                                "departement":depBestSite[obj.adresse.codeDepartement].name
                            }
                            
                            depBestSite[obj.adresse.codeDepartement].bestSite.push(siteAvis)
                        }
                    }
                }
                

                
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
                var chart = new CanvasJS.Chart("chartContainer1", {
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
                var chart = new CanvasJS.Chart("chartContainer2", {
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
                
                chart.render();

                //meilleure site par département pour une région donnée
                var chart = new CanvasJS.Chart("chartContainer3", {
                    animationEnabled: true,
                    exportEnabled: true,
                    theme: "light1", // "light1", "light2", "dark1", "dark2"
                    title:{
                        text: "Meilleure site en " + depBestSite[12].name
                    },
                      axisY: {
                      includeZero: true
                    },
                    axisX:{
                        labelFontSize:10
                    },
                    data: [{
                        type: "bar", //change type to bar, line, area, pie, etc
                        //indexLabel: "{y}", //Shows y value on all Data Points
                        indexLabelFontColor: "#5A5757",
                          indexLabelFontSize: 14,
                        indexLabelPlacement: "outside",
                        toolTipContent: "{label}<br> Moyenne avis : {y} <strong></strong> <br>Ville : {ville} " ,
                        dataPoints: depBestSite[12].bestSite
                    }]
                });
                
                chart.render();
            }

        });

    });

});