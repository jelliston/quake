//
// This is a simple example for the Amazon Echo which informs the user of the number
// of significant earthquakes and notes a few of the most recent locations.
//

/**
* App ID for the skill
*/
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';


/**
* The AlexaSkill prototype and helper functions
*/
var AlexaSkill = require('./AlexaSkill');
var g = require('./GoogleAPIKey');
var GOOGLE_API_KEY = g.googleAPIKey;

/* Google Analytics */
var express = require('express');
var request = require('request');
var app = express();
var GA_TRACKING_ID = 'UA-92538925-1';

function trackEvent (category, action, label, value, cb) {
  const data = {
    v: '1', // API Version.
    tid: GA_TRACKING_ID, // Tracking ID / Property ID.
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: '555',
    t: 'event', // Event hit type.
    ec: category, // Event category.
    ea: action, // Event action.
    el: label, // Event label.
    ev: value // Event value.
  };

  request.post(
    'http://www.google-analytics.com/collect',
    {
      form: data
    },
    (err, response) => {
      if (err) {
        cb(err);
        return;
      }
      if (response.statusCode !== 200) {
        cb(new Error('Tracking failed'));
        return;
      }
      cb();
    }
  );
}

/**
* This is a child of AlexaSkill.
* To read more about inheritance in JavaScript, see the link below.
*
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
*/
var Quake = function () {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Quake.prototype = Object.create(AlexaSkill.prototype);
Quake.prototype.constructor = Quake;

/**
* Override to initialize session state.
*/
Quake.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId +
  ", sessionId: " + session.sessionId);

  // Any session init logic would go here.
};

/**
* Override to teardown session state.
*/
Quake.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId +
  ", sessionId: " + session.sessionId);

  //Any session cleanup logic would go here.
};

Quake.prototype.intentHandlers = {
  "AMAZON.HelpIntent": function(intent, session, response) {
    handleHelpRequest(intent, session, response);
  },
  "AMAZON.CancelIntent": function (intent, session, response) {
    response.tell("")
  },
  "AMAZON.StopIntent": function (intent, session, response) {
    response.tell("")
  },
  WasThatAnEarthquakeIntent: function (intent, session, response) {
    handleWasThatAnEarthquakeIntent(intent, session, response);
  },
  GetEarthquakeGivenCityEventIntent: function (intent, session, response) {
    handleEarthquakesByLocationIntent(intent, session, response);
  },
  GetEarthquakeGivenTwoIntent: function (intent, session, response) {
    handleEarthquakesByLocationIntent(intent, session, response);
  },
  GetEarthquakeGivenThreeIntent: function (intent, session, response) {
    handleEarthquakesByLocationIntent(intent, session, response);
  },
  GetEarthquakeGivenFourIntent: function (intent, session, response) {
    handleEarthquakesByLocationIntent(intent, session, response);
  },
  GetEarthquakeGivenFiveIntent: function (intent, session, response) {
    handleEarthquakesByLocationIntent(intent, session, response);
  }
};

function handleHelpRequest(intent, session, alexa) {
  alexa.ask("Quake reports earthquakes for a given location. I report quakes within 2 weeks, 100 kilometers, and magnitutde 3 and higher. Near what city do you want to search for earthquakes?");
}

/**
* Launching without specifying an intent, route to the default.
*/
Quake.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log("Quake onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

  var speechOutput = "Near what city do you want to search for earthquakes?";
  trackEvent('On Launch','Info','Get','1',
  function(err) {
          if (err) {
              return next(err);
          }
          //var speechOutput = "Okay.";
          response.ask(speechOutput, speechOutput);
        });
};

/* Using input from web app. Create an array of location objects, each object has parameters set by web app */

var fromDb = [    /* locations & parameters taken from web app; hard-coded in for now */
  { nickname: "home", location:"san+francisco" , latitude: 37.7749295, longitude: -122.4194155, maxradiuskm: 100, minmagnitude: 3 },
  { nickname: "bro", location: "san+luis+obispo+california", latitude: 32.626512, longitude: -114.6276916, maxradiuskm: 100, minmagnitude: 3 },
  { nickname: "jane", location:"ada+michigan", latitude: 42.9607266, longitude: -85.495471, maxradiuskm: 100, minmagnitude: 3 }
];

var wasThatAnEarthquake;

function handleWasThatAnEarthquakeIntent(intent, session, alexa) {
  wasThatAnEarthquake = "home";
  handleEarthquakesByLocationIntent(intent, session, alexa);
}

function handleEarthquakesByLocationIntent(intent, session, alexa) {
  var requestedLocation;
  if (wasThatAnEarthquake == "home") {
    requestedLocation = wasThatAnEarthquake;
  } else {
    requestedLocation = Object.keys(intent.slots).map(function(k){return intent.slots[k].value;}).join("+");
    requestedLocation = requestedLocation.toLowerCase();
  }
  console.log("requestedLocation: " + requestedLocation);
  if (!Boolean(requestedLocation)) {
    console.log("Requested location is NULL. Prompting help.");
    handleHelpRequest(intent, session, alexa);
    return;
  }

  var rad;
  var magn;

  var index = -1;
  for(var i = 0, len = fromDb.length; i < len; i++){
    if (fromDb[i].nickname == requestedLocation){
      index = i;
      break;
    }
  }

  if (index == -1) {
    locForGeocode = requestedLocation;
    rad = 100;
    magn = 3;
  } else {
    locForGeocode = fromDb[index].location;
    rad = fromDb[index].maxradiuskm;
    magn = fromDb[index].minmagnitude;
  }
  console.log("locForGeocode: " + locForGeocode);

  var geocodeOptions = {
    hostname: "maps.google.com",
    path: "/maps/api/geocode/json?key=" + GOOGLE_API_KEY + "&address=" + locForGeocode,
    method: "GET",
    headers: { "Content-Type": "application/json" }
  };
  console.log("geocodeOptions:" + JSON.stringify(geocodeOptions));

  var geocodeCallback = function (json) {
    console.log("json:" + JSON.stringify(json));
    var lat = json.results[0].geometry.location.lat;
    var lng = json.results[0].geometry.location.lng;
    var loc = json.results[0].address_components[0].long_name;
    var date = new Date();
    date.setDate(date.getDate() - 14);
    date = date.toISOString();

    var usgsOptions = {
      hostname: "earthquake.usgs.gov",
      path: "/fdsnws/event/1/query?format=geojson" +
      "&latitude=" + lat +
      "&longitude=" + lng +
      "&maxradiuskm=" + rad +
      "&minmagnitude=" + magn +
      "&starttime=" + date,
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };
  console.log("usgsOptions:" + JSON.stringify(usgsOptions));

    httpGetJSON(false, usgsOptions, getUsgsCallback(alexa, loc));
  };
  httpGetJSON(true, geocodeOptions, geocodeCallback);
}

function getUsgsCallback(alexa, loc) {
  return function (resp) {
    console.log("USGS response:" + JSON.stringify(resp));
    var MAX_LOCATIONS_TO_SAY = 3;
    var res = '';
    if (resp.metadata.count > 1) {
      res += resp.metadata.count + " earthquakes near " + loc + ". ";
      if (resp.metadata.count > MAX_LOCATIONS_TO_SAY) {
        res += "Here are the latest " + MAX_LOCATIONS_TO_SAY + ".";
      }
      // build a string for each location
      for (var i = 0; i < MAX_LOCATIONS_TO_SAY && i < resp.metadata.count; i++) {
        var mag = resp.features[i].properties.mag;

        // The place looks like '93km WSW of Coquimbo, Chile'
        var location = resp.features[i].properties.place.replace(/.+ of (.+), .+/, "$1");

        res += ' A magnitude ' + mag + ' near ' + location + '.';
      }
    } else if (resp.metadata.count == 1) {
        res += 1 + " earthquake near " + loc + ". ";
        var mag = resp.features[0].properties.mag;
        var location = resp.features[0].properties.place.replace(/.+ of (.+), .+/, "$1");
        res += ' A magnitude ' + mag + ' near ' + location + '.';
    } else {
      res = "No earthquakes near " + loc + " in the last 14 days.";
    }
    console.log(res);

    /* Google Analytics tracking */
    trackEvent('Get location','Info','Get','1',
    function(err) {
            if (err) {
                return next(err);
            }
            alexa.tell(res);
          });
  };
}

function httpGetJSON(ssl, options, callback) {
  var http = ((ssl === true) ? require('https') : require('http'));
  var getCallback = function(response) {
    var body = '';

    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var json = JSON.parse(body);
      callback(json);
    });
    console.log(callback);
  };
  var request = http.get(options, getCallback).end();
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
  var skill = new Quake();
  skill.execute(event, context);
};
