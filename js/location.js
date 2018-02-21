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
  }, {
    code: 'part 2',
    reached: false,
    coord: {
        latitude: 52.162796,
        longitude: 4.479680
      }
    }
];

class NavHelpers {
  constructor () {}

  static toKmh (speed, suffix = ' km/h') {
    if (speed === null) {
      return 0 + suffix;
    }
    const _speed = parseFloat(speed);

    return Math.round(_speed * 3.6) + suffix;
  }
  static gpsError (error) {
    // TODO: extend function to support
    console.error(error);
    const message = `GPS error: ${error.message} (code: ${error.code})`;

    alert(message);
  }
}

class Navigation {
  constructor (opts = {}) {
    this.geoLocationOpts = opts.geolocationOptions;
    this.nav = navigator.geolocation;
    this.watchId = null;

    // Directional parts.
    this.lastHeading = 0;
    this.lastSpeed = 0;

    // To what waypoint the direction is going?
    this.waypoint = localStorage.getItem('waypoint') || 0;

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
    this.watchId = this.nav.watchPosition(this.handleCoords.bind(this), NavHelpers.gpsError, navigatorOpts);
  }
  stop () {
    this.nav.clearWatch(this.watchId);
  }

  // Returns last known heading (in case of gps loss).
  heading (heading) {
    if (heading !== null) {
      this.lastHeading = heading;
    }

    return this.lastHeading;
  }
  // Returns last known speed (in case of gps los).
  speed (speed) {
    if (speed !== null) {
      this.lastSpeed = speed;
    }

    return NavHelpers.toKmh(this.lastSpeed);
  }

  // Changes the direction of the compass..
  changeCompass (bearing, direction, heading) {
    this.compassTxt.textContent = direction.exact;

    const deg = bearing - heading + this.compassOffset + 'deg';

    document.documentElement.style.setProperty(this.cssVar, deg);
  }
  // Shows the distance left to the object.
  showDistance (distance) {
    const gt = distance > 1000;
    const convert = gt ? geolib.convertUnit('km', distance, 2) : distance;
    const suffix = gt ? 'kilometer' : 'meter';

    this.elem.textContent = `Distance: ${convert} ${suffix}`;
  }

  setWaypoint (waypoint = 0) {
    const index = parseInt(waypoint, 10);
    const obj = locationArray[waypoint];
    const store = (wp) => {
      this.waypoint = wp;
      localStorage.setItem('waypoint', wp);
    };

    if (!obj) {
      store(0);
      return locationArray[0];
    }

    store(index);
    return obj;
  }
  getWaypoint (waypoint = 0) {
    const obj = locationArray[parseInt(waypoint, 10)];

    if (obj) {
      return obj;
    }

    return locationArray[0];
  }

  handleCoords (coords) {
    console.log(coords);
    this.title.textContent = `Own heading: ${this.heading(coords.coords.heading)} at speed: ${this.speed(coords.coords.speed)}`;

    const toLocation = this.getWaypoint(this.waypoint);
    const heading = this.heading(coords.coords.heading);
    const _coords = {
      latitude: coords.coords.latitude,
      longitude: coords.coords.longitude,
    }
    const distance = geolib.getDistance(_coords, toLocation.coord, 1, 1);
    const direction = geolib.getCompassDirection(_coords, toLocation.coord);
    const bearing = geolib.getRhumbLineBearing(_coords, toLocation.coord);

    this.changeCompass(bearing, direction, heading);
    this.showDistance(distance);
  }
}
