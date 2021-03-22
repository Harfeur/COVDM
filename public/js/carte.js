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

//Chargement
$('body').addClass('loaded');

//Création groupe maker
var markersCluster = new L.MarkerClusterGroup({
    showCoverageOnHover: false
});


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
var rdv = "";

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

        markersCluster.addLayer(marker);
    });
    map.addLayer(markersCluster);
});


//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------


//Données
$.get("/regions").done(data => {


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

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}

    geojson = L.geoJson(data, {
        style: style,
        onEachFeature : onEachFeature
    }).addTo(map);

    layerControl.addOverlay(geojson, "Région");
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