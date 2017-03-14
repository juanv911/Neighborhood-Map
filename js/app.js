
var locations = [{
    title: 'Starbucks',
    lat: 36.6706863,
    long: -121.6416774
  },
  {
    title: 'Domino\'s Pizza',
    lat: 36.6727657,
    long: -121.631648
  },
  {
    title: 'La Casa Del Sazon',
    lat: 36.6634429,
    long: -121.6587781
  },
  {
    title: 'In-N-Out Burger',
    lat: 36.6799039,
    long: -121.6412926
  },
  {
    title: 'Hartnell College',
    lat: 36.6747074,
    long: -121.6680685
  },
  {
    title: 'Wingstop',
    lat: 36.6995146,
    long: -121.6226687
  },
  {
    title: 'First Awakenings',
    lat: 36.675763,
    long: -121.6552323
  }
];

var map;
var infoWindow;

// Foursquare API settings
var clientID = "I5HFX2PIE5WFMHDNUV0C5R1EZAQVE0T03QFEMOY0YAMUCO4C";
var clientSecret = "0VDAZG1CNJPDGK25JESTAZGNPCCZK1NVPTHDCAVLJX4ZNYMI";

function Location(data) {
  var self = this;
  this.name = data.title;
  this.lat = data.lat;
  this.long = data.long;
  this.visible = ko.observable(true);
  var venueId = foursquareVanues(data.lat, data.lng, data.title);

  // Return venueId of places matching the provided parameters
  function foursquareVanues() {
    var venueId;
    var data = $.ajax({
      url: 'https://api.foursquare.com/v2/venues/search',
      type: 'GET',
      dataType: 'JSON',
      async: false,
      data: {
        ll: self.lat + "," + self.long,
        client_id: clientID,
        client_secret: clientSecret,
        v: '20150609'
      },
      error: function() {
        alert("An error has occurred");
      }
    }).responseJSON;
    $.each(data.response.venues, function(i, item) {
      if (item.name == self.name) {
        venueId = item.id;
      }
    });
    return venueId;
  }

  // Retrieve latest photos for this location marker
  this.foursquarePhotos = function() {
    var photos = [];
    var photossUrl = 'https://api.foursquare.com/v2/venues/' + venueId + '/photos';
    $.ajax({
      url: photossUrl,
      type: 'GET',
      dataType: 'JSON',
      data: {
        client_id: clientID,
        client_secret: clientSecret,
        v: '20150609',
        limit: 4,
        sort: 'recent'
      }
    }).done(function(data) {
      $.each(data.response.photos.items, function(i, photo) {
        photos.push('<div class="photo"><img src=' + photo.prefix + photo.width + photo.suffix + '></div>');
      });
      self.photos = '<div class="photos">' + photos.join('') + '</div>';
    }).fail(function(jqXHR, textStatus) {
      alert(self.title + ': Photos Error!');
    });
  }();

  // Retrieve latest comments for this location marker
this.foursquareComments = function() {
    var title = data.title;
    var tips = [];
    var commentsUrl = 'https://api.foursquare.com/v2/venues/' + venueId + '/tips';
    $.ajax({
      url: commentsUrl,
      type: 'GET',
      dataType: 'JSON',
      data: {
        client_id: 'I5HFX2PIE5WFMHDNUV0C5R1EZAQVE0T03QFEMOY0YAMUCO4C',
        client_secret: '0VDAZG1CNJPDGK25JESTAZGNPCCZK1NVPTHDCAVLJX4ZNYMI',
        v: '20150609',
        limit: 5,
        sort: 'recent'
      }
    }).done(function(data) {
      $.each(data.response.tips.items, function(i, tip) {
        var user = '<strong>' + tip.user.firstName + '</strong>: ';
        tips.push('<li>' + user + tip.text + '</li>');
      });
      self.comments = '<h2>' + title + '</h2>' + '<h3>Recent Comments</h3>' + '<ol class="tips">' + tips.join('') + '</ol>';
    }).fail(function(jqXHR, textStatus) {
      self.comments = '<h2>' + title + '</h2>' + '<h3>Recent Comments</h3>' + '<h4>Oops. There was a problem retrieving this location\'s comments.</h4>';
      alert(self.title + ': Comments Error!');
    });
  }();

  infoWindow = new google.maps.InfoWindow();
  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.long),
    map: map,
    title: data.title
  });

  this.isVisible = ko.computed(function() {
    if (this.visible() === true) {
      this.marker.setMap(map);
    } else {
      this.marker.setMap(null);
    }
    return true;
  }, this);

  // Close any infoWindow before opening a new infoWindow
  google.maps.event.addListener(this.marker, 'click', function() {
    infoWindow.close();
  });

  this.marker.addListener('click', function() {
    infoWindow.setContent(self.photos + self.comments);
    infoWindow.open(map, this);
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      self.marker.setAnimation(null);
    }, 2100);
  });

  this.bounce = function(place) {
    google.maps.event.trigger(self.marker, 'click');
  };
};

function VM() {
  var self = this;
  this.query = ko.observable("");
  this.locationList = ko.observableArray([]);

  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(36.6798535, -121.6551409),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  locations.forEach(function(locationItem) {
    self.locationList.push(new Location(locationItem));
  });

  this.search = ko.computed(function() {
    var filter = self.query().toLowerCase();
    if (!filter) {
      self.locationList().forEach(function(locationItem) {
        locationItem.visible(true);
      });
      return self.locationList();
    } else {
      return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
        var string = locationItem.name.toLowerCase();
        var result = (string.search(filter) >= 0);
        locationItem.visible(result);
        return result;
      });
    }
  }, self);
}

function init() {
  ko.applyBindings(new VM());
}

function errorHandling() {
  alert("Google Maps has failed to load. Please check your internet connection and try again.");
}