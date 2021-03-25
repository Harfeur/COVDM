// Ajustation taille carte en fonction de l'écran
$("#mapid").height(((window.innerHeight) - 20));

//---------------------------------------------------------------Map--------------------------------------------------------------

//Création de la map
var map = L.map('mapid').setView([46.3630104, 2.9846608], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', {
    attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(map);

var layerControl = L.control.layers().addTo(map);

//-------------------------------------------------------- Site Prélevement-----------------------------------------------------------

//Icon 
var iconPrev = L.icon({
    iconUrl: '/images/localisationD.png',
    iconSize: [38, 40],
    popupAnchor: [0, -5],
});

var pcr = "";
var ag = "";
var ho = "";

var cluster = {};

 
//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------



//Données
$.get("/regions").done(dataR => {

    //style
    function style(feature) {
        return {
            fillColor: feature.properties.color,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    //contour gris quand la souris passe par dessus
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    var geojson;

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    //zoom
    function zoomToFeature(e) {
        var marker = cluster[e.sourceTarget.feature.properties.code].markerCG;

        for (const [key, value] of Object.entries(cluster)) {
            value.markerCG.remove();
        }

        map.addLayer(marker)

        if (map.getZoom() < 10) {
            map.fitBounds(e.target.getBounds());

        }
    }

    //ajout des events
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    geojson = L.geoJson(dataR, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    //création des markerclustergroup pour chaque région
    dataR.forEach(elt => {
        cluster[elt.properties.code] = {
            "nom": elt.properties.nom,
            "markerCG": new L.MarkerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 35
            })
        }
    });

    //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------

    //Données
    $.get("/sitesPrelevements").done(dataP => {
        
        var date = new Date();
        var jour;
        switch (date.getDay()) {
            case 1: jour = "lundi";break;
            case 2: jour = "mardi";break;
            case 3: jour = "mercredi";break;
            case 4: jour = "jeudi";break;
            case 5: jour = "vendredi";break;
            case 6: jour = "samedi";break;
            case 7: jour = "dimanche";break;        
            default: jour = "";break;
        }

        dataP.forEach(obj => {


            if (obj.do_prel) {
                pcr = "PCR";
            }
            if (obj.do_antigenic) {
                ag = "AG";
            }

            if (obj.horaires[jour].length == 0){
                ho = "Fermé";
            }else{ 
                ho = "Ouvert aujourd'hui :<br>";
                var hH = obj.horaires[jour];
                for(var i=0;i<hH.length;i++){
                    if (i==0) {
                        ho = ho.concat("De ");
                        ho = ho.concat(getHoraireToString(hH[i][0]));
                        ho = ho.concat(" à ");
                        ho = ho.concat(getHoraireToString(hH[i][1]))
                    } else {
                        ho = ho.concat("<br>Et de ")
                        ho = ho.concat(getHoraireToString(hH[i][0]))
                        ho = ho.concat(" à ");
                        ho = ho.concat(getHoraireToString(hH[i][1]))
                    }
                }
            }

            var popup = obj.rs +
                '<br>' + obj.adresse.adresse +
                '<br>' + ho +
                '<br><strong>' + pcr + ' ' + ag + ' ' +
                '<a href="/batiment?id=' + obj._id + '"><i class="fas fa-search-plus"></i></a>';

            //Création du marker et de son groupe
            var mSP = L.marker([obj.latitude, obj.longitude], {
                icon: iconPrev
            });
            mSP.bindPopup(popup);


            (cluster[obj.adresse.codeRegion].markerCG).addLayer(mSP)
            
        //Chargement
        $('body').addClass('loaded');

        });


        
    });

});


//---------------------------------------------------------------Map--------------------------------------------------------------

map.on('zoomend', function (e) {
    if (map.getZoom() < 7) {

        for (const [key, value] of Object.entries(cluster)) {
            value.markerCG.remove();
        }

    }
});





var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', {
        id: 'mapbox/satellite-streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    }),
    streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', {
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    }),
    light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', {
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    });


layerControl.addBaseLayer(satellite, "Satellite");
layerControl.addBaseLayer(streets, "Streets");
layerControl.addBaseLayer(light, "Light");