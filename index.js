const incidentNumber = document.querySelector(".incident-number");
const form = document.querySelector("form");
const exitButton = document.querySelector(".exit-button");
const textInput = document.querySelector(".text-input");
const map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: false,
  attributionControl: false,
}).setView([41.0, -95.0], 4);
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

L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);

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
    weight: 5,
    color: "white",
    fillColor: "white",
    dashArray: "",
    fillOpacity: 0.7,
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
    const total = data.length.toLocaleString();
    incidentNumber.innerHTML = `
    <h1>${total}</h1>
    <p>incidents countrywide</p>
    `;

    for (let i = 0; i < data.length; i++) {
      const incident = data[i];
      const lat = incident.geocoding.lat;
      const long = incident.geocoding.long;
      L.circle([lat, long], {
        color: "red",
        fillColor: "red",
        fillOpacity: 0.05,
        radius: 50000,
        weight: 1,
      }).addTo(map);
    }
  };
}

function handleSearch(searchTerm) {
  let url =
    "https://api.846policebrutality.com/api/incidents?include=evidence&filter[state]=" +
    searchTerm.split(" ").join("+");
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
      console.log("shit");
      searchResults.classList.remove("open");
    }

    for (i = 0; i < data.length; i++) {
      const incident = data[i];
      const el = document.createElement("div");
      const date = new Date(data[i].date);

      let evidence = '';


      if (incident.evidence.length > 0) {

        for (let i = 0; i < incident.evidence.length; i++) {
          const video = incident.evidence[i].video[0];
          let destination = '';

          if (video.site) {
            destination = `on ${video.site}`
          }


        evidence += `<p><a href="${video.evidence_url}" target="_blank">View evidence ${destination}</a></p>`
        }
      } 

      el.classList.add("incident");

      el.innerHTML = `
      <h2>${incident.title}</h2>
      <h3>${
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
      } &#183 ${incident.city}, ${incident.state}</h3>${evidence}`;
      searchResults.appendChild(el);
    }
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
  searchResults.classList.remove("open");
  searchResults.innerHTML = "";
});
