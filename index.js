import { CountUp } from "./countUp.min.js";

const form = document.querySelector("form");
const exitButton = document.querySelector(".exit-button");
const textInput = document.querySelector(".text-input");
const map = L.map("map", {
  scrollWheelZoom: false,
  attributionControl: false,
}).setView([39.0, -96.0]);
const searchResults = document.querySelector(".search-results");

const states = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "Washington DC": "DC",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const style = {
  color: "white",
  fillColor: "black",
  weight: 1,
  opacity: 0.25,
  dashArray: 0,
  fillOpacity: 0.65,
};

const accessToken =
  "pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA";

const width = document.documentElement.clientWidth;

if (width > 1900) {
  map.setZoom(5);
} else if (width > 1200) {
  map.setZoom(4);
} else {
  map.setZoom(3);
}

map.zoomControl.setPosition("bottomright");

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
    accessToken,
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/dark-v10",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: accessToken,
  }
).addTo(map);

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: clickState,
  });
}

let geojson;

function highlightFeature(e) {
  let layer = e.target;

  layer.setStyle({
    weight: 3,
    color: "white",
    fillColor: "black",
    opacity: 1,
    fillOpacity: 0.65,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  let layer = e.target;
  geojson.resetStyle(layer);
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToBack();
  }
}

function clickState(e) {
  const layer = e.target;
  const state = layer.feature.properties.name;
  handleSearch(state);
}

geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);

function visualize() {
  let url = "https://api.846policebrutality.com/api/incidents";
  const req = new XMLHttpRequest();
  req.open("GET", url);
  req.send();
  req.onload = function () {
    const data = JSON.parse(req.responseText).data;
    const total = data.length;

    new CountUp("totalCounter", total).start();

    for (let i = 0; i < data.length; i++) {
      const incident = data[i];
      const lat = incident.geocoding.lat;
      const long = incident.geocoding.long;
      L.circle([lat, long], {
        pane: "markerPane",
        interactive: false,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.05,
        radius: 50000,
        weight: 3,
      }).addTo(map);
    }
  };
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value.toUpperCase());
}

function handleSearch(searchTerm) {
  if (
    !states[
      searchTerm.toLowerCase().charAt(0).toUpperCase() +
        searchTerm.toLowerCase().slice(1)
    ] &&
    !getKeyByValue(states, searchTerm)
  ) {
    alert("invalid search");
  } else if (getKeyByValue(states, searchTerm)) {
    searchTerm = getKeyByValue(states, searchTerm);
  }

  if (
    searchTerm.toUpperCase() === "DISTRICT OF COLUMBIA" ||
    searchTerm.split(", ").join(" ").toUpperCase() === "WASHINGTON D.C." ||
    searchTerm.split(", ").join(" ").toUpperCase() === "WASHINGTON DC"
  ) {
    searchTerm = "Washington DC";
  }

  let url =
    "https://api.846policebrutality.com/api/incidents?include=evidence&filter[state]=" +
    `${searchTerm}`;
  const req = new XMLHttpRequest();
  searchResults.scrollTop = 0;
  req.open("GET", url);
  req.send();
  req.onload = function () {
    searchResults.innerHTML = "";
    const data = JSON.parse(req.responseText).data;

    if (data.length) {
      searchResults.classList.add("open");
      exitButton.style.display = "inline";
    } else {
      searchResults.classList.remove("open");
    }

    let resultsHTML = "";

    for (let i = 0; i < data.length; i++) {
      const incident = data[i];
      const date = new Date(data[i].date);

      let evidence = "";

      if (incident.evidence.length > 0) {
        evidence = "<h3>Links</h3><ul>";

        for (let i = 0; i < incident.evidence.length; i++) {
          const video = incident.evidence[i].video[0];

          evidence += `<li><a href="${video.evidence_url}" class="truncate" target="_blank">${video.evidence_url}</a></li>`;
        }

        evidence += "</ul>";
      }

      let location = ` ${incident.city}, ${incident.state}</h2>`;

      if (incident.state === "Washington DC") {
        location = "Washington, D.C.</h2>";
      }

      if (incident.title[incident.title.length - 1] === ".") {
        incident.title = incident.title.slice(0, -1);
      }

      resultsHTML += `
      <div class="incident">
        <h2>${
          date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
        } &#183 ${location}
        <p>${incident.title}.</p>
        ${evidence}
      </div>
      `;
    }
    searchResults.innerHTML = resultsHTML;
  };
}

visualize();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(textInput.value);
});

exitButton.addEventListener("click", (event) => {
  event.preventDefault();
  exitButton.style.display = "none";
  textInput.value = "";
  searchResults.innerHTML = "";
  searchResults.scrollTop = 0;
  searchResults.classList.remove("open");
});

window.addEventListener("resize", (event) => {
  const width = document.documentElement.clientWidth;
  if (width > 1900) {
    map.setZoom(5);
  } else if (width > 1200) {
    map.setZoom(4);
  } else {
    map.setZoom(3);
  }
});
