'use strict';

if (!"geolocation" in navigator) {
  modal.message({
    message: 'No geo options available, application renders useless.',
    type: 'error',
  });
  throw new Error("No geo");
}

class CustomLayerSwitcher {
  constructor (map, layers) {
    this.map = map;
    this.layers = layers;

    this.currentLayer = null;
  }

  switch (layer) {
    const newLayer = this.layers[layer];
    if (!newLayer) {
      // Cannot switch to unknown layer.
      return;
    }

    if (this.currentLayer) {
      this.map.removeLayer(this.currentLayer);
    }

    this.map.addLayer(newLayer);
    this.map.setZoom(16);
    this.currentLayer = newLayer;
  }
  get layerNames () {
    return Object.keys(this.layers);
  }
}

const noSleep = new NoSleep();

const navigatorOpts = {
  enableHighAccuracy: true
};

const sharedMethods = {
  toggleInfo: () => {
    infoPage.open = !infoPage.open;
    dashboard.open = !dashboard.open;
  }
};

const layerOptions = { attribution: false };
const pickableLayers = {
  'OSM': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', layerOptions),
  'OSM no road': L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', layerOptions),
  'Open topo': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', layerOptions),
  'Arcgis picture': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', layerOptions),
  'NL luchtfoto': L.tileLayer('https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wmts/1.0.0/2016_ortho25/EPSG:3857/{z}/{x}/{y}.png', layerOptions),
  'BW mapnik': L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', layerOptions),
};

const map = L.map('background-map', {
  trackResize: false,
  dragging: false,
  zoomControl: false,
  attributionControl: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  tap: false,
  zoom: 16,
});

// Sets the start to the clubhouse.
map.setView([51.626780, 5.522619], 16);
pickableLayers['OSM no road'].addTo(map);
map.setZoom(16);

const layerSwitcher = new CustomLayerSwitcher(map, pickableLayers);

const infoPage = new Vue({
  el: '#info-page',
  data: {
    development: location.hash === '#develop',
    gpsDisabled: false,
    open: false,
    sensorData: {},
    codeWordText: '',
    layers: layerSwitcher.layerNames,
  },
  computed: {
    disableBtn: function () {
      return this.codeWordText.length < 3;
    }
  },
  methods: Object.assign({
    setWaypoint: (evt) => {
      nav.setWaypoint(evt.target.value);
    },
    resetWaypoint: () => {
      const reset = confirm('Weet je het zeker?!');

      if (reset) {
        nav.setWaypoint(0);
        modal.message({
          message: 'Route succesvol gereset.',
          type: 'success',
        });
      }
    },
    verifyCodeWord: (value) => {
      nav.checkCodeWord(value);
    },
    changeLayer: (value) => {
      layerSwitcher.switch(value.target.value);
    },
    enableScreenOn: () => {
      noSleep.disable();
      noSleep.enable();
      modal.message({
        message: 'Het scherm zou nu aan moeten blijven.',
        type: 'info'
      });
    },
  }, sharedMethods),
});
const dashboard = new Vue({
  el: '#dashboard',
  data: {
    speed: '0',
    codeWord: 'Laden...',
    distance: '... km',
    open: true,
  },
  methods: sharedMethods,
});

const nav = new Navigation({
  geolocationOptions: navigatorOpts,
  dashboard,
  infoPage,
  bgMap: map,
});

modal.message({
  message: `Welkom bij route 4 van de autospeurtocht! Klik op dit venster om de route te starten. Er word gevraagd om het verlenen van toegang tot de GPS. Sta dit toe, anders wordt de route flink lastig.`,
  type: 'info',
  duration: 0,
}, () => {
  noSleep.enable();
  nav.start();
});
