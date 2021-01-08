import { CountUp } from "./countUp.min.js";

const form = document.querySelector("form");
const exitButton = document.querySelector(".exit-button");
const textInput = document.querySelector(".text-input");
const map = L.map("map", {
  scrollWheelZoom: false,
  attributionControl: false,
}).setView([39.0, -96.0]);
const searchResults = document.querySelector(".search-results");

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

function handleSearch(searchTerm) {
  let state = searchTerm.split(" ").join("+");

  if (searchTerm.toUpperCase() === "DISTRICT OF COLUMBIA") {
    state = "Washington DC";
  }

  let url =
    "https://api.846policebrutality.com/api/incidents?include=evidence&filter[state]=" +
    `${state}`;
  const req = new XMLHttpRequest();
  searchResults.scrollTop = 0;
  req.open("GET", url);
  req.send();
  req.onload = function () {
    searchResults.innerHTML = "";
    const data = JSON.parse(req.responseText).data;

    if (data.length) {
      searchResults.classList.add("open");
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
        location = "Washington, D.C.";
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
  textInput.value = "";
  searchResults.scrollTop = 0;
  searchResults.classList.remove("open");
  searchResults.innerHTML = "";
});

window.addEventListener("resize", (event) => {
  const width = document.documentElement.clientWidth;
  if (width > 1900) {
    map.setZoom(5)
  } else if (width > 1200) {
    map.setZoom(4)
  } else {
    map.setZoom(3)
  }
});
