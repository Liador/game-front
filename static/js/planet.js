var searchParams = new URLSearchParams(window.location.search);
var id = searchParams.get('id');

getCurrentPlayer().then(() => {
  var profileLink = document.createElement('a');
  profileLink.href = '/views/profile';
  profileLink.innerText = player.pseudo;
  document.querySelector("#player-data h3").appendChild(profileLink);
});

const initPlanet = () => fetch(`/api/planets/${id}`, {
        method: 'GET',
        headers: headers
    })
    .then(apiResponseMiddleware)
    .then(data => {
        var planet = document.querySelector("#planet");
        var planetStyle = window.getComputedStyle(planet);
        document.querySelector("#planet-data .name").innerText = data.name;
        document.querySelector("#planet-data .type").innerText = dictionnary.planet.type[data.type];
        document.querySelector('#planet .shape').setAttribute('data-type', data.type);
        planet.style.top = `calc(50% - ${parseInt(planetStyle.height) / 2}px)`;
        planet.style.left = `calc(50% - ${parseInt(planetStyle.width) / 2}px)`;
        planet.style.display = "inline-block";

        if (data.player !== null) {
            document.querySelector("#planet-data .player").innerHTML = `<a href="/views/profile/${(data.player.id != player.id) ? `?id=${data.player.id}` : ''}" >${data.player.pseudo}</a>`;
        }

        systemLink = document.createElement('a');
        systemLink.href = `/views/map/system.html?id=${data.system.id}`;
        systemLink.innerText = `${dictionnary.planet.system} ${data.system.coord_x}:${data.system.coord_y}`;
        document.querySelector('#planet-data .system').appendChild(systemLink);

        initPlanetResources(document.querySelector("#planet-data .resources"), data.resources, data.storage);
        initPlanetRelations(document.querySelector("#planet-relations"), data.relations);

        if (data.player !== null && player.id === data.player.id) {
            initPlanetBuildings(document.querySelector("#planet-buildings > section"), data.id, data.buildings, data.nb_buildings, data.available_buildings);
        }
        initTouchEvents(systemLink.href);

        setCurrentPlanet(data.id);
    }).catch(error => console.log(error))
;

window.onload = initPlanet;
