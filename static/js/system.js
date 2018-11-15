import Player from './model/player.js';
import System from './model/system.js';
import App from './core/app.js';

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

const searchParams = new URLSearchParams(window.location.search);
const id = searchParams.get('id');

App.init().then(() => System.fetch(id)).then(system => {
    const systemElement = document.querySelector("#system");
    const star = document.querySelector("#star");
    generatePlanets(systemElement, system.planets);
    const starStyle = window.getComputedStyle(star);
    star.style.top = `calc(50% - ${parseInt(starStyle.height) / 2}px)`;
    star.style.left = `calc(50% - ${parseInt(starStyle.width) / 2}px)`;
    initTouchEvents('/views/map', '/views/map/planet.html?id={id}', 'planet');
});

const generateOrbit = (systemElement, data) => {
    const orbit = document.createElement("div");
    orbit.classList.add('orbit');
    orbit.style.width = `${data.radius}px`;
    orbit.style.height = `${data.radius}px`;
    orbit.style.top = `calc(50% - ${(data.radius / 2) + 1}px)`;
    orbit.style.left = `calc(50% - ${(data.radius / 2) + 1}px)`;
    orbit.setAttribute('data-id', data.id);
    systemElement.appendChild(orbit);
};

const generatePlanets = (systemElement, planets) => {
    const planetList = document.getElementById("planet-list");

    for (const planet of planets) {
        /** DISPLAYS THE PLANET IN THE PLANET LIST OF THE SYSTEM*/
        const planetDiv = document.createElement("div");
        let player;
        let pseudo;
        let factionName;
        const pseudoDiv = document.createElement("div");

        if (planet.player!==null) {
            pseudoDiv.id="player"+planet.player.id;
            factionName = planet.player.faction.name;
            planetDiv.appendChild(pseudoDiv);
            player = Player.fetchPlayer(planet.player.id).then(function(playerInfo) {
                pseudo=playerInfo.pseudo;

                return playerInfo;
            }
          );
        }
        else {
            pseudo="RebelleTOTRAD";
            factionName="pas de faction";
        }
        planetDiv.classList.add("planet-details");

        planet.player!==null?planetDiv.classList.add("faction-id-"+planet.player.faction.id):planetDiv.classList.add('no-faction');


        planetDiv.innerHTML=`
            <div class="planet-image">
                <img src="">
            </div>
            <div class="planet-info">
            </div>
            <div class="player-info">
                <div class="race">
                HumainTOTRAD
                </div>
                <div class="name">
                ${pseudo}
                </div>
                <div class="faction">
                ${factionName}
                </div>
            </div>
            <div class="planet-actions">
            </div>
            `;


        planetList.appendChild(planetDiv);
        if (planet.player!==null) {
            //document.getElementById("player"+planet.player.id).innerHTML=pseudo;
        }
        /** DISPLAYS THE PLANET ON THE SYSTEM VIEW*/
        generateOrbit(systemElement, planet.orbit);
        const orbitStyle = window.getComputedStyle(document.querySelector(`.orbit[data-id='${planet.orbit.id}']`));
        const radius = parseInt(orbitStyle.width) / 2;
        // formula : timeToRotate = 2*PI *sqrt(radius^3/(6.674*10^-11 . starMass)) with radius in meters, starMass in kg and time in seconds
        // note : the powers of 10 have been simplified to reduce the values as much as possible
        const timeElapsed = Date.now()/1000;// /1000 to get time in seconds
        const angleOffset = 0; //offset the startingPosition
        const starMass = 200; //(1-200) would be values coherent in physics. 10 is our sun's mass
        const calcRadius = radius * 1000 ; // times 1000 to fit the formula and take into consideration the units
        const gravitationalConstant = 2 * 6.674 ; //2 is for the mass of the smallest star and 6.674 is from the gravitational constant G
        const numberOfHoursInYear = 365.25*24;// to change earth rotation time ffor one year to one hour
        const timeToRotate = (( 2 * Math.PI ) * Math.sqrt((calcRadius * calcRadius * calcRadius)/ (starMass * gravitationalConstant))) / numberOfHoursInYear;
        const timeIntoCurrentRotation = timeElapsed % timeToRotate;
        const angle = (angleOffset + (timeIntoCurrentRotation / timeToRotate * ( 2 * Math.PI )));// angles in radians
        const top = parseInt(orbitStyle.top) + radius + (Math.cos(angle) * radius);
        const left = parseInt(orbitStyle.left) + radius + (Math.sin(angle) * radius);
        let width = 10;
        const planetElement = document.createElement("div");
        if (planet.player !== null) {
            width = 20;
            planetElement.classList.add('faction-flag');
            planetElement.style.backgroundImage = `url('/static/images/factions/${planet.player.faction.banner}')`;
        }
        planetElement.classList.add('planet');
        planetElement.setAttribute('data-time-to-rotate', timeToRotate);
        planetElement.setAttribute('data-angle-offset', angleOffset);
        planetElement.setAttribute('data-id', planet.id);
        planetElement.setAttribute('data-type', planet.type);
        planetElement.setAttribute('data-orbit-id', planet.orbit.id);
        planetElement.style.top = top - width + 'px';
        planetElement.style.left = left - width + 'px';
        planetElement.addEventListener('dblclick', redirectToPlanet);
        systemElement.appendChild(planetElement);
    }
    requestAnimationFrame(systemRotation);
};

const systemRotation = () => {
    document.querySelectorAll(`.planet`).forEach(rotatePlanet);
    requestAnimationFrame(systemRotation);
}

const rotatePlanet = planet => {
    const orbitStyle = window.getComputedStyle(document.querySelector(`.orbit[data-id='${planet.getAttribute("data-orbit-id")}']`));
    const radius = parseInt(orbitStyle.width) / 2; //(1-1000) would be values coherent in physics
    const timeElapsed = Date.now() / 1000;// /1000 to get time in seconds
    const timeToRotate = planet.getAttribute("data-time-to-rotate");
    const angleOffset = planet.getAttribute("data-angle-offset");
    const timeIntoCurrentRotation = timeElapsed % timeToRotate;
    const angle =(angleOffset + (timeIntoCurrentRotation / timeToRotate * ( 2 * Math.PI )));// angles in radians
    const top = parseInt(orbitStyle.top) + radius + (Math.cos(angle) * radius);
    const left = parseInt(orbitStyle.left) + radius + (Math.sin(angle) * radius);
    const width = (planet.classList.contains('faction-flag')) ? 20 : 10;
    planet.style.top = top - width + 'px';
    planet.style.left = left - width + 'px';
}

const redirectToPlanet = event => {
    window.location = `/views/map/planet.html?id=${event.currentTarget.getAttribute('data-id')}`;
}
