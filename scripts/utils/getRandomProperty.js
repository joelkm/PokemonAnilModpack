const nthline = require('nthline');

module.exports = {
    getRandomMove: async function (filePath, min = 0, max = 643, mandatoryHitMove) {
        let valueResult;
        do {
            const randomLine = Math.floor((Math.random() * (max - min + 1) + min));
            valueResult = await nthline(randomLine, filePath)
        } while (mandatoryHitMove && valueResult.split(',')[6] == "Status");

        return valueResult.split(',')[1];
    },
    getRandomAbility: async function (filePath, min = 0, max = 204) {
        const randomLine = Math.floor((Math.random() * (max - min + 1) + min));
        const valueResult = await nthline(randomLine, filePath);
        return valueResult.split(',')[1];
    },
    getRandomPokemon: async function (pokemon) {
        const randomPokemonNumber = Math.floor((Math.random() * (pokemon.length - 1 - 0 + 1) + 0));
        return pokemon[randomPokemonNumber];
    },
    getRandomCombatItem: async function (filePath, min = 0, max = 688) {
        let valueResult
        let item;
        do {
            const randomLine = Math.floor((Math.random() * (max - min + 1) + min));
            item = await nthline(randomLine, filePath);
            valueResult = item.split(',');
        } while (valueResult[4] != 7);

        return valueResult[1];
    }
}