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


//-------------------------------------------------------- Site Prélevement-----------------------------------------------------------

//Icon 
var iconPrev = L.icon({
    iconUrl: '/images/localisationD.png',
    iconSize: [38, 40],
    popupAnchor: [0, -5],
});

var iconVacc = L.icon({
    iconUrl: '/images/localisationV.png',
    iconSize: [38, 40],
    popupAnchor: [0, -5],
});

var iconDouble = L.icon({
    iconUrl: '/images/localisation2.png',
    iconSize: [38, 40],
    popupAnchor: [0, -5],
});

var pcr = "";
var ag = "";
var ho = "";
var cHo = false;
var cluster = {};
var geojson;
var opacity;
var dataRegion;
let statFrance;


//LEGENDE
var info = L.control({position: 'bottomright'});
var legend = L.control({position: 'bottomright'});


//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------


//Données
$.get("/regions").done(dataR => {

    dataRegion = dataR;

    //legende
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    const lastUpdate = new Date(dataR[0].properties.lastUpdate);
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = `<h4> Nombre de tests réalisés le ${lastUpdate.toLocaleDateString('fr-FR', options)}</h4>`;
    };

    info.addTo(map);

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1000, 10000, 20000, 30000, 40000, 50000, 100000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);

    //Couleur
    function getColor(d) {
        return d > 100000 ? '#800026' :
            d > 50000 ? '#BD0026' :
                d > 40000 ? '#E31A1C' :
                    d > 30000 ? '#FC4E2A' :
                        d > 20000 ? '#FD8D3C' :
                            d > 10000 ? '#FEB24C' :
                                d > 1000 ? '#FED976' :
                                    '#FFEDA0';
    }

    //style
    function style(feature) {
        return {
            fillColor: getColor(feature.properties.color),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
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

            info.remove(map);
            legend.remove(map);
        }
        geojson.removeFrom(map);
        //rajout du style par défaut sauf pour la région cliquer
        geojson = L.geoJson(dataR, {
            style: function (feature) {
                if (e.sourceTarget.feature.properties.code == feature.properties.code) {
                    opacity = 0
                } else {
                    opacity = 0.7
                }
                return {
                    fillColor: feature.properties.color,
                    weight: 5,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: opacity
                }
            },
            onEachFeature: onEachFeature
        }).addTo(map);

        if (e.sourceTarget.feature.properties.code == "06") {
            $("#buttonGraph").parent().hide();
        } else {
            $("#buttonGraph").parent().show();
        }


        //Affichage stat
        afficherStatPrelev(e.sourceTarget.feature.properties.code);
    }

    //ajout des events
    function onEachFeature(feature, layer) {
        layer.on({
            click: zoomToFeature
        });
    }

    function addRegion() {
        geojson = L.geoJson(dataR, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    }

    addRegion()
    //Afficher stat de toute la france
    afficherStatPrelev(statFrance);

    map.on('zoomend', function (e) {
        if (map.getZoom() < 7 && map.getZoom() > 5) {
            for (const [key, value] of Object.entries(cluster)) {
                value.markerCG.remove();
            }
            geojson.removeFrom(map);
            addRegion();

            afficherStatPrelev(statFrance);
            //console.log("zoooommmmm");
            info.addTo(map);
            legend.addTo(map);
            $("#buttonGraph").parent().show();
        }
    });

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

        $.get('/sitesVaccinations').done(dataV => {

            var date = new Date();
            var jour;
            switch (date.getDay()) {
                case 1:
                    jour = "lundi";
                    break;
                case 2:
                    jour = "mardi";
                    break;
                case 3:
                    jour = "mercredi";
                    break;
                case 4:
                    jour = "jeudi";
                    break;
                case 5:
                    jour = "vendredi";
                    break;
                case 6:
                    jour = "samedi";
                    break;
                case 0:
                    jour = "dimanche";
                    break;
                default:
                    jour = "";
                    break;
            }

            let doubles = [];

            dataP.forEach(obj => {

                if (obj.do_prel) {
                    pcr = "PCR";
                }
                if (obj.do_antigenic) {
                    ag = "AG";
                }

                if (obj.horaires[jour].length == 0 || obj.horaires[jour][0] == null || date.getHours() < obj.horaires[jour][0] || date.getHours() > obj.horaires[jour][1]) {
                    ho = " fermé";
                    cHo = false;
                } else {
                    ho = " ouvert";
                    cHo = true;
                }

                let double = null;
                for (let i = 0; i < dataV.length; i++) {
                    let obj2 = dataV[i];
                    if (obj2.latitude - 0.0001 <= obj.latitude && obj.latitude <= obj2.latitude + 0.0001
                        && obj2.longitude - 0.0001 <= obj.longitude && obj.longitude <= obj2.longitude + 0.0001) {
                        double = obj2;
                        doubles.push(obj2._id);
                        break;
                    }
                }

                if (double) {
                    //horaire vaccination
                    var hoV ;
                    var cHoV
                    if (double.horaires[jour].length == 0 || double.horaires[jour][0] == null || date.getHours() < double.horaires[jour][0] || date.getHours() > double.horaires[jour][1]) {
                        hoV = " fermé";
                        cHoV = false;
                    } else {
                        hoV = " ouvert";
                        cHoV = true;
                    }
                    // Popup
                    if (obj.rs.indexOf('-') != -1) var tab = obj.rs.split('-');
                    else var tab = obj.rs.split(obj.adresse.ville);
                    let popup = `<table>
                    <thead> <tr> <th colspan="2"> <p class="adresse_popup">${obj.adresse.adresse}, ${obj.adresse.ville}</p> </th> </tr> </thead>
                    <tbody> <tr> <td> <p class="rs_popup">${tab[0]}</p> </td>
                    <td> <button  class="custom-btn btn-12" id="${obj._id}" onclick=maFonction(this.id,true)><span>Clique !</span><span>Site prélevement</span></button>
                    <button  class="custom-btn btn-12" id="${double._id}" onclick=maFonction(this.id,false)><span>Clique !</span><span>Site vaccination</span></button></td></tr>
                    <tr> <td  colspan="2"> <p class="${cHo ? "horaire-o" : "horaire-f"}" > Actuellement${ho} (site de prélèvement)</p> </td> </tr> </table>
                    <tr> <td  colspan="2"> <p class="${cHoV ? "horaire-o" : "horaire-f"}" > Actuellement${hoV} (site de vaccination)</p> </td> </tr> </table>`;

                    //Création du marker et de son groupe
                    let mS2 = L.marker([obj.latitude, obj.longitude], {
                        icon: iconDouble
                    });
                    mS2.bindPopup(popup);
                    (cluster[obj.adresse.codeRegion].markerCG).addLayer(mS2);
                } else {
                    // Popup
                    if (obj.rs.indexOf('-') != -1) var tab = obj.rs.split('-');
                    else var tab = obj.rs.split(obj.adresse.ville);
                    let popup = `<table>
                    <thead> <tr> <th colspan="2"> <p class="adresse_popup">${obj.adresse.adresse}, ${obj.adresse.ville}</p> </th> </tr> </thead>
                    <tbody> <tr> <td> <p class="rs_popup">${tab[0]}</p> </td>
                    <td> <button  class="custom-btn btn-12" id="${obj._id}" onclick=maFonction(this.id,true)><span>Clique !</span><span>En savoir + </span></button></td></tr>
                    <tr> <td  colspan="2"> <p class="${cHo ? "horaire-o" : "horaire-f"}" > Actuellement${ho}</p> </td> </tr> </table>`;

                    //Création du marker et de son groupe
                    var mSP = L.marker([obj.latitude, obj.longitude], {
                        icon: iconPrev
                    });
                    mSP.bindPopup(popup);
                    (cluster[obj.adresse.codeRegion].markerCG).addLayer(mSP)
                }


            });

            dataV.forEach(obj => {
                if (doubles.includes(obj._id)) return;

                if (obj.horaires[jour].length == 0 || obj.horaires[jour][0] == null || date.getHours() < obj.horaires[jour][0] || date.getHours() > obj.horaires[jour][1]) {
                    ho = " fermé";
                    cHo = false;
                } else {
                    ho = " ouvert";
                    cHo = true;
                }

                // Solution : base
                var popup = ""
                //si c'est fermé ou ouvert
                if (cHo) {
                    if (obj.c_nom.indexOf('-') != -1) var tab = obj.c_nom.split('-');
                    else var tab = obj.c_nom.split(obj.adresse.ville);
                    popup = '<table > ' +
                        '<thead> <tr> <th colspan="2"> <p class="adresse_popup">' + obj.adresse.adresse + ', ' + obj.adresse.ville + '</p> </th> </tr> </thead>' +
                        '<tbody> <tr> <td> <p class="rs_popup">' + tab[0] + '</p> </td>' +
                        '<td> <button  class="custom-btn btn-12" id="' + obj._id + '" onclick=maFonction(this.id,false)><span>Clique !</span><span>En savoir + </span></button></td></tr>' +
                        '<tr> <td  colspan="2"> <p class="horaire-o" > Actuellement' + ho + '</p> </td> </tr> </table>';

                } else {
                    if (obj.c_nom.indexOf('-') != -1) var tab = obj.c_nom.split('-');
                    else var tab = obj.c_nom.split(obj.adresse.ville);
                    popup = '<table > ' +
                        '<thead> <tr> <th colspan="2"> <p class="adresse_popup">' + obj.adresse.adresse + ', ' + obj.adresse.ville + '</p> </th> </tr> </thead>' +
                        '<tbody> <tr> <td> <p class="rs_popup">' + tab[0] + '</p> </td>' +
                        '<td> <button  class="custom-btn btn-12" id="' + obj._id + '" onclick=maFonction(this.id,false)><span>Clique !</span><span>En savoir + </span></button></td></tr>' +
                        '<tr> <td  colspan="2"> <p class="horaire-f" > Actuellement' + ho + '</p> </td> </tr> </table>';
                }

                //Création du marker et de son groupe
                var mSV = L.marker([obj.latitude, obj.longitude], {
                    icon: iconVacc
                });
                mSV.bindPopup(popup);


                (cluster[obj.adresse.codeRegion].markerCG).addLayer(mSV)


            });
            //Chargement
            $('body').addClass('loaded');
        });
    });

});

let popupOpen = false;

function maFonction(e, b) {
    if (b) {
        //prelevement
        var i = "<iframe width='550' height='550' src='./batiment?id=" + e + "'></iframe>";
        //$( "#popup" ).dialog({with:800,maxHeight:1000});
        $("#popup").html(i).css('display', 'block');
    } else {
        //vaccin
        var i = "<iframe width='550' height='550' src='./vaccin?id=" + e + "'></iframe>";
        //$( "#popup" ).dialog({with:800,maxHeight:1000});
        $("#popup").html(i).css('display', 'block');
    }

    setTimeout(() => {
        popupOpen = true;
    }, 500);

}

$("#popup").on('click', e => {
    console.log("bye")
    if (popupOpen) {
        $("#popup").css('display', 'none');
        popupOpen = false;
    }
});
//---------------------------------------------------------------Map--------------------------------------------------------------


//Geolocalisation
function geoFindMe() {

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        var b = L.latLng(latitude, longitude);

        map.flyTo(b, 15);
        map.once('moveend', function () {
            $.get('https://geo.api.gouv.fr/communes?lat=' + latitude + '&lon=' + longitude + '&fields=codeRegion').done(data => {
                var marker = cluster[data[0].codeRegion].markerCG;

                for (const [key, value] of Object.entries(cluster)) {
                    value.markerCG.remove();
                }

                //suppression des régions
                geojson.removeFrom(map);

                //rajout styles des régions sauf celui où on est
                geojson = L.geoJson(dataRegion, {
                    style: function (feature) {
                        if (data[0].codeRegion == feature.properties.code) {
                            opacity = 0
                        } else {
                            opacity = 0.7
                        }
                        return {
                            fillColor: feature.properties.color,
                            weight: 5,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: opacity
                        }
                    }
                }).addTo(map);

                map.addLayer(marker);
                //Statistique
                afficherStatPrelev(data[0].codeRegion);
                info.remove(map);
                legend.remove(map);
            })
        });

    }

    function error() {
        console.log('Unable to retrieve your location');
    }

    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
    } else {
        console.log('Locating…');
        navigator.geolocation.getCurrentPosition(success, error);
    }

}


//Bouton geolocation
var localisation = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'info');
        button.innerHTML = '<h1><i class="fas fa-map-marked-alt"></i></h1>';
        L.DomEvent.on(button, 'click', function () {

            geoFindMe();

        });
        return button;
    }
});

var localisation = (new localisation()).addTo(map);


//Onglet statistique
function openNav(i) {
    if (i) {
        //Grande ouverture avec le bouton plus de graphique
        document.getElementById("mySidenav").style.width = "100%";
        document.getElementById("main").style.marginLeft = "100%";

        $("#graphSupp").hide();
        $("#graphMoins").show();
        $("#contentchartSupp").show();

    } else if (i == false) {
        //Petite ouverture avec le bouton moins de graphique
        document.getElementById("mySidenav").style.width = "500px";
        document.getElementById("main").style.marginLeft = "500px";

        $("#contentchartSupp").hide();
        $("#graphSupp").show();
        $("#graphMoins").hide();
    }
    document.body.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";

    $("#graphSupp").show();

}


//Bouton onglet statistique
var boutonStats = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'info');
        button.innerHTML = '<h1 id="buttonGraph"><i class="fas fa-chart-pie"></i><h1>';
        L.DomEvent.on(button, 'click', function () {

            openNav(false);

        });
        return button;
    }
});

var boutonStats = (new boutonStats()).addTo(map);
