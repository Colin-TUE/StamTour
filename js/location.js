// Object will look something like this.
// Code is to skip the current point, otherwise thing should be reached.
// Coord is just the latlng of the location.
const locationArray = [{
  code: 'unlock',
  reached: false,
  coord: {
      latitude: 51.917110,
      longitude: 4.477062
    }
  }
];

class Navigation {
  constructor (opts = {}) {
    this.geoLocationOpts = opts.geolocationOptions;
    this.nav = navigator.geolocation;
    this.watchId = null;

    // TEMP TESTING ONLY
    this.title = document.querySelector('p');
    this.elem = document.querySelector('h2');
    this.compassTxt = document.getElementById('msg');

    // Degrees the compass needs offset.
    this.compassOffset = 45;
    this.cssVar = '--compass-rotation';
  }

  start () {
    // Hmmm.. this binding doesn't seem to work inside classes.. bummer...
    this.watchId = this.nav.watchPosition(this.handleCoords.bind(this), this.gpsError, navigatorOpts);
  }
  stop () {
    this.nav.clearWatch(this.watchId);
  }

  gpsError (error) {
    // TODO: extend function to support
    console.error(error);
    const message = `GPS error: ${error.message} (code: ${error.code})`;

    this.elem.textContent = message;
  }

  changeCompass (bearing, direction) {
    this.compassTxt.textContent = direction.exact;

    const deg = bearing + this.compassOffset + 'deg';

    document.documentElement.style.setProperty(this.cssVar, deg);
  }
  showDistance (distance) {
    const gt = distance > 1000;
    const convert = gt ? geolib.convertUnit('km', distance) : distance;
    const suffix = gt ? 'kilometer' : 'meter';

    this.elem.textContent = `Distance: ${convert} ${suffix}`;
  }

  handleCoords (coords) {
    console.log(coords);
    this.title.textContent = `Own heading: ${coords.coords.heading} at speed: ${coords.coords.speed}`;

    const _coords = {
      latitude: coords.coords.latitude,
      longitude: coords.coords.longitude,
    }
    const distance = geolib.getDistance(_coords, locationArray[0].coord, 1, 1);
    const direction = geolib.getCompassDirection(_coords, locationArray[0].coord);
    const bearing = geolib.getRhumbLineBearing(_coords, locationArray[0].coord);

    this.changeCompass(bearing, direction);
    this.showDistance(distance);
  }
}
