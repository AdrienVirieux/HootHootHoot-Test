// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/random
//
// On renvoie un nombre aléatoire entre une valeur min (incluse)
// et une valeur max (exclue)
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomText() {
    let array_text = [
        "John a publié un nouvel article",
        "Elisabeth a modifié un article existant",
        "Tom a posté un nouveau commentaire",
        "Léa a modifié un commentaire existant"
    ];

    let int_index = getRandomArbitrary(0, 4);

    return array_text[int_index];
}

var obj_the_table = document.getElementById("the-table");

var int_interval = setInterval(function () {

    if (Array.from(obj_the_table.tBodies.item(0).rows).length < 10) {
        let template = document.getElementById("row-to-be-cloned");
        let obj_cloned_row = document.importNode(template.content, true);
        let cells = obj_cloned_row.querySelectorAll("td");
        cells[0].innerText = new Date().toLocaleString();
        cells[1].innerText = getRandomText();

        // let obj_cloned_row = document.importNode(template.content, true).querySelector('tr');
        // obj_cloned_row.cells[0].innerText = new Date().toLocaleString();
        // obj_cloned_row.cells[1].innerText = getRandomText();

        obj_the_table.tBodies[0].append(obj_cloned_row);

    }
    else {

        clearInterval(int_interval);
    }

}, 2000);
