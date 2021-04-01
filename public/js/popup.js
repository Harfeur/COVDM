new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: () => ({
        timeOuverture: '10:15',
        timeFermeture: '10:15',
        show: false,
        reveal: false,
        e1: 1,
        rating: 3,
        duree: 0,
        isActive: false,
        items: [{
            header: 'Commentaires :'
        },
            {
                subtitle: `I'll be in your neighborhood doing errands this weekend. Do you want to hang out?`
            },
            {
                divider: true,
                inset: true
            },
            {
                subtitle: `Wish I could come, but I'm out of town this weekend.`
            },
            {
                divider: true,
                inset: true
            },
            {
                subtitle: 'Do you have Paris recommendations? Have you ever been?'
            },
        ],
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
        placement: 0,
        com: "",
        prenom: "",
        nom: "",
        email: "",
        alerte:false,
        alerte2:false,
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
        }
    }
})
function checkEmail(email) {
    var re = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}