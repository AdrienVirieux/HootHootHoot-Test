
// Définie une structure JSON vide, que l'on affecte au LocalStorage 'TEMPERATURE'
export function initLocalStorage() {
    let structStorageJSON = {
        'DATE': null,
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
    localStorage.setItem('TEMPERATURE', JSON.stringify(structStorageJSON));
}