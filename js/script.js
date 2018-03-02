if (!"geolocation" in navigator) {
  alert("No geo options available, application renders useless.");
  throw new Error("No geo");
}

const noSleep = new NoSleep();

const navigatorOpts = {
  enableHighAccuracy: true
}

const sharedMethods = {
  toggleInfo: () => {
    infoPage.open = !infoPage.open;
    dashboard.open = !dashboard.open;
  }
}

const infoPage = new Vue({
  el: '#info-page',
  data: {
    development: location.hash === '#develop',
    open: false,
    sensorData: {},
    codeWordText: '',
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
      }
    },
    verifyCodeWord: (value) => {
      nav.checkCodeWord(value);
    },
  }, sharedMethods),
});
const dashboard = new Vue({
  el: '#dashboard',
  data: {
    speed: '0',
    codeWord: 'Loading...',
    distance: '... km',
    open: true,
  },
  methods: sharedMethods,
});

const map = L.map('background-map', {
  trackResize: false,
  dragging: false,
  zoomControl: false,
  attributionControl: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  tap: false,
});

// Sets the start to the clubhouse.
map.setView([51.626780, 5.522619], 17);

//L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: false,
}).addTo(map);

const nav = new Navigation({
  geolocationOptions: navigatorOpts,
  dashboard,
  infoPage,
  bgMap: map,
});

nav.start();

function enableNoSleep () {
  noSleep.enable();
  document.removeEventListener('click', enableNoSleep, false);
}

document.addEventListener('click', enableNoSleep, false);
