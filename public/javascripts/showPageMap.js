
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 12,// starting zoom
});

const marker1 = new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 40 })
            .setHTML(
                `<h3>${title}</h3>`
            )
    )
    .addTo(map);