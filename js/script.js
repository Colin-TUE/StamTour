const navigatorOpts = {
  enableHighAccuracy: true
}
const nav = new Navigation({ geolocationOptions: navigatorOpts });

if ("geolocation" in navigator && !!geolib) {
  document.querySelector('p').textContent = 'GPS Available, awaiting permission.';
  nav.start();
} else {
  /* geolocation IS NOT available */
  document.querySelector('h1').textContent = 'GPS not available';
}
