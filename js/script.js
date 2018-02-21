const navigatorOpts = {
  enableHighAccuracy: true
}
const nav = new Navigation({ geolocationOptions: navigatorOpts });

if ("geolocation" in navigator && !!geolib) {
  document.querySelector('p').textContent = 'GPS Available, awaiting permission.';
  nav.start();

  document.getElementById('test-set-point').addEventListener('input', (evt) => {
    nav.setWaypoint(evt.target.value);
  });

} else {
  /* geolocation IS NOT available */
  document.querySelector('h1').textContent = 'GPS not available';
}
