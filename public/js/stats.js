var cluster = {};
var siteP = [];
var couleur = [];
var total = 0;
//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------

//Données
$.get("/regions").done(dataR => {


    //création des markerclustergroup pour chaque région
    dataR.forEach(elt => {
        cluster[elt.properties.code] = {
            "name": elt.properties.nom,
            "y": 0,
            "exploded" : true
        }
        couleur.push(elt.properties.color)
    });

    //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------


    //Données
    $.get("/sitesPrelevements").done(dataP => {

        dataP.forEach(obj => {
            cluster[obj.adresse.codeRegion].y += 1
            total += 1
        });


        for (const [key, value] of Object.entries(cluster)) {
            cluster[key].y = ((value.y * 100) / total).toFixed(1)
            siteP.push(value)
        }

        //Chargement
        $('body').addClass('loaded');

        CanvasJS.addColorSet("couleurRegion", couleur);

        var chart = new CanvasJS.Chart("chartContainer", {
            colorSet:  "couleurRegion",
            exportEnabled: true,
            animationEnabled: true,
            title:{
                text: "Nombre de sites de prélèvements par Région"
            },
            legend:{
                cursor: "pointer",
                itemclick: explodePie
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

    });


});




    
    
    function explodePie (e) {
        if(typeof (e.dataSeries.dataPoints[e.dataPointIndex].exploded) === "undefined" || !e.dataSeries.dataPoints[e.dataPointIndex].exploded) {
            e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
        } else {
            e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
        }
        e.chart.render();
    
    }