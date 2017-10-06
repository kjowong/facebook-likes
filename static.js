window.fbAsyncInit = function () {
  FB.init({
    appId: '1549498955130522',
    channelUrl: 'https://urchin.holberton.us/',
    status: true, // check login status
    cookie: true,
    xfbml: true
  });

  FB.Event.subscribe('auth.authResponseChange', function (response)		     {
		       if (response.status === 'connected')		       {
			 document.getElementById('message').innerHTML += '<br>Connected to Facebook';
			 // SUCCESS
		       }		       else if (response.status === 'not_authorized')		       {
			 document.getElementById('message').innerHTML += '<br>Failed to Connect';

			 // FAILED
		       } else		       {
			 document.getElementById('message').innerHTML += '<br>Logged Out';

			 // UNKNOWN ERROR
		       }
		     });
};

function Login () {
  FB.login(function (response) {
    if (response.authResponse) {
      getUserInfo();
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  }, {scope: 'email,user_likes,user_videos'});
}
function getUserInfo () {
  FB.api('/me', function (response) {
    var str = '<b>Name</b> : ' + response.name + '<br>';
    str += "<input type='button' value='Get Music' onclick='getMusic();'/>";
    str += "<input type='button' value='Logout' onclick='Logout();'/>";
    document.getElementById('status').innerHTML = str;
  });
}

function appendToHtml (name, imageUrl) {
  let structure = [
    '<div class="col-md-4 col-sm-6 portfolio-item">',
    '<a class="portfolio-link" data-toggle="modal" href="#portfolioModal1">',
    '<div class="portfolio-hover">',
    '<div class="portfolio-hover-content">',
    '<i class="fa fa-plus fa-3x"></i>',
    '</div>',
    '</div>',
    '<img class="img-fluid" src="' + imageUrl + '">',
    '</a>',
    '<div class="portfolio-caption">',
    '<h4>' + name + '</h4>',
    '</div>',
    '</div>'
  ];
  $(structure.join('')).appendTo($('.album_images'));
}

function parseMusicImages (artistNames) {
  for (let property in artistNames) {
    appendToHtml(property, artistNames[property]);
  }
}

let musicList = [];
function getMusic () {
  FB.api('/me/music', function (response) {
    for (let i = 0; i < response['data'].length; i++) {
      musicList.push(response['data'][i]['name']);
    }
    let artistNames = getitunesArtistImages(musicList);
    //parseMusicImages(artistNames);
  });
}
function Logout () {
  FB.logout(function () { document.location.reload(); });
}

// Load the SDK asynchronously
(function (d) {
  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) { return; }
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = '//connect.facebook.net/en_US/all.js';
  ref.parentNode.insertBefore(js, ref);
}(document));

// APPLE API CHANGES

// artistNames = ['Jack Johnson', 'Cold play', 'Taylor Swift']
retDict = {};
artistBase = 'https://itunes.apple.com/ca/artist/';
imgDict = {};

// getitunesArtistImages(['Taylor Swift', 'Green Day', 'Michael Jackson']);
function getitunesArtistImages (artistNames) {
  for (let i=0; i < artistNames.length; i++) {
    const name = artistNames[i];
    getId(name);
  }

  for (name in retDict) {
    getImage(name, retDict[name]);
  }
  console.log(imgDict);
  return imgDict;
}
function getId (name) {
  $.ajax({
    async: false,
    url: 'https://itunes.apple.com/search\?term\=' + name,
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    success: function (res) {
        if (res.results[0])
            retDict[name] = res.results[0].artistId;
        else
            retDict[name] = "Image not available"
    },
    error: function (res) {
      retDict[name] = "Image not available"
    }
  });
}

function getImage (artist, artistId) {
  console.log(artist);
  console.log(artistId);
  $.ajax({
    async: false,
    url:  'https://itunes.apple.com/ca/artist/' + artistId,
    type: 'GET',
    success: function (res) {
      const regex = 'meta property=';
      imgURL = res.match('<meta property="og:image" content="([a-zA-Z0-9 :\/\.\-]+.jpg)" id="ember[0-9]+" class="ember-view">')[1];
      appendToHtml(name, imgURL);
      imgDict[name] = imgURL;
    },
    error: function (res) {
        imgDict[name] = "http://vignette3.wikia.nocookie.net/canadians-vs-vampires/images/a/a4/Not_available_icon.jpg/revision/latest?cb=20130403054528";
    }
  });
}