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
  },
  methods: sharedMethods,
});
const dashboard = new Vue({
  el: '#dashboard',
  data: {
    compassMsg: '...',
    codeWord: 'Loading...',
    distance: '404 km',
    open: true,
  },
  methods: sharedMethods,
});

const nav = new Navigation({
  geolocationOptions: navigatorOpts,
  dashboard,
  infoPage,
});
if ("geolocation" in navigator && !!geolib) {
  nav.start();

  // document.getElementById('test-set-point').addEventListener('input', (evt) => {
  //   nav.setWaypoint(evt.target.value);
  // });
} else {
  /* geolocation IS NOT available */
  // TODO
  document.querySelector('h1').textContent = 'GPS not available';
}
