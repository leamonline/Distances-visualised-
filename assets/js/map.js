const DISTANCE_CONVERSION = 1609.34; // miles -> metres
const DEFAULT_CENTER = { lat: 53.447, lng: -2.006 };
const DEFAULT_RANGE = { min: 9.5, max: 10.4 };

const minSlider = document.getElementById('min-distance');
const maxSlider = document.getElementById('max-distance');
const minOutput = document.getElementById('min-distance-output');
const maxOutput = document.getElementById('max-distance-output');
const innerDisplay = document.getElementById('inner-display');
const outerDisplay = document.getElementById('outer-display');
const widthDisplay = document.getElementById('width-display');

const widthBadge = document.getElementById('width-badge');

let mapInstance;
let innerCircle;
let outerCircle;
let siteMarker;

const basemapLayers = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }),
    'Carto Light': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/attributions" rel="noopener" target="_blank">Carto</a>'
    }),
    'Stamen Toner': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data &copy; OpenStreetMap contributors'
    })
};

function initialiseMap() {
    mapInstance = L.map('map', {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        layers: [basemapLayers['OpenStreetMap']]
    });

    L.control.layers(basemapLayers, null, {
        position: 'topright',
        collapsed: false
    }).addTo(mapInstance);

    siteMarker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], {
        title: 'SK14 6JE - Hattersley'
    }).addTo(mapInstance);

    outerCircle = L.circle(siteMarker.getLatLng(), {
        color: '#e74c3c',
        fillColor: '#e74c3c',
        fillOpacity: 0.12,
        weight: 2.5
    }).addTo(mapInstance);

    innerCircle = L.circle(siteMarker.getLatLng(), {
        color: '#74b9ff',
        fillColor: '#74b9ff',
        fillOpacity: 0.25,
        weight: 2
    }).addTo(mapInstance);

    updateVisuals(DEFAULT_RANGE.min, DEFAULT_RANGE.max);
}

function enforceSliderBounds() {
    const minValue = Number(minSlider.value);
    const maxValue = Number(maxSlider.value);

    if (minValue > maxValue) {
        minSlider.value = maxValue;
        updateVisuals(maxValue, maxValue);
        return;
    }

    updateVisuals(minValue, maxValue);
}

function updateVisuals(minMiles, maxMiles) {
    minOutput.value = `${minMiles.toFixed(1)} mi`;
    maxOutput.value = `${maxMiles.toFixed(1)} mi`;

    innerDisplay.textContent = minMiles.toFixed(1);
    outerDisplay.textContent = maxMiles.toFixed(1);

    const width = maxMiles - minMiles;
    widthDisplay.textContent = width.toFixed(1);

    if (widthBadge) {
        widthBadge.textContent = width <= 0.1 ? 'Narrow ring' : width < 1.5 ? 'Moderate width' : 'Wide radius band';
    }

    if (!mapInstance) {
        return;
    }

    const outerRadius = maxMiles * DISTANCE_CONVERSION;
    const innerRadius = minMiles * DISTANCE_CONVERSION;

    outerCircle.setRadius(outerRadius);

    if (innerRadius <= 0) {
        mapInstance.removeLayer(innerCircle);
    } else {
        innerCircle.setRadius(innerRadius);
        if (!mapInstance.hasLayer(innerCircle)) {
            innerCircle.addTo(mapInstance);
        }
    }
}

function restoreDefaults() {
    minSlider.value = DEFAULT_RANGE.min;
    maxSlider.value = DEFAULT_RANGE.max;
    enforceSliderBounds();
}

function bindEvents() {
    minSlider.addEventListener('input', enforceSliderBounds);
    maxSlider.addEventListener('input', enforceSliderBounds);

    document.getElementById('range-form').addEventListener('reset', restoreDefaults);

    window.addEventListener('resize', () => {
        setTimeout(() => mapInstance.invalidateSize(), 150);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initialiseMap();
    bindEvents();
});
