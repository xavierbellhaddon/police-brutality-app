const form = document.querySelector("form");
const textInput = document.querySelector("#text-input");
const map = L.map("map", {
  scrollWheelZoom: false,
}).setView([37.0902, -95.7129], 4);
const searchResults = document.querySelector("#search-results");
const style = {
  color: "white",
  fillColor: "black",
  weight: 1,
  opacity: 0.25,
  dashArray: 0,
  fillOpacity: 0.65,
};
const accessToken = "pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA";

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

L.geoJson(statesData, {
  style: style,
}).addTo(map);

function visualize() {
  let url = "https://api.846policebrutality.com/api/incidents";
  const req = new XMLHttpRequest();
  req.open("GET", url);
  req.send();
  req.onload = function () {
    const data = JSON.parse(req.responseText).data;
    data.forEach((incident) => {
      const lat = incident.geocoding.lat;
      const long = incident.geocoding.long;
      L.circle([lat, long], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.05,
        radius: 50000,
        weight: 1,
      }).addTo(map);
    });
  };
}

function handleSearch(searchTerm) {
  let url =
    "https://api.846policebrutality.com/api/incidents?include=evidence&filter[state]=" +
    searchTerm.split(" ").join("+");
  const req = new XMLHttpRequest();
  req.open("GET", url);
  req.send();
  req.onload = function () {
    const data = JSON.parse(req.responseText).data;
    data.forEach((incident) => {
      const el = document.createElement("div");

      let evidence = "";

      for (let i = 0; i < incident.evidence.length; i++) {
        evidence += `<p>${incident.evidence[i].url}</p>`;
      }


      el.innerHTML = `
      <h2>${incident.title}</h2>
      ${evidence}
      <p>${incident.date}</p>
      `;
      searchResults.appendChild(el);
    });
  };
}

visualize();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchResults.innerHTML = "";
  handleSearch(textInput.value);
});
