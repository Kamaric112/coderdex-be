const e = require("express");
const express = require("express");
const router = express.Router();
const fs = require("fs");

// router.all("/", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

// router.all("/:pokemonId", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

router.get("/", (req, res, next) => {
  //input validation

  const allowedFilter = ["search", "type", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    //allow title,limit and page query string only
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic

    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from pokemons.json then parse to JSobject
    let db = fs.readFileSync("dbpkm.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    // console.log(pokemons[0].types);
    console.log(filterQuery);
    console.log(filterKeys);
    //Filter data by title
    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        // get types
        if (condition == "type") {
          result = result.length
            ? result.filter((pokemon) =>
                pokemon.types.includes(filterQuery.type)
              )
            : pokemons.filter((pokemon) =>
                pokemon.types.includes(filterQuery.type)
              );
        } else if (condition == "search") {
          result = result.length
            ? result.filter((pokemon) =>
                pokemon.name.includes(filterQuery.search)
              )
            : pokemons.filter((pokemon) =>
                pokemon.name.includes(filterQuery.search)
              );
        } else {
          result = result.length
            ? result.filter(
                (pokemon) => pokemon[condition] === filterQuery[condition]
              )
            : pokemons.filter(
                (pokemon) => pokemon[condition] === filterQuery[condition]
              );
        }
      });
    } else {
      result = pokemons;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    //send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:pokemonId", (req, res, next) => {
  //input validation

  try {
    const { pokemonId } = req.params;

    let db = fs.readFileSync("dbpkm.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    let result = [];
    const getPokemon = (id) => {
      return pokemons.find((pokemon) => pokemon.id == id); // return object instead of array (filter - easier for FE)
    };

    if (pokemonId > pokemons.length || pokemonId < 1) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    const pokemon = getPokemon(pokemonId);
    let previousPokemon = getPokemon(pokemonId - 1);
    let nextPokemon = getPokemon(parseInt(pokemonId) + 1);
    if (parseInt(pokemonId) == 1) {
      previousPokemon = getPokemon(pokemons.length);
    } else if (parseInt(pokemonId) == pokemons.length) {
      nextPokemon = getPokemon(1);
    }

    result = { pokemon, previousPokemon, nextPokemon };

    //send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const { name, id, types, url } = req.body;
    if (!name || !types || !url) {
      // required body
      const exception = new Error(`Missing required data`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      //type limit
      const exception = new Error(`Pokémon can only have one or two types`);
      exception.statusCode = 401;
      throw exception;
    }
    const pokemonTypes = [
      "bug",
      "dragon",
      "fairy",
      "fire",
      "ghost",
      "ground",
      "normal",
      "psychic",
      "steel",
      "dark",
      "electric",
      "fighting",
      "flyingText",
      "grass",
      "ice",
      "poison",
      "rock",
      "water",
    ];
    //type check in pokemon types
    types.forEach((type) => {
      if (!pokemonTypes.includes(type)) {
        const exception = new Error(`Pokémon’s type is invalid.`);
        exception.statusCode = 401;
        throw exception;
      }
    });

    // check if exist
    let db = fs.readFileSync("dbpkm.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    if (
      pokemons.some((pokemon) => pokemon.name == name) ||
      pokemons.some((pokemon) => pokemon.id == id)
    ) {
      const exception = new Error(`The Pokémon is already exists.`);
      exception.statusCode = 401;
      throw exception;
    }

    const newPokemon = {
      name,
      id: id ? id : pokemons.length + 1,
      types,
      url,
    };

    pokemons.push(newPokemon);
    db.pokemons = pokemons;
    db = JSON.stringify(db);
    fs.writeFileSync("dbpkm.json", db);
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

router.put("/:pokemonId", (req, res, next) => {
  try {
    const allowUpdate = ["name", "url", "types"];
    const { pokemonId } = req.params;
    const updates = req.body;
    const updateKeys = Object.keys(updates);
    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));
    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }
    //put processing
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("dbpkm.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;

    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === parseInt(pokemonId)
    );
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }

    const updatedPokemon = { ...db.pokemons[targetIndex], ...updates };
    db.pokemons[targetIndex] = updatedPokemon;
    db = JSON.stringify(db);
    fs.writeFileSync("dbpkm.json", db);
    res.status(200).send(updatedPokemon);
  } catch (error) {
    next(error);
  }
});

router.delete("/:pokemonId", (req, res, next) => {
  try {
    const { pokemonId } = req.params;
    let db = fs.readFileSync("dbpkm.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === parseInt(pokemonId)
    );
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    db.pokemons = pokemons.filter(
      (pokemon) => pokemon.id !== parseInt(pokemonId)
    );
    db = JSON.stringify(db);
    fs.writeFileSync("dbpkm.json", db);
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});
module.exports = router;
