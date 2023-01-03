const fs = require("fs");
const csv = require("csvtojson");

const createPokemon = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  newData = newData.map((data, index) => {
    if (index < 721) {
      return {
        id: index + 1,
        name: data.Name,
        types: data.Type2
          ? [data.Type1.toLowerCase(), data.Type2.toLowerCase()]
          : [data.Type1.toLowerCase()],
        url: `http://localhost:8000/pokemon/${index + 1}.png`,
      };
    } else return;
  });

  const filteredData = newData.filter(function (el) {
    return el != null;
  });

  let data = JSON.parse(fs.readFileSync("dbpkm.json"));
  data.data = filteredData;
  fs.writeFileSync("dbpkm.json", JSON.stringify(data));
  console.log(newData);
};

createPokemon();
