/*!
  Bus Stops Entities - v0.0.1
  Written on 2014-10-03 by Nicholas Valbusa
  http://nicholas.valbusa.me
*/

( function( window, $, Backbone, Entities ) {

  var api_entrypoint = 'http://digitaslbi-id-test.herokuapp.com/bus-stops';

  /* -------------------------------------------------------------------- */

  Entities.Arrival = Backbone.Model.extend({
    idAttribute: 'scheduledTime',

    defaults: {
      routeId: '',
      destination: '',
      estimatedWait: 'due'
    }
  });

  /* -------------------------------------------------------------------- */

  Entities.Arrivals = Backbone.Collection.extend({
    model: Entities.Arrival,

    initialize: function(models, options) {
      this.parent = options.parent;
    },

    url: function() {
      return api_entrypoint + '/' + this.parent.get('id') + '?callback=?'
    },

    parse: function(response) {
      return response ? response.arrivals : [];
    }
  });

  /* -------------------------------------------------------------------- */

  Entities.BusStop = Backbone.Model.extend({
    defaults: {
      id: '',
      name: '',
      stopIndicator: 'X',
      lat: 0,
      lng: 0,
      towards: '',
      smsCode: '',
      direction: '',
      routes: []
    },

    marker: undefined,

    initialize: function() {
      this.arrivals = new Entities.Arrivals([], {parent: this});
    },

    getLatLng: function() {
      return { lat: this.get('lat'), lng: this.get('lng') };
    },

    setMarker: function(marker) {
      this.marker = marker;
    },

    hasMarker: function() {
      return this.marker !== undefined;
    },

    getMarker: function() {
      return this.marker;
    }
  });

  /* -------------------------------------------------------------------- */

  Entities.BusStops = Backbone.Collection.extend({
    model: Entities.BusStop,
    rect: {
      northEast: 0,
      southWest: 0
    },

    url: function() {
      return api_entrypoint + '?' + $.param(this.rect) + '&callback=?'
    },

    parse: function(response) {
      return response ? response.markers : [];
    },

    setRectangle: function(northEast, southWest) {
      this.rect.northEast = northEast;
      this.rect.southWest = southWest;
    }
  });

  /* -------------------------------------------------------------------- */

  Backbone.Entities = Entities;

})( window, jQuery, Backbone, {} );