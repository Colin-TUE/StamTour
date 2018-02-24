// Object will look something like this.
// Code is to skip the current point, otherwise thing should be reached.
// Coord is just the latlng of the location.
const locationArray = [{
  code: 'Code Word 2',
  reached: false,
  coord: {
      latitude: 52.162796,
      longitude: 4.479680
    }
  }, {
  code: 'Code word 1',
  reached: false,
  coord: {
      latitude: 51.917110,
      longitude: 4.477062
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
    // Loaction / navigator
    this.geoLocationOpts = opts.geolocationOptions;
    this.nav = navigator.geolocation;
    this.watchId = null;

    // Dashboard code...
    this.dashboard = opts.dashboard;
    this.infoPage = opts.infoPage;
    this.map = opts.bgMap;

    // Directional parts.
    this.lastHeading = 0;
    this.lastSpeed = 0;
    this.distance = 0;

    // To what waypoint the direction is going?
    this.waypoint = localStorage.getItem('waypoint') || 0;
    this.currentWord = '';

    // Degrees the compass needs offset.
    this.findRadius = 25;
    this.compassOffset = 45;
    this.cssVar = '--compass-rotation';

    // TEMP TESTING ONLY
    this.title = document.querySelector('p');
    this.elem = document.querySelector('h2');
    this.compassTxt = document.getElementById('msg');
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
    if (speed) {
      this.lastSpeed = speed;
    }

    return NavHelpers.toKmh(this.lastSpeed);
  }

  // Changes the direction of the compass..
  changeCompass (bearing, direction, heading) {
    const deg = bearing - heading + this.compassOffset + 'deg';

    document.documentElement.style.setProperty(this.cssVar, deg);
  }

  // Shows the distance left to the object.
  get distanceToGo () {
    const distance = this.distance;
    const gt = distance > 1000;
    const convert = gt ? geolib.convertUnit('km', distance, 1) : distance;
    const suffix = gt ? 'km' : 'm';

    return `${convert} ${suffix}`;
  }

  setWaypoint (waypoint = 0) {
    const index = parseInt(waypoint, 10);
    const obj = locationArray[waypoint];
    const store = (wp) => {
      this.waypoint = wp;
      localStorage.setItem('waypoint', wp);
    };

    if (!obj) {
      // Just return the current waypoint;
      return locationArray[this.waypoint];
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
  foundWaypoint (distance) {
    if (distance < this.findRadius) {
      // Point found.. whoohoo!
      if ((this.waypoint + 1) < locationArray.length) {
        // Next point is also an object.. so use that one next.
        this.waypoint++;

        // Todo add message "Point found"
      }
    }
  }

  // Changes the VUE app..
  refreshDashboard () {
    if (!this.dashboard) {
      return;
    }

    this.dashboard.compassMsg = this.speed();
    this.dashboard.distance = this.distanceToGo;
    this.dashboard.codeWord = this.currentWord;
  }

  refreshInfoPage (data) {
    if (!this.infoPage) {
      return;
    }

    // Looping somehow needs to be done, can't place the object directly
    let obj = {};
    for (let key in data) {
      obj[key] = data[key];
    }

    this.infoPage.sensorData = Object.assign(
      {},
      this.infoPage.sensorData,
      obj,
    );
  }

  refreshMap (coords) {
    this.map.setView([coords.latitude, coords.longitude]);
  }

  handleCoords (coords) {
    console.log(coords);
    this.speed(coords.coords.speed);

    const toLocation = this.getWaypoint(this.waypoint);
    const heading = this.heading(coords.coords.heading);
    const _coords = {
      latitude: coords.coords.latitude,
      longitude: coords.coords.longitude,
    }
    this.distance =  geolib.getDistance(_coords, toLocation.coord, 1, 1);
    const direction = geolib.getCompassDirection(_coords, toLocation.coord);
    const bearing = geolib.getRhumbLineBearing(_coords, toLocation.coord);

    this.currentWord = toLocation.code;
    this.changeCompass(bearing, direction, heading);

    // And are we close enough?
    this.refreshDashboard();
    this.refreshInfoPage(coords.coords);
    this.refreshMap(_coords);
    this.foundWaypoint(distance);
  }
}
