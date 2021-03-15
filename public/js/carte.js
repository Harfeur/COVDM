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
// var markersCluster = new L.MarkerClusterGroup();

//Ajouter l'appel à la BDD

$.get("/sitesPrelevements").done(data => {
    data.forEach(obj => {

        var popup = obj.rs +
            '<br>' + obj.adresse +
            '<br>' + obj.horaire +
            '<br>' + obj.do_prel + ' ' + obj.do_antigenic + ' ' + obj.check_rdv +
            //_id pour identification page formul
            '<a href="#"> + </a>';

        //Création du marker et de son groupe
        var marker = L.marker([obj.latitude, obj.longitude]);
        marker.bindPopup(popup)
        marker.addTo(mymap)
        // markersCluster.addLayer(marker);

    });
    
    //map.addLayer(markersCluster);
})
