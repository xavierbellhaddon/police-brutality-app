const map = L.map("map").setView([54.5260, -105.2551], 2.5);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/light-v10",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA",
  }
).addTo(map);

const style = {
    "color": "#83d71e",
    "weight": 2,
    "opacity": 1,
    "fillOpacity": 0.65
}

L.geoJson(statesData, {
    style: style
}).addTo(map);

let url = "https://api.846policebrutality.com/api/incidents";
const req = new XMLHttpRequest();
req.open("GET", url);
req.send();
req.onload = function () {
  const json = JSON.parse(req.responseText);
  console.log(json);
};

