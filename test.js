const pokemons = [
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    url: "http://localhost:8000/pokemon/1.png",
  },
  {
    id: 4,
    name: "charmander",
    types: ["fire"],
    url: "http://localhost:8000/pokemon/4.png",
  },
];

function filterPokemonsByType(type) {
  return pokemons.filter((pokemon) => pokemon.types.includes(type));
}

console.log(filterPokemonsByType("grass"));
