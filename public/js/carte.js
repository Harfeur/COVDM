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

var allMarker = new Array;

var iconPrev = L.icon({
    iconUrl: '/images/localisationD.png',
    iconSize: [38, 40],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -96],
    }); 

$.get("/sitesPrelevements").done(data => {
    data.forEach(obj => {

        allMarker.push([obj._id,obj.latitude,obj.longitude]);

        var popup = obj.rs +
            '<br>' + obj.adresse +
            '<br>' + obj.horaire +
            '<br>' + obj.do_prel + ' ' + obj.do_antigenic + ' ' + obj.check_rdv +
            '<a href="'+obj._id+'"> + </a>';

        

        //Création du marker et de son groupe
        var marker = L.marker([obj.latitude, obj.longitude], {icon: iconPrev});
        marker.bindPopup(popup);
        markersCluster.addLayer(marker);

    });
    mymap.on('moveend', function(e) {
        console.log(mymap.getBounds().getSouthEast());
        console.log("");
        console.log(mymap.getBounds().getNorthWest());
        console.log(mymap.getZoom());
        

    });
    //supprimer tout les points
    //envoyer les points NW et SE et afficher les points correspond.
    mymap.addLayer(markersCluster);
})
