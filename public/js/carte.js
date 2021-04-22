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

var pcr = "";
var ag = "";
var ho = "";
var cHo = false;
var cluster = {};
var geojson;
var opacity;
var dataRegion;
let statFrance;


//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------


//Données
$.get("/regions").done(dataR => {

    dataRegion = dataR;

    //LEGENDE
    var info = L.control({position: 'bottomright'});

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    const lastUpdate = new Date(dataR[0].properties.lastUpdate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = `<h4> Nombre de test réalisé jusqu'au ${lastUpdate.toLocaleDateString('fr-FR', options)}</h4>`;
    };

    info.addTo(map);

    //legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 400, 800, 2000, 4000, 8000, 10000, 20000],
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
        return d > 20000 ? '#800026' :
            d > 10000 ? '#BD0026' :
                d > 8000 ? '#E31A1C' :
                    d > 4000 ? '#FC4E2A' :
                        d > 2000 ? '#FD8D3C' :
                            d > 800 ? '#FEB24C' :
                                d > 400 ? '#FED976' :
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

        //Affichage stat
        afficherStat(e.sourceTarget.feature.properties.code);
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
    afficherStat(statFrance);

    map.on('zoomend', function (e) {
        if (map.getZoom() < 7) {
            for (const [key, value] of Object.entries(cluster)) {
                value.markerCG.remove();
            }
            geojson.removeFrom(map);
            addRegion();
            console.log("totuotutotu");
            
            afficherStat(statFrance);
            info.addTo(map);
            legend.addTo(map);
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

        dataP.forEach(obj => {


            if (obj.do_prel) {
                pcr = "PCR";
            }
            if (obj.do_antigenic) {
                ag = "AG";
            }

            if (obj.horaires[jour].length == 0 || obj.horaires[jour][0] == null || date.getHours() < obj.horaires[jour][0] || date.getHours() > obj.horaires[jour][1]){
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
                if (obj.rs.indexOf('-')!=-1)  var tab = obj.rs.split('-');
                else var tab = obj.rs.split(obj.adresse.ville);
                popup = '<table > '+
                '<thead> <tr> <th colspan="2"> <p class="adresse_popup">' + obj.adresse.adresse + ', ' + obj.adresse.ville + '</p> </th> </tr> </thead>'+
                '<tbody> <tr> <td> <p class="rs_popup">' + tab[0] + '</p> </td>' +
                '<td> <button  class="custom-btn btn-12" id="' + obj._id + '" onclick=maFonction(this.id)><span>Clique !</span><span>En savoir + </span></button></td></tr>'+
                '<tr> <td  colspan="2"> <p class="horaire-o" > Actuellement' + ho + '</p> </td> </tr> </table>';
                
            } else {
                if (obj.rs.indexOf('-')!=-1)  var tab = obj.rs.split('-');
                else var tab = obj.rs.split(obj.adresse.ville);
                popup = '<table > '+
                '<thead> <tr> <th colspan="2"> <p class="adresse_popup">' + obj.adresse.adresse + ', ' + obj.adresse.ville + '</p> </th> </tr> </thead>'+
                '<tbody> <tr> <td> <p class="rs_popup">' + tab[0] + '</p> </td>' +
                '<td> <button  class="custom-btn btn-12" id="' + obj._id + '" onclick=maFonction(this.id)><span>Clique !</span><span>En savoir + </span></button></td></tr>'+
                '<tr> <td  colspan="2"> <p class="horaire-f" > Actuellement' + ho + '</p> </td> </tr> </table>';   
                }

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

let popupOpen = false;

function maFonction(e) {
    var i = "<iframe width='550' height='550' src='./batiment?id=" + e + "'></iframe>" + "<a href=\"#\" onclick=\"hide(this.id)\">Ok!</a>";
    //$( "#popup" ).dialog({with:800,maxHeight:1000});
    $("#popup").html(i).css('display', 'block');

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

                map.addLayer(marker)
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


function openNav() {
    document.getElementById("mySidenav").style.width = "500px";
    document.getElementById("main").style.marginLeft = "500px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
  }
  
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.body.style.backgroundColor = "white";
  }



//Bouton onglet statistique
var boutonStats = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'info');
        button.innerHTML = '<h1><i class="fas fa-chart-pie"></i><h1>';
        L.DomEvent.on(button, 'click', function () {

            openNav();

        });
        return button;
    }
});

var boutonStats = (new boutonStats()).addTo(map);
