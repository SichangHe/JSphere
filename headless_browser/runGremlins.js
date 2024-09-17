// See <https://marmelab.com/gremlins.js/>.
// This runs within the browser context.
gremlins
    .createHorde({
        randomizer: new gremlins.Chance(1234),
        species: gremlins.allSpecies,
        mogwais: [gremlins.mogwais.alert()],
        strategies: [
            // 1 ms delay between each action.
            gremlins.strategies.distribution({ delay: 1 }),
            // 30,000 actions ⇒ 30 seconds.
            gremlins.strategies.allTogether({ nb: 30_000 }),
        ],
    })
    .unleash()
