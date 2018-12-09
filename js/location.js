'use strict';
// Object will look something like this.
// Code is to skip the current point, otherwise thing should be reached.
// Coord is just the latlng of the location.
// =-=-=-=-=
// Generate codes by running: ['code1', 'code2', ...].forEach((i) => console.log(i, NavHelpers.encode(i.toLowerCase(), 29)));
// In a browser console.
const locationArray = [{
  code: 'cG9zdA==',
  coord: {
      latitude: 51.701114,
      longitude: 5.954895,
    }
  }, {
  code: 'd2VnZWluZGU=',
  coord: {
      latitude: 51.675402,
      longitude: 5.961284
    }
  }, {
  code: 'dmVubmV0amU=',
  coord: {
      latitude: 51.659853,
      longitude: 5.926366
    }
  }, {
  code: 'c2xvb3RqZQ==',
  coord: {
      latitude: 51.625877,
      longitude: 5.954718
    }
  }, {
  code: 'aGVpbGlnZQ==',
  coord: {
      latitude: 51.622000,
      longitude: 5.982688
    }
  }, {
  code: 'cGFubmVua29la2Vu',
  coord: {
      latitude: 51.594617,
      longitude: 5.998415
    }
  }, {
  code: 'bWFyaWE=',
  coord: {
      latitude: 51.585798,
      longitude: 6.028043
    }, {
  code: 'Y2hhbXBhZ25l',
  coord: {
      latitude: 51.558334,
      longitude: 6.037009
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
    console.error(error);
    const message = `GPS error: ${error.message} (code: ${error.code}).`;

    // Nasty trick, but it works.. Globals FTW!! ;)
    if (infoPage) {
      infoPage.gpsDisabled = true;
    }

    modal.message({ message, type: 'error' });
  }
  static encode (str = '') {
    return btoa(str);
  }
  static decode (str = '') {
    return atob(str);
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
    this.latestCoords = {};
    this.lastHeading = 0;
    this.lastSpeed = 0;
    this.distance = 0;

    // To what waypoint the direction is going?
    this.waypoint = localStorage.getItem('waypoint') || 0;

    // Degrees the compass needs offset.
    this.findRadius = 25;
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
    if (heading || heading === 0) {
      this.lastHeading = heading;
    }

    return this.lastHeading;
  }
  // Returns last known speed (in case of gps los).
  speed (speed) {
    if (speed || speed === 0) {
      this.lastSpeed = speed;
    }

    return NavHelpers.toKmh(this.lastSpeed, '');
  }

  // Changes the direction of the compass..
  changeCompass (bearing, heading) {
    const deg = bearing - heading + this.compassOffset + 'deg';

    document.documentElement.style.setProperty(this.cssVar, deg);
  }

  checkCodeWord (code) {
    const serialized = code.toString().toLowerCase();
    const encoded = NavHelpers.encode(serialized);
    const lower = (str) => {
      // Always check for lower cased codes..
      return NavHelpers.encode(NavHelpers.decode(str).toLowerCase());
    };

    const index = locationArray.findIndex((item) => lower(item.code) === encoded);

    if (index >= 0) {
      this.setWaypoint(index);
      this.handleCoords();
    } else {
      modal.message({ message: 'Code onbekend', type: 'warning' });
    }
  }
  get currentWord () {
    return NavHelpers.decode(locationArray[this.waypoint].code);
  }

  // Shows the distance left to the object.
  get distanceToGo () {
    const distance = this.distance;
    const gt = distance > 1000;
    const convert = gt ? geolib.convertUnit('km', distance, 1) : Math.round(distance);
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

        modal.message({
          message: `Locatie gevonden! Het nieuwe codewoord: ${this.currentWord}.`,
          type: 'success',
          duration: 5000,
        });
      }
    }
  }

  // Changes the VUE app..
  refreshDashboard () {
    if (!this.dashboard) {
      return;
    }

    this.dashboard.speed = this.speed();
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
      obj[key] = data[key] !== null ? data[key] : 'n/a';
    }

    this.infoPage.sensorData = Object.assign(
      {},
      this.infoPage.sensorData,
      obj,
    );
  }

  refreshMap (coords) {
    this.map.panTo([coords.latitude, coords.longitude], {
      animate: true,
      easeLinearity: 1,
      duration: 1
     });
  }

  handleCoords (coords = this.latestCoords) {
    console.log(coords);
    this.latestCoords = coords;
    this.speed(coords.coords.speed);

    const toLocation = this.getWaypoint(this.waypoint);
    const heading = this.heading(coords.coords.heading);
    const _coords = {
      latitude: coords.coords.latitude,
      longitude: coords.coords.longitude,
    };
    this.distance =  geolib.getDistance(_coords, toLocation.coord, 1, 1);
    const bearing = geolib.getRhumbLineBearing(_coords, toLocation.coord);

    this.changeCompass(bearing, heading);

    // And are we close enough?
    this.refreshDashboard();
    this.refreshInfoPage(coords.coords);
    this.refreshMap(_coords);
    this.foundWaypoint(this.distance);
  }
}
