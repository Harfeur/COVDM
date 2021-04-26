




// let id_region = urlParams.get('id_region');
// let id_departement = urlParams.get('id_departement');

//-------------------------------------------------------- Région ----------------------------------------------------------------------------------------

function attenteMoyenneVaccin(id_region){
    var div = '<div class="chartPlus" style="height: 300px;width: 48%;display:inline-block" id="my_dataviz"></div>'

    $("#contentchartSupp").append(div);
    $(".chartPlus").hide();

    // set the dimensions and margins of the graph
    var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = 450 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Read the data and compute summary statistics for each specie
    $.get("/regions").done(dataR =>{
        var sumstat = [];
        var reg = {};
        var dep = {};
        var domain = [];
        var point = [];


        dataR.forEach(elt => {   
            if(!id_region){

                sumstat.push({
                    "key":elt.properties.nom,
                    "value":{
                        "interQuantileRange":elt.properties.dataAttenteVaccinations.ecart_type,
                        "median":elt.properties.dataAttenteVaccinations.mediane,
                        "min":elt.properties.dataAttenteVaccinations.min,
                        "max":elt.properties.dataAttenteVaccinations.max,
                        "q1":elt.properties.dataAttenteVaccinations.q1,
                        "q3":elt.properties.dataAttenteVaccinations.q3
                    }
                });

                domain.push(elt.properties.nom)
            }
            
            reg[elt.properties.code] = {"nom":elt.properties.nom}
        });
        
        $.get("/departements",{
            id_region: id_region}).done(dataD => {

                    dataD.forEach(obj => {
                        if(id_region && id_region == obj.properties.codeRegion){

                            sumstat.push({
                                "key":obj.properties.nom,
                                "value":{
                                    "interQuantileRange":obj.properties.dataAttenteVaccinations.ecart_type,
                                    "median":obj.properties.dataAttenteVaccinations.mediane,
                                    "min":obj.properties.dataAttenteVaccinations.min,
                                    "max":obj.properties.dataAttenteVaccinations.max,
                                    "q1":obj.properties.dataAttenteVaccinations.q1,
                                    "q3":obj.properties.dataAttenteVaccinations.q3
                                }
                            });
                            
                            dep[obj.properties.code] = {"nom":obj.properties.nom}

                            domain.push(obj.properties.nom)
                        }else{
                            point.push(
                                {"attente":obj.properties.dataAttenteVaccinations.mediane, 
                                    "nomRegion":reg[obj.properties.codeRegion].nom,
                                "nom":obj.properties.nom})
                        }
                    });
                
            
            $.get("/sitesVaccinations").done(dataP =>{
                if (id_region) {

                    dataP.forEach(oel => {
                        if(dep[oel.adresse.codeDepartement] != null){
                            point.push(
                                {"attente":oel.stats.attenteMoyenne, 
                                    "nomRegion":dep[oel.adresse.codeDepartement].nom,
                                "nom":oel.rs})
                        }
                    })
                }
            
                //console.log(point);
                // Show the Y scale
                var y = d3.scaleBand()
                .range([ height, 0 ])
                .domain(domain)
                .padding(.4);
                svg.append("g")
                .call(d3.axisLeft(y).tickSize(0))
                .select(".domain").remove()

                // Show the X scale
                var x = d3.scaleLinear()
                .domain([0,25])
                .range([0, width])
                svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(10))
                .select(".domain").remove()

                // Color scale
                var myColor = d3.scaleSequential()
                .interpolator(d3.interpolateInferno)
                .domain([4,8])

                // Add X axis label:
                svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + margin.top + 30)
                .text("Temps attente");

                // Show the main vertical line
                svg
                .selectAll("vertLines")
                .data(sumstat)
                .enter()
                .append("line")
                .attr("x1", function(d){return(x(d.value.min))})
                .attr("x2", function(d){return(x(d.value.max))})
                .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
                .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
                .attr("stroke", "black")
                .style("width", 40)

                // rectangle for the main box
                svg
                .selectAll("boxes")
                .data(sumstat)
                .enter()
                .append("rect")
                    .attr("x", function(d){return(x(d.value.q1))}) // console.log(x(d.value.q1)) ;
                    .attr("width", function(d){ ; return(x(d.value.q3)-x(d.value.q1))}) //console.log(x(d.value.q3)-x(d.value.q1))
                    .attr("y", function(d) { return y(d.key); })
                    .attr("height", y.bandwidth() )
                    .attr("stroke", "black")
                    .style("fill", "#69b3a2")
                    .style("opacity", 0.3)

                // Show the median
                svg
                .selectAll("medianLines")
                .data(sumstat)
                .enter()
                .append("line")
                .attr("y1", function(d){return(y(d.key))})
                .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
                .attr("x1", function(d){return(x(d.value.median))})
                .attr("x2", function(d){return(x(d.value.median))})
                .attr("stroke", "black")
                .style("width", 80)

                // create a tooltip
                var tooltip = d3.select("#my_dataviz")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("font-size", "16px")
                // Three function that change the tooltip when user hover / move / leave a cell
                var mouseover = function(d) {
                tooltip
                .transition()
                .duration(200)
                .style("opacity", 1)
                tooltip
                    .html("<span style='color:grey'>Département: </span>" + d.nom) // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
                    .style("left", (d3.mouse(this)[0]+100) + "px")
                    .style("top", (d3.mouse(this)[1]+500) + "px")
                }
                var mousemove = function(d) {
                tooltip
                .style("left", (d3.mouse(this)[0]+100) + "px")
                .style("top", (d3.mouse(this)[1]+500) + "px")
                }
                var mouseleave = function(d) {
                tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
                }

                // Add individual points with jitter
                var jitterWidth = 50
                svg
                .selectAll("indPoints")
                .data(point)
                .enter()
                .append("circle")
                .attr("cx", function(d){ return(x(d.attente))})  //temps attente
                .attr("cy", function(d){ return( y(d.nomRegion) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth )}) //nom region
                .attr("r", 4)
                .style("fill", function(d){ return(myColor(+d.attente)) })
                .attr("stroke", "black")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

                //title
                if(!id_region){                
                    //en France
                    svg.append("text")
                    .attr("x", (width / 2))             
                    .attr("y", 0 - (margin.top / 2))
                    .attr("text-anchor", "middle")  
                    .style("font-size", "17px") 
                    .style("text-decoration", "underline")  
                    .style("font-weight", "bold")  
                    .text("Temps d'attente en France dans chaque région pour les sites de vaccination");
                }else{            
                    //pour une région
                    svg.append("text")
                    .attr("x", (width / 2))             
                    .attr("y", 0 - (margin.top / 2))
                    .attr("text-anchor", "middle")  
                    .style("font-size", "17px") 
                    .style("text-decoration", "underline")  
                    .style("font-weight", "bold")  
                    .text("Temps d'attente en "+ reg[id_region].nom +" dans chaque département pour les sites de vaccination");
                }
            });
        });      

    });

}

// attenteMoyenneVaccin();

function afficherStatVaccin(id_region) {
    var region = {};
    var departement = {};
    var nbSiteReg = [];
    var nbSiteDep = [];
    var totalSite = 0;
    var meilleureSite = [];
    var depBestSite = {};
    var unDepartement = {};
    var nbContainer = 3;
    $("#contentchartSupp").empty();
    //Données
    $.get("/regions").done(dataR => {


        //création object pour chaque région
        dataR.forEach(elt => {
            //region : regroupe le nombre de sites pour chaque region
            region[elt.properties.code] = {
                "name": elt.properties.nom,
                // y = nombre de site par région en pourcentage et nbSite le nombre exacte
                "y": 0,
                "nbSite": 0,
                "exploded": true
            }
        });

        //-------------------------------------------------------- Site Prélevement-----------------------------------------------------------
        $.get("/departements", {
            id_region: id_region,
            id_departement: id_departement
        }).done(dataD => {
            dataD.forEach(oel => {
                //departement : regroupe le nombre de sites pour chaque departement
                departement[oel.properties.code] = {
                    "name": oel.properties.nom,
                    // y = nombre de site par département en pourcentage et nbSite le nombre exacte
                    "y": 0,
                    "nbSite": 0,
                    "exploded": true
                }
                //depBestSite : regroupe la moyenne de chaque site pour chaque departement
                depBestSite[oel.properties.code] = {
                    "name": oel.properties.nom,
                    "bestSite": []
                }
                if (id_departement && id_departement == oel.properties.code) {
                    unDepartement[id_departement] = {
                        "name": oel.properties.nom,
                        "bestSite": [],
                        "nbSite": 0,
                        "exploded": true
                    }
                }
            })

            //Données
            $.get("/sitesVaccinations", {
                id_region: id_region,
                id_departement: id_departement
            }).done(dataP => {


                //maj region
                dataP.forEach(obj => {
                    //ajout du site par région
                    region[obj.adresse.codeRegion].y += 1
                    region[obj.adresse.codeRegion].nbSite += 1

                    if (id_region) {
                        if (departement[obj.adresse.codeDepartement] != null) {
                            departement[obj.adresse.codeDepartement].y += 1
                            departement[obj.adresse.codeDepartement].nbSite += 1

                            //meilleure site
                            if (obj.avis.length != 0) {
                                var nbA = 0
                                obj.avis.forEach(a => {
                                    nbA += a.note
                                })
                                var totalA = nbA / obj.avis.length
                                var siteAvis = {
                                    "y": totalA,
                                    "label": obj.c_nom,
                                    "ville": obj.adresse.ville,
                                    "departement": depBestSite[obj.adresse.codeDepartement].name
                                }

                                depBestSite[obj.adresse.codeDepartement].bestSite.push(siteAvis)
                            }
                        }
                    }

                    if (id_departement) {
                        if (unDepartement[obj.adresse.codeDepartement] != null) {
                            unDepartement[obj.adresse.codeDepartement].nbSite += 1
                            //meilleure site
                            if (obj.avis.length != 0) {
                                var nbA = 0
                                obj.avis.forEach(a => {
                                    nbA += a.note
                                })
                                var totalA = nbA / obj.avis.length
                                var siteAvis = {
                                    "y": totalA, //moyenne
                                    "label": obj.c_nom,
                                    "ville": obj.adresse.ville
                                }

                                unDepartement[obj.adresse.codeDepartement].bestSite.push(siteAvis)
                            }
                        }
                    }



                });


                totalSite = dataP.length

                //mis en pourcentage + ajout dans liste pour les datas chart pie
                for (const [key, value] of Object.entries(region)) {
                    region[key].y = ((value.y * 100) / totalSite).toFixed(1)
                    nbSiteReg.push(value)
                }
                for (const [key, value] of Object.entries(departement)) {
                    departement[key].y = ((value.y * 100) / totalSite).toFixed(1)
                    nbSiteDep.push(value)
                }


                //Chargement
                $('body').addClass('loaded');


                //affichage chart pie
                if (!id_region && !id_departement) {
                    //nb site par region 
                    $('#chartContainer1').show();
                    $('#chartContainer2').hide();
                    var chart = new CanvasJS.Chart("chartContainer1", {
                        exportEnabled: true,
                        animationEnabled: true,
                        width: 500,
                        title: {
                            text: "Nombre de sites de vaccination par région",
                            fontSize: 20,
                        },
                        legend: {
                            cursor: "pointer",
                        },
                        data: [{
                            type: "pie",
                            showInLegend: false,
                            toolTipContent: "{name}: <strong>{y}%</strong> <br>Nombre de site de vaccination : {nbSite}",
                            indexLabel: "{name} - {y}%",
                            dataPoints: nbSiteReg
                        }]
                    });

                    chart.render();
                    attenteMoyenneVaccin();

                } else if (id_departement) {
                    console.log(unDepartement);
                } else {
                    //nb site par département pour une région donnée
                    $("#chartContainer2").show();
                    $("#chartContainer1").hide();
                    var chart = new CanvasJS.Chart("chartContainer2", {
                        exportEnabled: true,
                        animationEnabled: true,
                        width: 500,
                        title: {
                            text: "Nombre de sites de vaccination par département de la région " + region[id_region].name,
                            fontSize: 20,
                        },
                        legend: {
                            cursor: "pointer",
                        },
                        data: [{
                            type: "pie",
                            showInLegend: false,
                            toolTipContent: "{name}: <strong>{y}%</strong> <br>Nombre de site de vaccination : {nbSite}",
                            indexLabel: "{name} - {y}%",
                            dataPoints: nbSiteDep
                        }]
                    });
                    chart.render();
                    attenteMoyenneVaccin(id_region);
                    //meilleure site par département pour une région donnée
                    for (const [key, value] of Object.entries(departement)) {
                        
                        var id_Div = "chartContainer" + nbContainer
                        var div = '<div class="chartPlus"  id="' + id_Div + '"></div>'
                        nbContainer += 1
                        $("#contentchartSupp").append(div);
                        $(".chartPlus").hide();
                        var chart = new CanvasJS.Chart(id_Div, {
                            animationEnabled: true,
                            exportEnabled: true,
                            theme: "light1", // "light1", "light2", "dark1", "dark2"
                            width: 500,
                            title: {
                                text: "Moyenne des notes de chaque site de vaccination en " + depBestSite[key].name,
                            fontSize: 20,
                            },
                            axisY: {
                                includeZero: true,
                            },
                            axisX: {
                                labelFontSize: 10,
                            },
                            data: [{
                                type: "bar", //change type to bar, line, area, pie, etc
                                //indexLabel: "{y}", //Shows y value on all Data Points
                                indexLabelFontColor: "#5A5757",
                                indexLabelFontSize: 14,
                                indexLabelPlacement: "outside",
                                toolTipContent: "{label}<br> Moyenne avis : {y} <strong></strong> <br>Ville : {ville} ",
                                dataPoints: depBestSite[key].bestSite
                            }]
                        });

                        chart.render();
                    }
                }

            });

        });

    });
}
//afficherStatVaccin(76);

