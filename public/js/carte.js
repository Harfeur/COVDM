// Ajustation taille carte en fonction de l'écran
$("#mapid").height(((window.innerHeight) - 20));

//---------------------------------------------------------------Map--------------------------------------------------------------

//Création de la map
var mymap = L.map('mapid').setView([46.3630104, 2.9846608], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', {
    attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

//Chargement
$('body').addClass('loaded');

//Création groupe maker
var markersCluster = new L.MarkerClusterGroup(
	{showCoverageOnHover: false});

//-------------------------------------------------------- Site Prélevement-----------------------------------------------------------

//Icon 
var iconPrev = L.icon({
    iconUrl: '/images/localisationD.png',
    iconSize: [38, 40],
    popupAnchor: [0, -5],
});

var pcr = "";
var ag = "";
var rdv = "";

var allMarker = [];

//Données
$.get("/sitesPrelevements").done(data => {
    data.forEach(obj => {


        if (obj.do_prel) {
            pcr = "PCR";
        }
        if (obj.do_antigenic) {
            ag = "AG";
        }

        if (obj.check_rdv != null) {
            rdv = obj.check_rdv;
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

        allMarker.push(marker);

        markersCluster.addLayer(marker);
    });
    mymap.addLayer(markersCluster);
});


//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------

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
};

var layerControl = L.control.layers().addTo(mymap);
//Données
$.get("/regions").done(data => {
    var region = L.geoJson(data, {
        style: style
    });  
    layerControl.addOverlay(region, "Région");
});


//---------------------------------------------------------------Map--------------------------------------------------------------
var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', 
                        {id: 'mapbox/satellite-streets-v11', tileSize: 512, zoomOffset: -1, attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'}),
    streets   = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', 
                        {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'}),
    light   = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2RhaWxoYXUiLCJhIjoiY2trd2t6czNjMWlvYTJ2cGlsYXp3eml0ZCJ9.EFIujCAZEOZrlLhgOdfT0g', 
                        {id: 'mapbox/light-v10', tileSize: 512, zoomOffset: -1, attribution: 'Trio Infornal | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'});


layerControl.addBaseLayer(satellite, "Satellite");
layerControl.addBaseLayer(streets, "Streets");
layerControl.addBaseLayer(light, "Light");
layerControl.addOverlay(markersCluster, "Site de prélèvement");