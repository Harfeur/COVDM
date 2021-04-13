new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: () => ({
        time: horaire,
        show: false,
        reveal: false,
        id: id,
        e1: 1,
        rating: 3,
        duree: null,
        isActive: false,
        items: avis,
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
        com: null,
        prenom: "",
        nom: "",
        email: "",
        alerte: false,
        alerte2: false,
        placement: 0,
        heureO: 1,
        heureF: 1,
        der: null,
        pb1: true,
    }),
    methods: {
        ouvreCom() {
            var expansion = document.getElementById('exp');
            this.reveal = true;
            expansion.style.display = "none";
        },
        fermeCom() {
            var expansion = document.getElementById('exp');
            this.reveal = false;
            expansion.style.display = "block";
        },
        liste(index) {
            this.placement = index;
        },
        presenter() {
            if (this.prenom == "" || this.nom == "" || this.email == "") {
                this.alerte = true;
            } else {
                if (checkEmail(this.email)) {
                    console.log(this.prenom + ' ' + this.nom);
                    console.log(this.email);
                    this.dialog = false;
                    this.e1 = 2;
                } else {
                    this.alerte2 = true;
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
        },
        attente() {
            console.log(this.duree);

            this.e1 = 4;
        },
        eval() {
            console.log(this.rating);
            console.log(this.com);
            this.e1 = 5;

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
        },
        getHoraireToString(x) {
            var heure = parseInt(x).toString();
            x = Math.abs(parseFloat(x));
            let n = parseInt(x);
            let dec = (parseInt(parseFloat((Number((x - n).toFixed(Math.abs(("" + x).length - ("" + n).length - 1)))).toFixed(2)) * 100)).toString().padStart(2, "0");
            var minute = dec.toString();
            return heure + ":" + minute;
        },
        getStringToHoraire(x){
            var tab = x.split(':');
            var hh = parseInt(tab[0]);
            var mm = parseInt(tab[1])/100;
            return hh+mm;

        },
        majHoraire(){
            if (horaire[(this.jour[this.placement].title).toLowerCase()].length != 0) {
                this.heureO=this.getHoraireToString(this.time[(this.jour[this.placement].title).toLowerCase()][0][0]);
                this.heureF=this.getHoraireToString(this.time[(this.jour[this.placement].title).toLowerCase()][0][1]);
            }
            console.log(this.heureO);
        },
        ouvreHoraire1(){
            console.log('ok')
            this.majHoraire();
            this.dialog1=true;
        },
        ouvreHoraire2(){
            this.majHoraire();
            this.dialog2=true;
        },
        modifHoraireOuverture() {
            if (horaire[(this.jour[this.placement].title).toLowerCase()].length != 0) {
                var heureOuverture = this.getStringToHoraire(this.heureO);
                if(heureOuverture<horaire[(this.jour[this.placement].title).toLowerCase()][0][1]){
                    this.dialog1=false;
                    fetch('/majHoraire', {
                        method: 'POST',
                        body: JSON.stringify({
                            id: this.id,
                            jour: (this.jour[this.placement].title).toLowerCase(),
                            heureO: heureOuverture,
                            heureF: horaire[(this.jour[this.placement].title).toLowerCase()][0][1]
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    this.majHoraire;
                }
                else {
                    this.pb1=true;
                    this.sheet=true;
                }
                
            }
        },
        modifHoraireFermeture() {
            if (horaire[(this.jour[this.placement].title).toLowerCase()].length != 0) {
                var heureFermeture = this.getStringToHoraire(this.heureF);
                console.log(heureFermeture>horaire[(this.jour[this.placement].title).toLowerCase()][0][0])
                if(heureFermeture>horaire[(this.jour[this.placement].title).toLowerCase()][0][0]){
                    this.dialog2 = false;
                    fetch('/majHoraire', {
                        method: 'POST',
                        body: JSON.stringify({
                            id: this.id,
                            jour: (this.jour[this.placement].title).toLowerCase(),
                            heureO: horaire[(this.jour[this.placement].title).toLowerCase()][0][0],
                            heureF: heureFermeture
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    this.majHoraire;
                }
                else { 
                    this.pb1=false;
                    this.sheet=true;
                }
                
            }
        }
    },

})

function checkEmail(inputText) {
    var expressionReguliere = /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
    return expressionReguliere.test(inputText)
}