new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: () => ({
        time: horaire,
        show: false,
        reveal: false,
        e1: 1,
        rating: 3,
        duree: 0,
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
        com: "",
        prenom: "",
        nom: "",
        email: "",
        alerte:false,
        alerte2:false,
        placement: 0,
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
                this.alerte=true;
            }
            else{
                if(checkEmail(this.email)){
                    console.log(this.prenom);
                    console.log(this.nom);
                    console.log(this.email);
                    this.dialog=false;
                    this.e1 = 2;
                }
                else{
                    this.alerte2=true;
                }
            }
        },
        deroulement(choix) {
            if (choix == 1) {
                console.log("Oui");
            } else {
                console.log("Non");
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
        },
        getFloatDecimalPortion(x) {
            
            return },
        getHoraireToString(x) {
            var heure = parseInt(x).toString();
            x = Math.abs(parseFloat(x));
            let n = parseInt(x);
            let dec = (parseInt(parseFloat((Number((x - n).toFixed(Math.abs((""+x).length - (""+n).length - 1)))).toFixed(2)) * 100)).toString().padStart(2, "0");
            var minute = dec.toString();
            return heure+":"+minute;
        
        }
    },
    
})
function checkEmail(email) {
    var re = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
