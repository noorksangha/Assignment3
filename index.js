const ITEMS_PER_PAGE = 10;
let activePage = 1;
let creatures = [];
let chosen_types = [];

const refreshPaginationSection = (activePage, totalPages) => {
  $('#pagination').empty().addClass('d-flex justify-content-center');

  let beginPage = Math.max(1, activePage - 2);
  let finishPage = Math.min(totalPages, activePage + 2);

  if (finishPage - beginPage < 4) {
    if (activePage <= 3) {
      finishPage = Math.min(totalPages, 5);
    } else {
      beginPage = Math.max(1, totalPages - 4);
    }
  }

  if (activePage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${activePage - 1}">
        Previous
      </button>
    `);
  }

  for (let i = beginPage; i <= finishPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i === activePage ? 'active' : ''}" value="${i}">
        ${i}
      </button>
    `);
  }

  if (activePage < totalPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${activePage + 1}">
        Next
      </button>
    `);
  }
};

const applyPagination = async (activePage, ITEMS_PER_PAGE, creatures) => {
  selected_creatures = creatures.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE)

  $('#pokeCards').empty()
  selected_creatures.forEach(async (creature) => {
    const res = await axios.get(creature.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
  $('#total-pokemons').text(creatures.length)
  $('#displayed-pokemons').text(selected_creatures.length)
}

const initiate = async () => {
  const results = await axios.get('https://pokeapi.co/api/v2/type');
  const types = results.data.results;

  types.forEach(type => {
    $('.pokemonFilter').append(`
      <div class="form-check form-check-inline">
        <input class="form-check-input typeChk" type="checkbox" typeurl="${type.url}">
        <label class="form-check-label" for="inlineCheckbox1">${type.name}</label>
      </div>
    `)
  })    

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  creatures = response.data.results;

  applyPagination(activePage, ITEMS_PER_PAGE, creatures)
  const totalPages = Math.ceil(creatures.length / ITEMS_PER_PAGE)
  refreshPaginationSection(activePage, totalPages)
 
  $('body').on('click', '.typeChk', async function (e) {
    if ($(this).is(':checked')) {
      chosen_types.push($(this).attr('typeurl'))
    } else {      
      chosen_types = chosen_types.filter((type) => type !== $(this).attr('typeurl'))
    }
    console.log("chosen_types: ", chosen_types);

    let filtered_creatures = [];

    for (let i = 0; i < chosen_types.length; i++) {
      filtered_creatures.push((await axios.get(chosen_types[i])).data.pokemon.map((pokemon) => pokemon.pokemon));
    }

    console.log("filtered_creatures: ", filtered_creatures);

    if (chosen_types.length != 0) {
      creatures = filtered_creatures.reduce((a,b) => a.filter(c => b.some(d => d.name === c.name)));
    } else {
      creatures = response.data.results;
    }

    console.log("creatures: ", creatures);
    applyPagination(activePage, ITEMS_PER_PAGE, creatures)
    const totalPages = Math.ceil(creatures.length / ITEMS_PER_PAGE)
    refreshPaginationSection(activePage, totalPages);
  })


  $('body').on('click', '.pokeCard', async function (e) {
    const creatureName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${creatureName}`)
    const types = res.data.types.map((type) => type.type.name)
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  $('body').on('click', '.numberedButtons', async function (e) {
    const newPage = Number(e.target.value);

    if (newPage !== activePage) {
      activePage = newPage;
      const totalPages = Math.ceil(creatures.length / ITEMS_PER_PAGE)
      applyPagination(activePage, ITEMS_PER_PAGE, creatures);
      refreshPaginationSection(activePage, totalPages);
    }
  });

}

$(document).ready(initiate)
