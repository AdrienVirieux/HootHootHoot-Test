

// ------------------------------------------------------------------ //
// ------------------------------------------------------------------ //
// GRAPH-HISTORIQUE

// Source : https://stackoverflow.com/questions/1050720/adding-hours-to-javascript-date-object
// Date.prototype.addHours = function (h) {
//     this.setTime(this.getTime() + (h * 60 * 60 * 1000));
//     return this;
// }

//
let graph;
export function initGraph() {
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
export function updateGraph() {
    let arraysCacheJSON = JSON.parse(localStorage.getItem('TEMPERATURE'));
    let tempIn = arraysCacheJSON['IN_TEMP'];
    let tempOut = arraysCacheJSON['OUT_TEMP'];

    let i = Object.keys(tempIn['TEMP']).length - 1;

    graph.data.datasets[0].data.push({ 'x': tempIn['TIME'][i], 'y': tempIn['TEMP'][i] });
    graph.data.datasets[1].data.push({ 'x': tempIn['TIME'][i], 'y': tempOut['TEMP'][i] });

    graph.update();
}

