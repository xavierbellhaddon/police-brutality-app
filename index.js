const map = L.map("map").setView([37.0902, -95.7129], 4);
let features = [];

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/dark-v10",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoieGF2aWVyYmVsbGhhZGRvbiIsImEiOiJja2h0dWJzd3owMnV0MnJydmI5dXp1MjJrIn0.XsZhwZnA3zq2_SZZ5TF1RA",
  }
).addTo(map);

// const style = {
//     "color": "#83d71e",
//     "weight": 2,
//     "opacity": 1,
//     "dashArray": 5,
//     "fillOpacity": 0.65
// }

// L.geoJson(statesData, {
//     style: style
// }).addTo(map);

let url = "https://api.846policebrutality.com/api/incidents";
const req = new XMLHttpRequest();
req.open("GET", url);
req.send();
req.onload = function () {
    
  const data = JSON.parse(req.responseText).data;

  data.forEach(incident => {
      const lat = incident.geocoding.lat;
      const long = incident.geocoding.long;

      const feature = {type: 'Feature',
      properties: incident,
      geometry: {
          type: 'Point',
          coordinates: [lat, long]
      }
    };

    features.push(feature)

  })

  console.log(features.length)

  features.forEach(feature => {
      const lat = feature.geometry.coordinates[0];
      const long = feature.geometry.coordinates[1];

    //   var marker = L.marker([lat, long]).addTo(map);

      const circle = L.circle([lat, long], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

  })
};






