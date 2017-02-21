var Location = function(title, lng, lat) {
  var self = this;
  this.title = title;
  this.lng = lng;
  this.lat = lat;
    
  var venueId = foursquareVanues(lat,lng, title);

// Return venueId of places matching the provided parameters
function foursquareVanues(lat,lng, title) {
    var venueId;
    var data = $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        type:'GET',
        dataType: 'JSON',
        async:false,
        data: {
        ll:lng+","+lat,
        client_id: 'I5HFX2PIE5WFMHDNUV0C5R1EZAQVE0T03QFEMOY0YAMUCO4C', 
        client_secret: '0VDAZG1CNJPDGK25JESTAZGNPCCZK1NVPTHDCAVLJX4ZNYMI',
        v: '20150609'
    }
    }).responseJSON;
      $.each(data.response.venues, function(i, item){
          if(item.name==title){
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
        type:'GET',
        dataType: 'JSON',
        data: {
        client_id: 'I5HFX2PIE5WFMHDNUV0C5R1EZAQVE0T03QFEMOY0YAMUCO4C', 
        client_secret: '0VDAZG1CNJPDGK25JESTAZGNPCCZK1NVPTHDCAVLJX4ZNYMI',
        v: '20150609',
        limit: 4,
        sort: 'recent'
    }
    }).done(function(data){
      $.each(data.response.photos.items, function(i, photo){
        photos.push('<div class="photo"><img src='+photo.prefix+photo.width+photo.suffix+'></div>');
      });
      self.photos = '<div class="photos">' +  photos.join('') + '</div>';
    }).fail(function(jqXHR, textStatus) {
      console.log('Ajax request failed! ' + textStatus);
    });
  }();
    
  // Retrieve latest comments for this location marker
  this.foursquareComments = function() {
    var tips = [];
    var commentsUrl = 'https://api.foursquare.com/v2/venues/' + venueId + '/tips';
    $.ajax({
        url: commentsUrl,
        type:'GET',
        dataType: 'JSON',
        data: {
        client_id: 'I5HFX2PIE5WFMHDNUV0C5R1EZAQVE0T03QFEMOY0YAMUCO4C', 
        client_secret: '0VDAZG1CNJPDGK25JESTAZGNPCCZK1NVPTHDCAVLJX4ZNYMI',
        v: '20150609',
        limit: 5,
        sort: 'recent'
    }
    }).done(function(data){

      $.each(data.response.tips.items, function(i, tip){
          var user = '<strong>'+tip.user.firstName+'</strong>: ';
        tips.push('<li>' + user + tip.text + '</li>');
      });
      self.comments = '<h2>' + self.title + '</h2>' + '<h3>Recent Comments</h3>' + '<ol class="tips">' + tips.join('') + '</ol>';
    }).fail(function(jqXHR, textStatus) {
      self.comments = '<h2>' + self.title + '</h2>' + '<h3>Recent Comments</h3>' + '<h4>Oops. There was a problem retrieving this location\'s comments.</h4>';				
      console.log('Ajax request failed! ' + textStatus);
    });
      
  }();

  this.infowindow = new google.maps.InfoWindow();

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(self.lng, self.lat),
    map: map,
    title: self.title,
  });

  // Opens the info window for the location marker.
  this.openInfowindow = function() {
    for (var i=0; i < locations.locations.length; i++) {
      locations.locations[i].infowindow.close();
    }
    map.panTo(self.marker.getPosition())
    self.infowindow.setContent(self.photos + self.comments);
    self.infowindow.open(map,self.marker);
  };

  // Assigns a click event listener to the marker to open the info window.
  this.addListener = google.maps.event.addListener(self.marker,'click', (this.openInfowindow));
};

// Contains all the locations and search function.
var locations = {
  locations:[
    new Location('Starbucks', 36.6706863,-121.6416774),
    new Location('Domino\'s Pizza', 36.6727657,-121.631648),
    new Location('La Casa Del Sazon', 36.6634429,-121.6587781),
    new Location('In-N-Out Burger', 36.6799039,-121.6412926),
    new Location('Hartnell College', 36.6747074,-121.6680685),
    new Location('Wingstop', 36.6995146,-121.6226687),
    new Location('First Awakenings',36.675763,-121.6552323),
  ],
  query: ko.observable(''),
};

// Search function for filtering through the list of locations based on the name of the location.
locations.search = ko.dependentObservable(function() {
  var self = this;
  var search = this.query().toLowerCase();
  return ko.utils.arrayFilter(self.locations, function(location) {
    return location.title.toLowerCase().indexOf(search) >= 0;
  });
}, locations);

ko.applyBindings(locations);