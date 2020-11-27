const form = document.querySelector("form");
const textInput = document.querySelector(".text-input");
const map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: false,
  attributionControl: false
// }).setView([37.0902, -95.7129], 4);
}).setView([40.0000, -96.0000], 4);
const searchResults = document.querySelector(".search-results");
const style = {
  color: "white",
  fillColor: "black",
  weight: 1,
  opacity: 0.25,
  dashArray: 0,
  fillOpacity: 0.65,
};
const accessToken = "pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA";

L.control.zoom({
  position: 'bottomright'
}).addTo(map);

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
  searchResults.innerHTML = "";
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
      const date = new Date(incident.date)

      let evidence = "";

      el.classList.add("incident")

      // const streams = incident.evidence[0].video[0].streams;

      // // for (let i = 0; i < incident.evidence.length; i++) {
      // //   evidence += `<p>${incident.evidence[i].url}</p>`;
      // // }

      // for (let i = 0; i < streams.length; i++) {
      //   evidence += `<iframe width='560' height='315' src='${streams[i].url}' frameborder='0' allowfullscreen></iframe></iframe>`
      // }

      el.innerHTML = `
      <h2>${incident.title}</h2>
      <h3>${(date.getMonth()+1) + '/' + date.getDate() + "/" + date.getFullYear()} &#183 ${incident.city}, ${incident.state}</h3>
      ${evidence}
      `;
      searchResults.appendChild(el);
    });
  };
}

visualize();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(textInput.value);
});

map.on('moveend', function() { 
  console.log(map.getBounds());
});