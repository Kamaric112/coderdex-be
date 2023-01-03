const fs = require("fs");
const csv = require("csvtojson");

const createPokemon = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  newData = newData.map((data, index) => {
    return {
      id: index + 1,
      name: data.Name,
      types: [data.Type1, data.Type2],
    };
  });
  let data = JSON.parse(fs.readFileSync("pokemons.json"));
  data.data = newData;
  fs.writeFileSync("pokemons.json", JSON.stringify(data));
  console.log(newData);
};
createPokemon();
