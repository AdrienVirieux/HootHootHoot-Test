import { getTemperature } from "./main";


// WEBSOCKET
export function connectToServeur() {
    // Initialisation de la Websocket
    const socket = new WebSocket('wss://ws.hothothot.dog:9502');


    // Ajout d'un listener pour les possibles erreurs de la Websocket
    socket.addEventListener('error', function(event) {
        console.log("Problème de connection rencontré avec Websocket. Tentative de reconnection avec Fetch...");

        // On utilise alors la méthode Fetch
        fetch("https://hothothot.dog/api/capteurs?format=json", { method: "POST" })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Convertion du message recu en JSON
                }
            })
            .then(function(data) {
                console.log('Objet recu du serveur (Fetch) :', data);
                try { getTemperature(data) } catch (e) { console.log(e) }
            })
            .catch((error) => console.log('Problème de connection rencontré avec Fetch'))
    });


    // Connection au server avec Websocket
    socket.onopen = function(event) {
        console.log("Connexion Websocket établie");

        // Envoi d'un message au serveur (obligatoire)
        socket.send("couscous");
        socket.onmessage = function(msg) {
            // Convertion du message recu en JSON
            var resultJson = JSON.parse(msg.data);

            console.log('Objet recu du serveur (Websocket) :', resultJson);
            try { getTemperature(resultJson) } catch (e) { console.log(e) }
        }
    }
}