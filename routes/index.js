var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {});

/* Pokemon router */
const pokemonRouter = require("./pokemon.api.js");
router.use("/pokemons", pokemonRouter);

module.exports = router;
