const fs = require('fs');
const path = require('path');
const { getRandomMove, getRandomPokemon, getRandomCombatItem } = require('./utils/getRandomProperty');
const { buildMoveSet, buildAbilitySet, buildTmLearnerList } = require('./utils/valueBuilders');

async function randomize() {

    function buildPath(file) {
        return path.join(__dirname, '..', '..', 'PBS', file);
    }

    const filePaths = {
        pokemon: buildPath('pokemon.txt'),
        moves: buildPath('moves.txt'),
        abilities: buildPath('abilities.txt'),
        encounters: buildPath('encounters.txt'),
        tms: buildPath('tm.txt'),
        trainers: buildPath('trainers.txt'),
        items: buildPath('items.txt')
    }

    let pokemonCollection = []; // Filled in randomizePokemonFile(), used in randomizeTmsFile()

    function isCommentLine(line) { // Useful to detect comment lines in any file
        if (line.includes('#')) return true;
        else return false;
    }

    async function randomizePokemonFile() {

        function getLearningLevels(values) {
            return values.filter(function (element) {
                if (!isNaN(parseInt(element))) return element;
            });
        }

        return await new Promise(function (resolve) {
            fs.readFile(filePaths.pokemon, 'utf-8', async function (err, data) {
                let lines = await data.split('\n');
                for (let index = 0; index < lines.length; index++) {
                    const splitedLineByEqual = lines[index].split('=');
                    const property = splitedLineByEqual[0];

                    const values = splitedLineByEqual[1].split(',');
                    switch (property) {
                        case 'Moves':
                            const learningLevels = getLearningLevels(values);

                            lines[index] = property + '=' + await buildMoveSet(learningLevels);
                            break;
                        case 'Abilities':
                            lines[index] = property + '=' + await buildAbilitySet(values);
                            break;
                        case 'HiddenAbility':
                            lines[index] = property + '=' + await buildAbilitySet(values);
                            break;
                        case 'InternalName':
                            pokemonCollection.push(lineCopy[1].split('\r')[0]); // Will come handy when randomizing TMs
                            break;
                        default:
                            break;
                    }
                }

                const resultFile = await lines.join('\n');
                await fs.writeFile(filePaths.pokemon, resultFile, 'utf-8', function () { })

                console.log('Pokemon: Randomizados con exito');
                resolve()
            })
        })
    }

    async function randomizeTmsFile() {

        function isTmItem(itemParams) {
            itemParams[1].includes('TM') && itemParams[2].includes('MT')
        }

        let tmsCollection = []; // This is used to bind the TM data to the in-game items

        await new Promise(function (resolve) {

            fs.readFile(filePaths.tms, 'utf-8', async function (err, data) {
                let lines = await data.split('\n');
                const mohs = ['SURF', 'STRENGTH', 'ROCKCLIMB', 'CUT', 'ROCKSMASH', 'WATERFALL', 'FLY', 'DIVE'];
                // Essential tms that we shouldn't modify

                for (let index = 0; index < lines.length; index++) {
                    if (isCommentLine(lines[index])) continue;

                    if (reducedLine.split(',').length == 1) {
                        let tmMove = await lines[index].split('[')[1].split(']')[0];

                        if (!mohs.includes(tmMove)) tmMove = await getRandomMove(filePaths.moves);

                        lines[index] = `[${tmMove}]`;
                        tmsCollection.push(tmMove);
                    } else {
                        lines[index] = buildTmLearnerList();
                    }
                }

                const resultFile = await lines.join('\n');
                await fs.writeFile(filePaths.tms, resultFile, 'utf-8', function () { });

                console.log('Datos de MTs: Randomizados con exito')
                resolve();
            })
        })
        await new Promise(function (resolve) {

            fs.readFile(filePaths.items, 'utf-8', async function (err, data) {
                let lines = await data.split('\n');
                let tmsCollectionIndex = 0;
                for (let index = 0; index < lines.length; index++) {
                    let itemParams = lines[index].split(',');

                    if (isTmItem(itemParams)) {
                        itemParams[itemParams.length - 1] = tmsCollection[tmsCollectionIndex];
                        tmsCollectionIndex++;
                    }

                    lines[index] = await itemParams.join(',');
                }

                const resultFile = await lines.join('\n');
                await fs.writeFile(filePaths.items, resultFile, 'utf-8', function () { });

                console.log('Objetos MT: Enlazados con exito');
                resolve();
            })
        });
    }

    async function randomizeEncountersFile() {
        function isPokemon(values) {
            if (values.length != 1 && isNaN(values[0])) return true; // Pattern to identify pokemon lines 
            else return false;
        }

        return await new Promise(function (resolve) {

            fs.readFile(filePaths.encounters, 'utf-8', async function (err, data) {
                let lines = await data.split('\n');
                for (let index = 0; index < lines.length; index++) {
                    let values = lines[index].split(',');

                    if (isPokemon(values)) {
                        values[0] = await getRandomPokemon(pokemonCollection)
                        lines[index] = values.join(',');
                    }
                }

                const resultFile = await lines.join('\n');
                await fs.writeFile(filePaths.encounters, resultFile, 'utf-8', function () { });

                console.log('Encuentros: Randomizado con exito');
                resolve();
            })
        })
    }

    async function randomizeTrainersFile() {
        return await new Promise(function (resolve) {

            function usesCombatItem(pokemonParams) {
                if (pokemonParams[2] && pokemonParams[2] != '') return true;
                else return false
            }

            fs.readFile(filePaths.trainers, 'utf-8', async function (err, data) {
                let lines = await data.split('\n');
                for (let index = 0; index < lines.length; index++) {
                    if (isCommentLine(lines[index])) {
                        if (!isCommentLine(lines[index + 1])) { // Detects that the next line corresponds to the trainer name, so it skips to the next pokemon
                            index = index + 3;
                        }
                    } else {
                        let pokemonParams = lines[index].split(',');

                        pokemonParams[0] = await getRandomPokemon(pokemonCollection);
                        lines[index] = pokemonParams[0] + ',' + pokemonParams[1];

                        if (usesCombatItem(pokemonParams)) {
                            pokemonParams[2] = await getRandomCombatItem(filePaths.items);
                            lines[index] = lines[index] + ',' + pokemonParams[2];
                        }
                    }
                }

                const resultFile = await lines.join('\n');
                await fs.writeFile(filePaths.trainers, resultFile, 'utf-8', function () { });

                console.log('Randomizado con exito: Entrenadores')
                resolve();
            })
        })
    }

    await randomizePokemonFile();
    await randomizeTmsFile();
    await randomizeEncountersFile();
    await randomizeTrainersFile();
}