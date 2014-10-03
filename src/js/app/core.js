/*!
  Bus Stops Core - v0.0.1
  Written on 2014-10-03 by Nicholas Valbusa
  http://nicholas.valbusa.me
*/

( function( window, $, Backbone ) {

  // Speeds up underscore templates
  _.templateSettings.variable = "model";

  var BusStops = function() {

    var map = undefined,

    initialSettings = {
      /* Center to Shoreditch for convenience */
      center: { lat: 51.520591, lng: -0.071916},
      zoom: 16
    },

    templates = {
      busStop: _.template($("#tpl-list").html()),
      infoWindow: _.template($("#tpl-info-window").html())
    },

    $elements = {
      busStopsList: $('#left-region .list ul')
    },

    currentInfoWindow = undefined,

    stopsCollection = new Backbone.Entities.BusStops,

    /* ----------------------- private methods -----------------------*/

    // Updates the coordinates on the Backbone Collection
    // and fetches the stops
    updateRectCoordinates = function() {
      var coords = map.getBounds(),
          northEast = coords.getNorthEast(),
          southWest = coords.getSouthWest();

      stopsCollection.setRectangle(
        northEast.lat() + ',' + northEast.lng(),
        southWest.lat() + ',' + southWest.lng()
      );

      fetchStopsInCurrentArea();
    },

    // Fetches the Backbone collection
    fetchStopsInCurrentArea = function() {
      stopsCollection.fetch();
    },

    didClickMarker = function(busStop, marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      busStop.arrivals.fetch({
        success: function() {
          marker.setAnimation(null);

          var model = busStop.toJSON();
          model.arrivals = busStop.arrivals.toJSON();

          if (currentInfoWindow !== undefined) {
            currentInfoWindow.close();
          }

          currentInfoWindow = new google.maps.InfoWindow({
            content: templates.infoWindow(model),
            minWidth: 600,
            maxWidth: 750,
            padding: 50
          });

          currentInfoWindow.open(map, marker);
        }
      });
    };

    /* ---------------------- collection bindings -------------------*/

    stopsCollection.on('add', function(busStop) {
      var coords = busStop.getLatLng();

      // Adds the marker on the map
      var marker = new google.maps.Marker({
        title: busStop.name,
        position: new google.maps.LatLng(coords.lat,coords.lng),
        map: map,
        icon: 'images/marker.png'
      });

      // Click event
      google.maps.event.addListener(marker, 'click', function() {
        didClickMarker(busStop, marker);
      });

      busStop.setMarker(marker);

      // Adds the stops on the left list
      $elements.busStopsList.append(templates.busStop(busStop.toJSON()));
    });

    stopsCollection.on('remove', function(busStop) {
      if (busStop.hasMarker()) {
        busStop.getMarker().setMap(undefined);
        busStop.setMarker(undefined);
      }

      $elements.busStopsList.find('li[data-id="' + busStop.id + '"]').remove();
    });

    // Click event on stops list
    $elements.busStopsList.on('click', 'a', function(event) {
      event.preventDefault();
      var $li = $(event.currentTarget).parent();

      var busStop = stopsCollection.get($li.data('id'));
      if (busStop !== undefined) {
        didClickMarker(busStop, busStop.marker);
      }
    });

    /* ----------------------- public methods -----------------------*/

    return {
      init: function() {
        // Initialize Gmaps canvas
        map = new google.maps.Map(document.getElementById('map-canvas'), initialSettings);

        // Updates bus stops on zoom change and drag en
        $.each(['zoom_changed', 'dragend'], function() {
          google.maps.event.addListener(map, this, updateRectCoordinates );
        });

        // Loads app bus stops in current viewport once loaded
        google.maps.event.addListenerOnce(map, 'idle', function(){
          updateRectCoordinates();
        });
      }
    };
  };

  /* ----------------------- dom ready setup ------------------------*/

  google.maps.event.addDomListener(window, 'load', function() {
    var app = new BusStops();
    app.init();
  });

})( window, jQuery, Backbone );