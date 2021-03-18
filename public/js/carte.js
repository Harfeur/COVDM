// Ajustation taille carte en fonction de l'écran
$("#mapid").height(((window.innerHeight) - 20));

//Création de la map
var mymap = L.map('mapid').setView([46.3630104, 2.9846608], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', {
    attribution: 'Trio Infornal',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

//Création groupe maker
var markersCluster = new L.MarkerClusterGroup();

var iconPrev = L.icon({
    iconUrl: '/images/localisationD.png',
    iconSize: [38, 40],
    popupAnchor: [0, -5],
});

var pcr = "";
var ag = "";
var rdv = "";

var allMarker = [];

$.get("/sitesPrelevements").done(data => {
    data.forEach(obj => {

        allMarker.push(obj.rs);

        if (obj.do_prel) {
            pcr = "PCR";
        }
        if (obj.do_antigenic) {
            ag = "AG";
        }

        //ne marche pas
        if (obj.check_rdv = "") {
            rdv = "RDV";
        }

        var popup = obj.rs +
            '<br>' + obj.adresse +
            '<br>' + obj.horaire +
            '<br><strong>' + pcr + ' ' + ag + ' ' + rdv +
            '</strong><a href="' + obj._id + '"> + </a>';

        //Création du marker et de son groupe
        var marker = L.marker([obj.latitude, obj.longitude], {
            icon: iconPrev
        });
        marker.bindPopup(popup);

        markersCluster.addLayer(marker);
    });
    mymap.addLayer(markersCluster);
});





//Region
function style(feature) {
    return {
        fillColor: feature.properties.color,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
};

$.get("/regions").done(data => {
    L.geoJson(data, {
        style: style
    }).addTo(mymap);

});
$('body').addClass('loaded');
