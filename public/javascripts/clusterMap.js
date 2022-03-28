//const { seattle } = require('../../seeds/city')

mapboxgl.accessToken = mapToken
const attractions = { features: JSON.parse(campgrounds) }
let selected;
if (select) {
    selected = { features: JSON.parse(select) }
    console.log(selected)
}


for (let attraction of attractions.features) {
    attraction.properties = {
        'popUpMarkup': `
        <strong>${attraction.title}</strong><br>${attraction.address}`,
        '_id': attraction._id,
    }
}

let coords;
switch (city) {
    case 'Seattle':
        coords = [-122.3320708, 47.6262095];
        break;
    case 'San Francisco':
        coords = [-122.446389, 37.7975];
        break;
    case 'Boston':
        coords = [-71.07, 42.35];
        break;
    case 'New York':
        coords = [-73.996111, 40.732778];
        break;
    default:
        coords = [-103.5917, 40.6699];

}

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: coords,
    zoom: 11.5,
    boxZoom: false,
});

for (const marker of attractions.features) {
    const urls = marker.images[0].url.split('upload/')
    const url = `${urls[0]}upload/bo_10px_solid_rgb:ffffff,c_thumb,h_200,r_100,w_200/${urls[1]}`
    // Create a DOM element for each marker.
    const el = document.createElement('div');
    let width = 50;
    let height = 50;
    if (select) {
        width = 40;
        height = 40;
        if (selected.features._id == marker._id) {
            width = 70;
            height = 70;
        }

    }
    el.className = 'marker';
    el.style.backgroundImage = `url(${url})`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.backgroundSize = '100%';


    // Add markers to the map.
    new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
}

// if (select) {
//     selected.properties = {
//         'popUpMarkup': `
//         <strong>${selected.title}</strong><br>${selected.address}`,
//         '_id': selected._id,
//     }
//     const urls = selected.features.images[0].url.split('upload/')
//     const url = `${urls[0]}upload/bo_10px_solid_rgb:00ffff,c_thumb,h_250,r_125,w_250/${urls[1]}`
//     // Create a DOM element for each marker.
//     const el = document.createElement('div');
//     const width = 50;
//     const height = 50;
//     el.className = 'marker';
//     el.style.backgroundImage = `url(${url})`;
//     el.style.width = `70px`;
//     el.style.height = `70px`;
//     el.style.backgroundSize = '100%';

//     new mapboxgl.Marker(el)
//         .setLngLat(selected.features.geometry.coordinates)
//         .addTo(map);
// }


map.scrollZoom.disable();
map.dragPan.disable();
map.addControl(new mapboxgl.NavigationControl());

map.on('load', function () {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: attractions,
        cluster: true,
        clusterMaxZoom: 10, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // map.addLayer({
    //     id: 'clusters',
    //     type: 'circle',
    //     source: 'campgrounds',
    //     filter: ['has', 'point_count'],
    //     paint: {
    //         // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
    //         // with three steps to implement three types of circles:
    //         //   * Blue, 20px circles when point count is less than 100
    //         //   * Yellow, 30px circles when point count is between 100 and 750
    //         //   * Pink, 40px circles when point count is greater than or equal to 750
    //         'circle-color': [
    //             'step',
    //             ['get', 'point_count'],
    //             '#00BCD4',
    //             10,
    //             '#2196F3',
    //             30,
    //             '#3F51B5'
    //         ],
    //         'circle-radius': [
    //             'step',
    //             ['get', 'point_count'],
    //             15,
    //             10,
    //             20,
    //             30,
    //             25
    //         ]
    //     }
    // });

    // map.addLayer({
    //     id: 'cluster-count',
    //     type: 'symbol',
    //     source: 'campgrounds',
    //     filter: ['has', 'point_count'],
    //     layout: {
    //         'text-field': '{point_count_abbreviated}',
    //         'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    //         'text-size': 12
    //     }
    // });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 15,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    // map.on('click', 'clusters', function (e) {
    //     const features = map.queryRenderedFeatures(e.point, {
    //         layers: ['clusters']
    //     });
    //     const clusterId = features[0].properties.cluster_id;
    //     map.getSource('campgrounds').getClusterExpansionZoom(
    //         clusterId,
    //         function (err, zoom) {
    //             if (err) return;

    //             map.easeTo({
    //                 center: features[0].geometry.coordinates,
    //                 zoom: zoom
    //             });
    //         }
    //     );
    // });


    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
        window.location.href = `http://localhost:3000/campgrounds/${e.features[0].properties._id}`;

        // const { popUpMarkup } = e.features[0].properties;
        // const coordinates = e.features[0].geometry.coordinates.slice();
        // console.log(e.features[0])

        // // Ensure that if the map is zoomed out such that
        // // multiple copies of the feature are visible, the
        // // popup appears over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        // }

        // new mapboxgl.Popup({ offset: 25 })
        //     .setLngLat(coordinates)
        //     .setHTML(popUpMarkup)
        //     .addTo(map);
    });

    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
    })


    map.on('mouseenter', 'unclustered-point', (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { popUpMarkup } = e.features[0].properties;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
    });

    map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    // map.on('mouseenter', 'clusters', function () {
    //     map.getCanvas().style.cursor = 'pointer';
    // });
    // map.on('mouseleave', 'clusters', function () {
    //     map.getCanvas().style.cursor = '';
    // });
});
