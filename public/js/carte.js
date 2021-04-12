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

 
//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------



//Données
$.get("/regions").done(dataR => {

    dataRegion = dataR;

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
    

    //zoom
    function zoomToFeature(e) {
        var marker = cluster[e.sourceTarget.feature.properties.code].markerCG;

        for (const [key, value] of Object.entries(cluster)) {
            value.markerCG.remove();
        }

        map.addLayer(marker)

        if (map.getZoom() < 10) {
            map.fitBounds(e.target.getBounds());
            geojson.removeFrom(map);
            
            //rajout du style par défaut sauf pour la région cliquer
            geojson = L.geoJson(dataR, {
                style: function(feature) {
                    if(e.sourceTarget.feature.properties.code == feature.properties.code){
                        opacity = 0
                    }else{
                        opacity = 0.7
                    }
                    return {
                    fillColor: feature.properties.color,
                    weight: 5,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: opacity
                }},
                onEachFeature: onEachFeature
            }).addTo(map);
        }
        
    }

    

    //ajout des events
    function onEachFeature(feature, layer) {
        layer.on({
            click: zoomToFeature
        });
    }

    function addRegion(){
        geojson = L.geoJson(dataR, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    }
    addRegion()
    
    
    map.on('zoomend', function (e) {
        if (map.getZoom() < 7) {
            for (const [key, value] of Object.entries(cluster)) {
                value.markerCG.remove();
            }            
            geojson.removeFrom(map);
            addRegion();
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
                ho = " fermé";
                cHo = false;
            }else{ 
                ho = " ouvert :<br>";
                cHo = true;
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
            // Solution : base
            var popup = ""
            //si c'est fermé ou ouvert
            if (cHo){
                popup =  '<div > <p class="adresse_popup">'+ obj.adresse.adresse +'</p>'+
                '<p class="rs_popup">' + obj.rs + '</p>' +
                '<p class="horaire-o" > Actuellement' + ho + "</p>"+
                //'<br><br><strong>' + pcr + ' ' + ag + '</strong> ' +
                '<button  class="custom-btn btn-12" id="' + obj._id + '" onclick=maFonction(this.id)><span>Clique !</span><span>En savoir + </span></button></div>';
                      }else{                
                popup =  '<div > <p class="adresse_popup">'+ obj.adresse.adresse +'</p>'+
                '<p class="rs_popup">' + obj.rs + '</p>' +
                '<p class="horaire-f" > Actuellement' + ho + "</p>"+
                //'<br><br><strong>' + pcr + ' ' + ag + ' </strong>' +
                '<button  class="custom-btn btn-12" id="' + obj._id + '" onclick=maFonction(this.id)><span>Clique !</span><span>En savoir + </span></button></div>';
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

function maFonction(e){
    var i = "<iframe width='500' height='500' src='./batiment?id="+e+"'></iframe>" + "<a href=\"#\" onclick=\"hide(this.id)\">Ok!</a>";
    //$( "#popup" ).dialog({with:800,maxHeight:1000});
    $( "#popup" ).html(i).css('display', 'block');

    setTimeout(() => {
        popupOpen = true;
    }, 500);

}

$("#popup").on('click', e =>
{
    console.log("bye")
    if (popupOpen)
    {
        $("#popup").css('display', 'none');
        popupOpen = false;
    }
});
//---------------------------------------------------------------Map--------------------------------------------------------------




//Geolocalisation
function geoFindMe() {

    function success(position) {
      const latitude  = position.coords.latitude;
      const longitude = position.coords.longitude;

      var b = L.latLng(latitude,longitude);

      map.flyTo(b,15);
      map.once('moveend', function() {
        $.get('https://geo.api.gouv.fr/communes?lat='+latitude+'&lon='+longitude+'&fields=codeRegion').done(data => {
            var marker = cluster[data[0].codeRegion].markerCG;

            for (const [key, value] of Object.entries(cluster)) {
                value.markerCG.remove();
            }
    
            //suppression des régions 
            geojson.removeFrom(map);            
            
            //rajout styles des régions sauf celui où on est 
            geojson = L.geoJson(dataRegion, {
                style: function(feature) {
                    if(data[0].codeRegion == feature.properties.code){
                        opacity = 0
                    }else{
                        opacity = 0.7
                    }
                    return {
                    fillColor: feature.properties.color,
                    weight: 5,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: opacity
                }}
            }).addTo(map);

            map.addLayer(marker)
        })        
    });
      
    }
  
    function error() {
      console.log('Unable to retrieve your location');
    }
  
    if(!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
    } else {
      console.log('Locating…');
      navigator.geolocation.getCurrentPosition(success, error);
    }
  
  }
 
  
//Bouton geolocation
var localisation = L.Control.extend({
    onAdd: function() {
        var button = L.DomUtil.create('button');
        button.innerHTML = '<h1><i class="fas fa-map-marked-alt"></i></h1>';
        L.DomEvent.on(button, 'click', function () {  

            geoFindMe();

        });
        return button;
    }
});

var localisation = (new localisation()).addTo(map);



