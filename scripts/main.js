// Les données sont gardées même après avoir recharger la page 
// DONC TODO
localStorage.setItem('TEMPERATURE-CACHE', localStorage.getItem('TEMPERATURE'));
console.log(JSON.parse(localStorage.getItem('TEMPERATURE')));


// Fonctions implémentée
function sideMenu() {
    let sideNav = document.getElementById('side-nav');
    if (sideNav.style.display == 'none') {
        sideNav.style.display = 'block';
    }
    else {
        sideNav.style.display = 'none';
    }
}

// -----------------------------------------------
// Avoir le jour d'aujourd'hui
// Source : https://stackoverflow.com/questions/58531156/javascript-how-to-format-the-date-according-to-the-french-convention
var options = { year: 'numeric', month: 'long', day: 'numeric' };
var opt_weekday = { weekday: 'long' };
var today = new Date();
var weekday = toTitleCase(today.toLocaleDateString("fr-FR", opt_weekday));
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
var the_date = weekday + ' ' + today.toLocaleDateString("fr-FR", options);

document.getElementById('titreTemp').innerText = the_date;


// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //
// LISTENERS

// Ajout de Listener pour changer d'onglet
Array.from(document.querySelectorAll('#nav-onglet li, #nav-onglet span')).forEach(function (onglet) {
    onglet.addEventListener('click',
        function (event) {
            Array.from(document.querySelectorAll('.active')).forEach(function (elem_active) {
                elem_active.removeAttribute('class');
            });
            var elemEvent = event.target;
            if (event.target.tagName == 'SPAN')
                var elemEvent = event.target.parentNode;
            let element_a_id = elemEvent.getAttribute("value");
            document.getElementById(element_a_id).setAttribute('class', 'active');

            let elemBackColor = window.getComputedStyle(elemEvent, null).getPropertyValue("background-color");
            document.getElementById('content').style.backgroundColor = elemBackColor;
        }
    );
});

// Ajout de listener poour définir la température interieure ou exterieure à mettre en favori
Array.from(document.querySelectorAll('section p img')).forEach(function (onglet) {
    onglet.addEventListener('click',
        function (event) {
            Array.from(document.querySelectorAll('.favori')).forEach(function (elem_active) {
                elem_active.removeAttribute('class');
                elem_active.setAttribute('src', 'img/star-empty.png')
            });
            event.target.setAttribute('class', 'favori');
            event.target.setAttribute('src', 'img/star.png');
            setMinMax();
        }
    );
});

// -----------------------------------------------


// Une thes belle alerte alerte
// window.alert("Va te faire enculé sale fils de pute");



// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //
// GRAPH-HISTORIQUE

// Source : https://stackoverflow.com/questions/1050720/adding-hours-to-javascript-date-object
Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

//
let graph;
function initGraph() {
    let date = new Date().addHours(-24);

    // Initialisation d'une base d'un graphe
    graph = new Chart(document.getElementById("myChart"), {
        type: 'scatter',
        data: {
            datasets: [{
                label: "T° intérieure",
                borderColor: 'blue',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.05,
                showLine: true
            },
            {
                label: "T° extérieure",
                borderColor: 'red',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.05,
                showLine: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            'hour': 'dd/MM/yyyy HH:mm'
                        }
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    }
                }
            }
        }
    });

    // Ajout des anciennes valeures mise en cache
    let arraysCacheJSON = JSON.parse(localStorage.getItem('TEMPERATURE'));
    let tempIn = arraysCacheJSON['IN_TEMP'];
    let tempOut = arraysCacheJSON['OUT_TEMP'];

    for (i = 0; i < Object.keys(tempIn['TEMP']).length; ++i) {
        graph.data.datasets[0].data.push({ 'x': tempIn['TIME'][i], 'y': tempIn['TEMP'][i] });
        graph.data.datasets[1].data.push({ 'x': tempIn['TIME'][i], 'y': tempOut['TEMP'][i] });
    }
    graph.update();

    console.log(graph.data.datasets);
}


//
function updateGraph() {
    let arraysCacheJSON = JSON.parse(localStorage.getItem('TEMPERATURE'));
    let tempIn = arraysCacheJSON['IN_TEMP'];
    let tempOut = arraysCacheJSON['OUT_TEMP'];

    let i = Object.keys(tempIn['TEMP']).length - 1;

    graph.data.datasets[0].data.push({ 'x': tempIn['TIME'][i], 'y': tempIn['TEMP'][i] });
    graph.data.datasets[1].data.push({ 'x': tempIn['TIME'][i], 'y': tempOut['TEMP'][i] });

    graph.update();
}


// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //


// WEBSOCKET
function connectToCapteurs() {
    // Initialisation de la Websocket
    const socket = new WebSocket('wss://ws.hothothot.dog:9502');


    // Ajout d'un listener pour les possibles erreurs de la Websocket
    socket.addEventListener('error', function (event) {
        console.log("Problème de connection rencontré avec Websocket. Tentative de reconnection avec Fetch...");

        // On utilise alors la méthode Fetch
        fetch("https://hothothot.dog/api/capteurs?format=json", { method: "POST" })
            .then(response => {
                if (response.ok) {
                    return response.json();  // Convertion du message recu en JSON
                }
            })
            .then(function (data) {
                console.log('Objet recu du serveur (Fetch) :', data);
                try { getTemperature(data) }
                catch (e) { console.log(e) }
            })
            .catch((error) => console.log('Problème de connection rencontré avec Fetch'))
    });


    // Connection au server avec Websocket
    socket.onopen = function (event) {
        console.log("Connexion Websocket établie");

        // Envoi d'un message au serveur (obligatoire)
        socket.send("couscous");
        socket.onmessage = function (msg) {
            // Convertion du message recu en JSON
            var resultJson = JSON.parse(msg.data);

            console.log('Objet recu du serveur (Websocket) :', resultJson);
            try { getTemperature(resultJson) }
            catch (e) { console.log(e) }
        }
    }
}


// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //

// Initialisation du localStorage
// TODO a revoir car perte de données


// Ajoute les valeurs du serveur recu dans le localStorage
function localCacheTemp(temperatureIn, temperatureOut) {
    let arraysJSON = JSON.parse(localStorage.getItem('TEMPERATURE'));
    let tempIn = arraysJSON['IN_TEMP'];
    let tempOut = arraysJSON['OUT_TEMP'];

    // Instanciation des variables de Date
    var today = new Date();
    var yesterday = new Date().addHours(-1);

    // Enlèvement des valeurs que l'on veut pas
    for (i = 0; i < Object.keys(tempIn['TEMP']).length; ++i) {
        if (tempIn['TIME'][i] < yesterday) {
            tempIn['TEMP'].pop(i);
            tempIn['TIME'].pop(i);
        }
        if (tempOut['TIME'][i] < yesterday) {
            tempOut['TEMP'].pop(i)
            tempOut['TIME'].pop(i)
        }
    }

    // Ajout de la nouvelle température dans l'array respectif
    tempIn['TEMP'].push(temperatureIn);
    tempOut['TEMP'].push(temperatureOut);

    // Ajout de la date	dans l'array respectif
    tempIn['TIME'].push(today);
    tempOut['TIME'].push(today);

    // Modification de la valeur minimum et maximum
    if (tempIn['MIN'] == null || tempIn['MIN'] > temperatureIn) tempIn['MIN'] = temperatureIn;
    if (tempIn['MAX'] == null || tempIn['MAX'] < temperatureIn) tempIn['MAX'] = temperatureIn;

    if (tempOut['MIN'] == null || tempOut['MIN'] > temperatureOut) tempOut['MIN'] = temperatureOut;
    if (tempOut['MAX'] == null || tempOut['MAX'] < temperatureOut) tempOut['MAX'] = temperatureOut;

    //
    console.log(arraysJSON);

    // Ajout valeurs dans le localStorage
    localStorage.setItem('TEMPERATURE', JSON.stringify(arraysJSON));
}


// Permet de supprimer les valeurs mise en 'cache' (utiliser par notre graphe)
function removeTempStorage() {
    let structJSON = {
        'IN_TEMP': {
            'MIN': null,
            'MAX': null,
            'TEMP': [],
            'TIME': []
        },
        'OUT_TEMP': {
            'MIN': null,
            'MAX': null,
            'TEMP': [],
            'TIME': []
        }
    };
    localStorage.setItem('TEMPERATURE', JSON.stringify(structJSON));
    updateGraph();
}


// -----------------------------------------------
//
const spanMin = document.getElementById('span_min_temperature');
const spanMax = document.getElementById('span_max_temperature');

//
function setMinMax() {
    let temperature = JSON.parse(localStorage.getItem('TEMPERATURE'));
    if (document.getElementsByClassName('favori')[0].parentNode.id == 'p_in_temperature') {
        temperature = temperature['IN_TEMP'];
    }
    else {
        temperature = temperature['OUT_TEMP'];
    }

    spanMin.innerText = temperature['MIN'];
    spanMax.innerText = temperature['MAX'];
}


// -----------------------------------------------
// 
var span_in_temperature = document.getElementById('span_in_temperature');
var span_out_temperature = document.getElementById('span_out_temperature');
let content = document.querySelector('template').content;

//
function getTemperature(dataJSON) {
    let temperatureIn = dataJSON["capteurs"]["0"]["Valeur"];
    let temperatureOut = dataJSON["capteurs"]["1"]["Valeur"];

    if (parseFloat(temperatureIn) == 'NaN' && parseFloat(temperatureOut) == 'NaN') return;
    localCacheTemp(temperatureIn, temperatureOut);

    // Couleur utilisé suivant la température extérieure
    let color = 'white';
    if (temperatureOut < 0)
        color = 'blue';
    else if (35 < temperatureOut)
        color = 'red';
    span_out_temperature.setAttribute("class", color);
    span_out_temperature.innerText = temperatureOut;

    // Couleur utilisé suivant la température intérieure
    color = 'white'
    if (temperatureIn < 0)
        color = 'blue';
    else if (0 <= temperatureIn && temperatureIn < 12)
        color = 'cyan';
    else if (22 <= temperatureIn && temperatureIn < 50)
        color = 'orange';
    else if (50 <= temperatureIn)
        color = 'red';
    else
        color = 'white';
    span_in_temperature.setAttribute("class", color);
    span_in_temperature.innerText = temperatureIn;


    setMinMax();

    updateGraph();

    // Affichage des problèmes
    let allMsg = []

    if (temperatureOut < 0) {
        allMsg.push('Banquise en vue !');
    }
    else if (35 < temperatureOut) {
        allMsg.push('Hot ! Hot ! Hot !');
    }

    if (temperatureIn < 0) {
        allMsg.push('Canalisations gelées, appelez SOS plombier et mettez un bonnet !');
    }
    else if (0 <= temperatureIn && temperatureIn < 12) {
        allMsg.push('Montez le chauffage ou mettez un gros pull  !');
    }
    else if (22 < temperatureIn && temperatureIn <= 50) {
        allMsg.push('Baissez le chauffage !');
    }
    else if (50 <= temperatureIn) {
        allMsg.push('Appelez les pompiers ou arrêtez votre barbecue !');
    }

    let alertDiv = document.getElementById('contentAlert');
    // Remove toutes les alertes précédentes
    while (alertDiv.lastElementChild) {
        alertDiv.removeChild(alertDiv.lastElementChild);
    }

    // Ajout des nouvelles alertes
    for (i in allMsg.length) {
        alertDiv.appendChild(document.importNode(content, true));
        let span = document.querySelectorAll('#contentAlert section:last-of-type span')[0];
        span.innerText = allMsg[i];
        // Changer l'affichage de la température
        alertNotification(allMsg[i], temperatureIn);
    }
}


// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //


connectToCapteurs();
initGraph();
var interval = setInterval(function () {
    connectToCapteurs();
}, 300000);


// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js') // à adapter à l'URL du projet
        .then(() => { console.log('Service Worker Registered'); });
}


// -----------------------------------------------
// Notifications
function alertNotification(text, temperature) {
    var notifTitle = "Alerte température !";
    var notifBody = 'Température : ' + temperature + '.\n' + text;
    var notifImg = '/assets/images/android-chrome-192x192.png';
    var options = {
        body: notifBody,
        icon: notifImg
    }
    var notif = new Notification(notifTitle, options);
}

var button = document.getElementById("notifications");
button.addEventListener('click', function (e) {
    Notification.requestPermission().then(function (result) {
        if (result === 'granted') {
            alertNotification('test', 12.9)
        }
    });
});