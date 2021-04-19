




const urlParams = new URLSearchParams(window.location.search);
let id_region = urlParams.get('id_region');
let id_departement = urlParams.get('id_departement');

//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------

function afficherStat(id_region) {
    var region = {};
    var departement = {};
    var nbSiteReg = [];
    var nbSiteDep = [];
    var totalSite = 0;
    var meilleureSite = [];
    var depBestSite = {};
    var unDepartement = {};
    var nbContainer = 3;
    //Données
    $.get("/regions").done(dataR => {


        //création object pour chaque région
        dataR.forEach(elt => {
            //region : regroupe le nombre de sites pour chaque region
            region[elt.properties.code] = {
                "name": elt.properties.nom,
                // y = nombre de site par région en pourcentage et nbSite le nombre exacte
                "y": 0,
                "nbSite": 0,
                "exploded": true
            }
        });

        //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------
        $.get("/departements", {
            id_region: id_region,
            id_departement: id_departement
        }).done(dataD => {
            dataD.forEach(oel => {
                //departement : regroupe le nombre de sites pour chaque departement
                departement[oel.properties.code] = {
                    "name": oel.properties.nom,
                    // y = nombre de site par département en pourcentage et nbSite le nombre exacte
                    "y": 0,
                    "nbSite": 0,
                }
                //depBestSite : regroupe la moyenne de chaque site pour chaque departement
                depBestSite[oel.properties.code] = {
                    "name": oel.properties.nom,
                    "bestSite": []
                }
                if (id_departement && id_departement == oel.properties.code) {
                    unDepartement[id_departement] = {
                        "name": oel.properties.nom,
                        "bestSite": [],
                        "nbSite": 0,
                    }
                }
            })

            //Données
            $.get("/sitesPrelevements", {
                id_region: id_region,
                id_departement: id_departement
            }).done(dataP => {


                //maj region
                dataP.forEach(obj => {
                    //ajout du site par région
                    region[obj.adresse.codeRegion].y += 1
                    region[obj.adresse.codeRegion].nbSite += 1

                    if (id_region) {
                        if (departement[obj.adresse.codeDepartement] != null) {
                            departement[obj.adresse.codeDepartement].y += 1
                            departement[obj.adresse.codeDepartement].nbSite += 1

                            //meilleure site
                            if (obj.avis.length != 0) {
                                var nbA = 0
                                obj.avis.forEach(a => {
                                    nbA += a.note
                                })
                                var totalA = nbA / obj.avis.length
                                var siteAvis = {
                                    "y": totalA,
                                    "label": obj.rs,
                                    "ville": obj.adresse.ville,
                                    "departement": depBestSite[obj.adresse.codeDepartement].name
                                }

                                depBestSite[obj.adresse.codeDepartement].bestSite.push(siteAvis)
                            }
                        }
                    }

                    if (id_departement) {
                        if (unDepartement[obj.adresse.codeDepartement] != null) {
                            unDepartement[obj.adresse.codeDepartement].nbSite += 1
                            //meilleure site
                            if (obj.avis.length != 0) {
                                var nbA = 0
                                obj.avis.forEach(a => {
                                    nbA += a.note
                                })
                                var totalA = nbA / obj.avis.length
                                var siteAvis = {
                                    "y": totalA, //moyenne
                                    "label": obj.rs,
                                    "ville": obj.adresse.ville
                                }

                                unDepartement[obj.adresse.codeDepartement].bestSite.push(siteAvis)
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
                if (!id_region && !id_departement) {
                    //nb site par region 
                    $('#chartContainer2').hide();
                    var chart = new CanvasJS.Chart("chartContainer1", {
                        exportEnabled: true,
                        animationEnabled: true,
                        width: 500,
                        title: {
                            text: "Nombre de sites de prélèvements par région",
                            fontSize: 20,
                        },
                        legend: {
                            cursor: "pointer",
                        },
                        data: [{
                            type: "pie",
                            showInLegend: false,
                            toolTipContent: "{name}: <strong>{y}%</strong> <br>Nombre de site de prélèvement : {nbSite}",
                            indexLabel: "{name} - {y}%",
                            dataPoints: nbSiteReg
                        }]
                    });

                    chart.render();

                } else if (id_departement) {
                    console.log(unDepartement);
                } else {
                    //nb site par département pour une région donnée
                    $("#chartContainer2").show();
                    var chart = new CanvasJS.Chart("chartContainer2", {
                        exportEnabled: true,
                        animationEnabled: true,
                        width: 500,
                        title: {
                            text: "Nombre de sites de prélèvements par département de la région " + region[id_region].name,
                            fontSize: 20,
                        },
                        legend: {
                            cursor: "pointer",
                        },
                        data: [{
                            type: "pie",
                            showInLegend: false,
                            toolTipContent: "{name}: <strong>{y}%</strong> <br>Nombre de site de prélèvement : {nbSite}",
                            indexLabel: "{name} - {y}%",
                            dataPoints: nbSiteDep
                        }]
                    });
                    chart.render();

                    //meilleure site par département pour une région donnée
                    // for (const [key, value] of Object.entries(departement)) {
                    //     var id_Div = "chartContainer" + nbContainer
                    //     var div = '<div class="chart" id="' + id_Div + '"></div>'
                    //     nbContainer += 1
                    //     $("#chartContainer2").after(div);

                    //     var chart = new CanvasJS.Chart(id_Div, {
                    //         animationEnabled: true,
                    //         exportEnabled: true,
                    //         theme: "light1", // "light1", "light2", "dark1", "dark2"
                    //         width: 500,
                    //         title: {
                    //             text: "Moyenne des notes de chaque site en " + depBestSite[key].name,
                    //         fontSize: 20,
                    //         },
                    //         axisY: {
                    //             includeZero: true,
                    //         },
                    //         axisX: {
                    //             labelFontSize: 10,
                    //         },
                    //         data: [{
                    //             type: "bar", //change type to bar, line, area, pie, etc
                    //             //indexLabel: "{y}", //Shows y value on all Data Points
                    //             indexLabelFontColor: "#5A5757",
                    //             indexLabelFontSize: 14,
                    //             indexLabelPlacement: "outside",
                    //             toolTipContent: "{label}<br> Moyenne avis : {y} <strong></strong> <br>Ville : {ville} ",
                    //             dataPoints: depBestSite[key].bestSite
                    //         }]
                    //     });

                    //     chart.render();
                    // }
                }

            });

        });

    });
}
