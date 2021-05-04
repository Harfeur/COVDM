window.addEventListener("DOMContentLoaded", (event) => {
    var el = document.getElementById('footer');

    function majHauteur(x) {
        switch (x) {
            case 1:
                el.style.setProperty("height", 150 + 'px');
                break;
            case 2:
                el.style.setProperty("height", 235 + 'px');
                break;
            default:
                el.style.setProperty("height", 295 + 'px');
                break;
        }
    }

    var tabCom = [];
    avis.forEach(function (e) {
        if (e.message != "") {
            tabCom.push({
                "nom": e.nom,
                "email": e.email,
                "message": e.message,
                "note": e.note
            });
        }
    })

    if (nomBat.indexOf('-') != -1) var tab = nomBat.split('-');
    else var tab = nomBat.split(addrVille);
    var titreBat = tab[0];

    new Vue({
        el: '#app',
        vuetify: new Vuetify(),
        data: () => ({
            time: horaire,
            show: false,
            reveal: false,
            id: id,
            e1: 1,
            e2: 1,
            rating: 3,
            duree: null,
            isActive: false,
            items: tabCom,
            jour: [{
                title: 'Lundi'
            },
                {
                    title: 'Mardi'
                },
                {
                    title: 'Mercredi'
                },
                {
                    title: 'Jeudi'
                },
                {
                    title: 'Vendredi'
                },
                {
                    title: 'Samedi'
                },
                {
                    title: 'Dimanche'
                },
            ],
            model: 1,
            dialog: false,
            dialog1: false,
            dialog2: false,
            sheet: false,
            sheet1: false,
            clock: true,
            com: null,
            prenom: "",
            nom: "",
            email: "",
            alerte: false,
            alerte2: false,
            alerte3: false,
            placement: 0,
            heureO: 1,
            heureF: 1,
            der: null,
            pb1: true,
            changeO: '',
            changeF: '',
            nouvelHeure: false,
            nbCom: true,
            attenteMoy: attenteMoyenne,
            moyenne: parseInt(moy) + Math.round((moy - Math.trunc(moy))),
            oui: 0,
            non: 100,
            titre: titreBat,
            tabGif: [["https://giphy.com/embed/6tHy8UAbv3zgs", "https://giphy.com/gifs/thank-you-spongebob-squarepants-6tHy8UAbv3zgs"], ["https://giphy.com/embed/14tCeoSGpXCWrQvixk", "https://giphy.com/gifs/true-and-the-rainbow-kingdom-funny-netflix-14tCeoSGpXCWrQvixk"], ['https://giphy.com/embed/xIJLgO6rizUJi', 'https://giphy.com/gifs/alice-in-wonderland-thank-you-xIJLgO6rizUJi'], ["https://giphy.com/embed/xUA7aN1MTCZx97V1Ic", "https://giphy.com/gifs/iliza-iliza-shlesinger-xUA7aN1MTCZx97V1Ic"], ["https://giphy.com/embed/3oz8xIsloV7zOmt81G", "https://giphy.com/gifs/arg-thank-you-cat-3oz8xIsloV7zOmt81G"]],
            gif: 0,
            numero: num,
            base:"",
            urlBat: web,
            bat :"",
            baseU:"",
            changeTel:false,
            changeUrl:false,
        }),
        methods: {
            validURL() {
                var str = this.urlBat
                var pattern = new RegExp('^(https?:\\/\\/)?' + 
                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
                    '((\\d{1,3}\\.){3}\\d{1,3}))' + 
                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + 
                    '(\\?[;&a-z\\d%_.~+=-]*)?' + 
                    '(\\#[-a-z\\d_]*)?$', 'i'); 
                this.urlBat=str
                if(this.urlBat.length>50){
                    this.bat=this.urlBat.substr(0,50)+"..."
                }
                else{
                    this.bat=this.urlBat
                }
                return !!pattern.test(str);
            },
            validTEL() {
                var regex = new RegExp(/^0[0-9]{9}/);
                if (regex.test(this.numero)) {
                    return (true);
                }
                var regex = new RegExp(/^\+33[0-9]{9}/);
                if (regex.test(this.numero)) {
                    return (true);
                }
                return (false);
            },
            changeTelephone(){
                this.base=this.numero;
                this.changeTel=true;
            },
            changementTEL(){
                if(this.validTEL()){
                    fetch('/majTEL', {
                        method: 'POST',
                        body: JSON.stringify({
                            id:this.id,
                            tel:this.numero
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }
                else{
                    this.numero=this.base
                }
                this.changeTel=false;
            },
            changeLienUrl(){
                this.baseU=this.urlBat
                this.changeUrl=true;
            },
            changementURL(){
                if(this.validURL()){
                    fetch('/majURL', {
                        method: 'POST',
                        body: JSON.stringify({
                            id:this.id,
                            url:this.urlBat
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    if(this.urlBat.length>50){
                        this.bat=this.urlBat.substr(0,50)+"..."
                    }
                    else{
                        this.bat=this.urlBat
                    }
                    
                }
                else{
                    this.urlBat=this.baseU
                }
                this.changeUrl=false;
            },
            choixGif() {
                min = Math.ceil(0);
                max = Math.floor(this.tabGif.length - 1);
                this.gif = Math.floor(Math.random() * (max - min + 1)) + min;
                console.log(this.gif)
            },
            tempsAttente(x) {
                this.attenteMoy = Math.round(x);
                return true;
            },
            ouvreCom() {
                var expansion = document.getElementById('exp');
                var nbVote = ((deroulement.oui) + (deroulement.non));
                this.oui = Math.round((deroulement.oui * 100) / nbVote);
                this.non = Math.round((deroulement.non * 100) / nbVote);
                this.reveal = true;
                expansion.style.display = "none";
            },
            fermeCom() {
                var expansion = document.getElementById('exp');
                this.reveal = false;
                expansion.style.display = "block";
            },
            scrollMoiStp() {
                this.changeTel=false;
                this.changeUrl=false;
                this.img = !this.img;
                setTimeout(scroll, 200);
            },
            liste(index) {
                this.placement = index;
            },
            partageExp() {
                this.show = !this.show;
                setTimeout(scroll, 400);
            },
            presenter() {
                this.alerte = false;
                this.alerte2 = false;
                this.alerte3 = false;
                if (this.prenom == "" || this.nom == "" || this.email == "") {
                    this.alerte = true;
                } else {
                    var ok = true;
                    this.items.forEach(element => {
                        if (element.nom == this.prenom + " " + this.nom) {
                            this.alerte3 = true;
                            ok = false
                        }
                    });
                    if (checkEmail(this.email) && ok) {
                        this.dialog = false;
                        this.e1 = 2;
                        setTimeout(scroll, 400);
                    } else {
                        if (ok) {
                            this.alerte2 = true;
                        }
                    }
                }
            },
            deroulement(choix) {
                if (choix == 1) {
                    this.der = true;
                } else {
                    this.der = false;
                }
                this.e1 = 3;
                setTimeout(scroll, 400);
            },
            dureeDonner() {
                this.e1 = 4;
                setTimeout(scroll, 400);
            },
            eval() {
                this.e1 = 5;
                setTimeout(scroll, 400);
                fetch('/ajoutCommentaire', {
                    method: 'POST',
                    body: JSON.stringify({
                        nom: this.prenom + ' ' + this.nom,
                        email: this.email,
                        id: this.id,
                        note: this.rating,
                        attente: this.duree,
                        bonDeroulement: this.der,
                        message: this.com
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if (this.com != "") {
                    this.items.push({
                        "nom": this.prenom + ' ' + this.nom,
                        "email": this.email,
                        "message": this.com,
                        "note": this.rating
                    });
                }
            },
            getHoraireToString(x) {
                var heure = parseInt(x).toString();
                x = Math.abs(parseFloat(x));
                let n = parseInt(x);
                let dec = (parseInt(parseFloat((Number((x - n).toFixed(Math.abs(("" + x).length - ("" + n).length - 1)))).toFixed(2)) * 100)).toString().padStart(2, "0");
                var minute = dec.toString();
                return heure + ":" + minute;
            },
            getStringToHoraire(x) {
                var tab = x.split(':');
                var hh = parseInt(tab[0]);
                var mm = parseInt(tab[1]) / 100;
                return hh + mm;
            },
            majHoraire() {
                if (horaire[(this.jour[this.placement].title).toLowerCase()].length != 0) {
                    this.heureO = this.getHoraireToString(this.time[(this.jour[this.placement].title).toLowerCase()][0]);
                    this.heureF = this.getHoraireToString(this.time[(this.jour[this.placement].title).toLowerCase()][1]);
                    this.clock = true;
                    return true
                }
                this.clock = false;
                return false
            },
            ouvreHoraire1() {
                var texte = document.getElementsByClassName('v-btn__content')[1].innerHTML
                if (texte == 'Fermé') {
                    this.e2 = 1;
                    this.nouvelHeure = true;

                } else {
                    this.dialog1 = true;
                }

            },
            ouvreHoraire2() {
                var texte = document.getElementsByClassName('v-btn__content')[2].innerHTML
                if (texte == 'Fermé') {
                    this.e2 = 1;
                    this.nouvelHeure = true;

                } else {
                    this.dialog2 = true;
                }

            },
            modifHoraireOuverture() {
                if (horaire[(this.jour[this.placement].title).toLowerCase()].length != 0) {
                    var heureOuverture = this.getStringToHoraire(this.changeO);
                    if (heureOuverture < horaire[(this.jour[this.placement].title).toLowerCase()][1]) {
                        fetch('/majHoraire', {
                            method: 'POST',
                            body: JSON.stringify({
                                id: this.id,
                                jour: (this.jour[this.placement].title).toLowerCase(),
                                heureO: heureOuverture,
                                heureF: horaire[(this.jour[this.placement].title).toLowerCase()][1]
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        this.time[(this.jour[this.placement].title).toLowerCase()][0] = heureOuverture;
                        this.majHoraire();
                    } else {
                        this.pb1 = true;
                        this.sheet = true;
                    }

                }
            },
            modifHoraireFermeture() {
                if (horaire[(this.jour[this.placement].title).toLowerCase()].length != 0) {
                    var heureFermeture = this.getStringToHoraire(this.changeF);
                    console.log(heureFermeture > horaire[(this.jour[this.placement].title).toLowerCase()][0])
                    if (heureFermeture > horaire[(this.jour[this.placement].title).toLowerCase()][0]) {
                        fetch('/majHoraire', {
                            method: 'POST',
                            body: JSON.stringify({
                                id: this.id,
                                jour: (this.jour[this.placement].title).toLowerCase(),
                                heureO: horaire[(this.jour[this.placement].title).toLowerCase()][0],
                                heureF: heureFermeture
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        this.time[(this.jour[this.placement].title).toLowerCase()][1] = heureFermeture;
                        this.majHoraire();
                    } else {
                        this.pb1 = false;
                        this.sheet = true;
                    }

                }
            },
            modifHoraire() {
                var heureOuverture = this.getStringToHoraire(this.changeO);
                var heureFermeture = this.getStringToHoraire(this.changeF);

                if(heureOuverture < heureFermeture){
                    fetch('/majHoraire', {
                        method: 'POST',
                        body: JSON.stringify({
                            id: this.id,
                            jour: (this.jour[this.placement].title).toLowerCase(),
                            heureO: heureOuverture,
                            heureF: heureFermeture
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    this.time[(this.jour[this.placement].title).toLowerCase()][1] = heureFermeture;
                    this.time[(this.jour[this.placement].title).toLowerCase()][0] = heureOuverture;
                    this.majHoraire();
                    this.nouvelHeure = false;
                }
                else {
                    this.sheet1=true;
                }
            }
        },

    })

    function checkEmail(inputText) {
        var expressionReguliere = /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
        return expressionReguliere.test(inputText)
    }

    function scroll() {
        window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });


    }
});

