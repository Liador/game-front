var searchParams = new URLSearchParams(window.location.search);
var id = searchParams.get('id');

getCurrentPlayer().then(() => {
  var profileLink = document.createElement('a');
  profileLink.href = '/views/profile';
  profileLink.innerText = player.pseudo;
  document.querySelector("#player-data h3").appendChild(profileLink);
});

fetch(`/api/systems/${id}`, {
    method: 'GET',
    headers: headers
})
.then(apiResponseMiddleware)
.then(data => {
  var system = document.querySelector("#system");
  var star = document.querySelector("#star");
  generatePlanets(system, data.planets);
  var starStyle = window.getComputedStyle(star);
  star.style.top = `calc(50% - ${parseInt(starStyle.height) / 2}px)`;
  star.style.left = `calc(50% - ${parseInt(starStyle.width) / 2}px)`;
  initTouchEvents('/views/map', '/views/map/planet.html?id={id}', 'planet');
}).catch(error => console.log(error));

const generateOrbit = (system, data) => {
  var orbit = document.createElement("div");
  orbit.classList.add('orbit');
  orbit.style.width = `${data.radius}px`;
  orbit.style.height = `${data.radius}px`;
  orbit.style.top = `calc(50% - ${(data.radius / 2) + 1}px)`;
  orbit.style.left = `calc(50% - ${(data.radius / 2) + 1}px)`;
  orbit.setAttribute('data-id', data.id);
  system.appendChild(orbit);
};

const generatePlanets = (system, planets) => {
  for (data of planets) {
    generateOrbit(system, data.orbit);
    var orbitStyle = window.getComputedStyle(document.querySelector(`.orbit[data-id='${data.orbit.id}']`));
    var radius = parseInt(orbitStyle.width) / 2; //(1-1000) would be values coherent in physics
    var top = parseInt(orbitStyle.top) + radius + (Math.cos(angle) * radius);
    var left = parseInt(orbitStyle.left) + radius + (Math.sin(angle) * radius);
    // formula : timeToRotate = 2*PI *sqrt(radius^3/(6.674*10^-11 . starMass)) with radius in meters, starMass in kg and time in seconds
    // note : the powers of 10 have been simplified to reduce the values as much as possible
    var timeElapsed = Date.now();
    var angleOffset = 90; //offset the startingPosition
    var starMass = 75; //(1-200) would be values coherent in physics. 10 is our sun's mass
    var calcRadius = radius * 1000; // times 1000 to fit the formula and take into consideration the units
    var gravitationalConstant = 2 * 6.674 ; //2 is for the mass of the smallest star and 6.674 is from the gravitational constant G
    var timeToRotate = ((2*Math.PI)*(radius * radius * radius))/ (starMass * gravitationalConstant);
    var angle =(angleOffset + ( (timeElapsed%(timeToRotate))*360/(31536000)))%360; //31536000 = 60*60*24*365
    var planet = document.createElement("div");
    planet.classList.add('planet');
    planet.setAttribute('data-id', data.id);
    planet.setAttribute('data-type', data.type);
    planet.style.top = top - 10 + 'px';
    planet.style.left = left - 10 + 'px';
    planet.addEventListener('dblclick', redirectToPlanet);
    planet.addEventListener('mousedown', event => handleMouseDown(event, '/views/map/planet.html?id={id}'));
    planet.addEventListener('mouseup', handleMouseUp);
    if (data.player !== null) {
        var factionFlag = document.createElement('div');
        factionFlag.classList.add('faction-flag');
        factionFlag.style.top = top - 20 + 'px';
        factionFlag.style.left = left - 20 + 'px';
        factionFlag.style.backgroundColor = data.player.faction.color;
        factionFlag.style.boxShadow = `0px 0px 10px ${data.player.faction.color}`;
        system.appendChild(factionFlag);
    }
    system.appendChild(planet);
  }
};

const redirectToPlanet = event => {
  window.location = `/views/map/planet.html?id=${event.currentTarget.getAttribute('data-id')}`;
}
