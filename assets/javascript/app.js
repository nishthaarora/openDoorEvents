//   Declare global varaibles
var city;
var category;
var zipCode;
var userName;
var cityName;
var usersRef;
var database;
var eventArr = [];
var eventsArray = [];
var cityArray = [];
var categoryArray = [];
var stateArray = [];

// These are used to store promises
var p1, p2, p0, pUser;

// To store temperature
var temp, tempForcastArr;

// Parameters to be passed to eventful API for making an api call
var apiParameters = {
    app_key: "3sqmmtWF3swnsGxH",
    page_size: 4,
    sort_order: "popularity"

};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAeTLSZjy3Tm0U9UoRTePBVg2HD3mYUqQM",
    authDomain: "firstgroupprojec-1473951653941.firebaseapp.com",
    databaseURL: "https://firstgroupprojec-1473951653941.firebaseio.com",
    storageBucket: "firstgroupprojec-1473951653941.appspot.com",
    messagingSenderId: "1058292953682"
};

// storing array's in firebse to autocomplete user inputs
categoryArray = ['music', 'family', 'comedy', 'concerts', 'books', 'business', 'art', 'crafts'];

// state array for firebase
stateArray = ['tx', 'wa', 'ca', 'il', 'ny'];


// Google API call to initialize google map. divID is the DOM elements where we are displaying map and mapParamObj are mained below, in promises.

function initialiseGoogleMap(divID, mapParamObj) {

    return new Promise(function(resolve, reject) {

        var map = new google.maps.Map(divID, mapParamObj);
        var geocoder = new google.maps.Geocoder();

        if (map && geocoder) {
            resolve({
                map: map,
                geocoder: geocoder,
            });
        } else {
            reject("error");
        }
    });
}


// taking user cordinated lat and long to show the events near that location.
function geoTest() {
    return new Promise(function(resolve, reject) {

        navigator.geolocation.getCurrentPosition(function(position) {

            if (position) {
                resolve(position);
            } else {
                reject("error");
            }
        });
    });
}

// This function makees a call to google maps API, after events are fetched from eventful API

function geocodeEvents(data) {
    $('#map').show();
    $('#tabDiv').show();

    eventArr.forEach(function(ele) {

        data.geocoder.geocode({
            'address': ele.eventAddress + ', ' + ele.city + ', ' + ele.zip
        }, function(results, status) {

            if (status === 'OK') {

                data.map.setCenter(results[0].geometry.location);

                var contentString = '<div>' +
                    'Event: ' + ele.eventName + '<br>' +
                    'Address: ' + ele.eventAddress + '<br>' +
                    '         ' + ele.city + ', ' + ele.zip + '<br>' +
                    'Date: ' + moment(ele.eventDate).format('MM-DD-YYYY, hh:mm a') + '<br>' +
                    'More Info: <a href="' + ele.url + '" target="_blank">' + ele.url + '</a><br>' +
                    'Temp: ' + ele.temp + ' F' + '</div>';

                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                var marker = new google.maps.Marker({
                    map: data.map,
                    position: results[0].geometry.location
                });
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    });
}

// Eventful API call to get events

function getEvents(url, paramObj) {

    return new Promise(function(resolve, reject) {

        EVDB.API.call(url, paramObj, function(eventData) {
            if (eventData) {
                resolve(eventData);
            } else reject("error");
        });
    });
}


// makes API call eventful API to fetch events near current geolocation

function eventsNearMe(currentLocation) {

    var coords = currentLocation.coords.latitude + "," + currentLocation.coords.longitude;
    apiParameters.location = coords;
    apiParameters.date = moment().format('DD-MM-YYYY');
    apiParameters.within = 100;

    getEvents("/events/search", apiParameters)
        .then(function(ele) {

            var events = ele.events.event;

            events.forEach(function(event) {

                var image = event.image.medium.url;
                var title = event.title;
                var url = event.url;
                var eventURL = $('<a class="info-url"> Click for more details</a>');
                eventURL.attr('href', url);

                var detail = '<div class="event-description">' + 'Venue: ' + event.venue_name + "<br>" + 'Address: ' + event.venue_address +
                    "<br>" + 'City: ' + event.city_name + "<br>" + 'Date & Time: ' + event.start_time + "<br>" + '<a href="' + url + '" target="_blank">' + "Click for more Info" + '</a>' + '</div>';

                var imageDiv = $('<img class="event-near-me-image">');
                imageDiv.attr('src', image);
                var eventDetailsDiv = $('<div class="event-details col m3">');
                eventDetailsDiv.append(imageDiv);
                eventDetailsDiv.append(detail);
                $('#imgDiv').append(eventDetailsDiv);

            });
        });
}

// This function gets called after events are fetched from Eventful API

function pushEventsToArray(data) {
    eventArr = [];
    $('#tableBody').children().remove();

    data.events.event.forEach(function(ele) {

        var eventDate = moment(ele.start_time, "YYYY-MM-DD hh:mm:ss").format('MMDDYYYY');
        var eventTemp = getTempForEvent(eventDate);

        eventArr.push({
            eventName: ele.title,
            eventDate: ele.start_time,
            venue: ele.venue_name,
            latitude: ele.latitude,
            longitude: ele.longitude,
            eventAddress: ele.venue_address,
            zip: ele.postal_code,
            city: ele.city_name,
            state: ele.region_abbr,
            url: ele.url,
            temp: eventTemp,
            img: ele.image.medium.url

        });
    });

    updateDomTable();

    p2 = initialiseGoogleMap(document.getElementById('map'), {
        zoom: 12,
        center: {
            lat: -34.397,
            lng: 150.644
        }
    });
    // p2 is the second promise which is initialising google maps.
    return p2;
}

// function to update the table of events on the webpage
function updateDomTable() {
    $('#imgDiv').children().remove();

    eventArr.forEach(function(ele) {
        $('#tableBody').append('<tr>' +
            '<td>' + ele.eventName + '</td>' +
            '<td>' + ele.eventAddress + ',' + ele.city + ',' + ele.state + ',' + ele.zip + '</td>' +
            '<td>' + moment(ele.eventDate).format('MM-DD-YYYY, hh:mm a') + '</td>' +
            '<td></td>' +
            '</tr>');

        var image = ele.img;
        var title = ele.eventName;
        var url = ele.url;

        var eventURL = $('<a class="info+URL"> Click for more details</a>');
        eventURL.attr('href', url);

        var detail = '<div class="event-description">' +
            'Event: ' + ele.eventName + "<br>" +
            'Where: ' + ele.eventAddress + ',' + ele.city + ', ' + ele.zip + '<br>' +
            'When: ' + moment(ele.eventDate).format('MM-DD-YYYY, hh:mm a') + '<br>' +
            '<a href="' + ele.url + '" target="_blank">' + "Click for more Info" + '</a>' +
            '</div>';

        //var titleDiv = $('<div>' + 'Name: ' + title + '</div>');

        var imageDiv = $('<img class=event-near-me-image>');
        imageDiv.attr('src', image);

        var eventDetailsDiv = $('<div class="event-details col m3">');
        //eventDetailsDiv.append(titleDiv);
        eventDetailsDiv.append(imageDiv);
        eventDetailsDiv.append(detail);
        //eventDetailsDiv.append(eventURL);

        $('#imgDiv').append(eventDetailsDiv);
    });
}



// This ia function makes a call to open weather API to fetch weather
function getWeather(place) {

    var APIKey = "166a433c57516f51dfab1f7edaed8413";
    // This is our API Key
    queryURL = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" + place + "&units=Imperial" + '&cnt=16' + "&appid=" + '166a433c57516f51dfab1f7edaed8413';

    return $.ajax({
        url: queryURL,
        method: 'GET'
    });

}


// This function is to get the weather from the weather object which we are receiving in the above function
function getTempFromWeatherObj(response) {

    tempForcastArr = [];
    response.list.forEach(function(ele) {
        tempForcastArr.push({
            date: ele.dt,
            temp: ele.temp.day
        });
    });
}

// This function grabs temp for an event for that eventdate
function getTempForEvent(eventDt) {

    var eventTempObj = tempForcastArr.filter(function(obj) {
        return moment.unix(obj.date).format("MMDDYYYY") === eventDt;
    });

    if (eventTempObj.length === 0) {
        return "--"
    } else {
        return eventTempObj[0].temp;
    }

}


// get events from eventful API and pin them on the map using Google API
function getEventsAndPinn(event, date) {


    event.preventDefault();
    // store user event info into firebase database
    storeInFirebase();

    // capturing user inputs

    state = $('#state').val();
    city = $('#city').val();
    category = $('#category').val();
    date = date || $('#date').val();

    // making an API call by sending user inputs
    apiParameters.location = '';
    if (city) {
        apiParameters.location = city + ',';
    }

    if (state) {
        apiParameters.location += state;
    }
    apiParameters.category = category;
    apiParameters.date = date;

    // These are the variables for the promise that we are making
    p0 = getWeather(city + ',' + state + ',usa');
    p1 = getEvents("/events/search", apiParameters);
    p0.then(getTempFromWeatherObj, function(err) {
        console.log(err);
    });

    // sequence of promises
    p1.then(pushEventsToArray)
        .then(geocodeEvents, function(err) {
            console.log(err);
        });
}

// Creating ImageTags dynamically
function getImages() {
    var imageDiv = $('<div class="row image-row">');
    $('.frontPage').append(imageDiv);

    for (var i = 0; i < 1; i++) {
        var image = $('<img>');
        image.addClass('random-images col m12 s1');
        image.attr('src', 'assets/images/' + Math.floor(Math.random() * 22) + '.jpg' || '.jpeg');
        $('.image-row').append(image);
    }
}

// store in firebase
function storeInFirebase() {
    userName = $('#userName').val();
    cityName = $("#city").val();
    category = $("#category").val();
    state = $("#state").val();

    usersRef = database.ref().child('users/' + userName);

    usersRef.child('locations').push({
        cityName: cityName,
        state: state,
        category: category
    });
}



// firbase database initializations
firebase.initializeApp(config);
database = firebase.database();

// this is the main function
$(document).ready(function() {
    $('#login-page').openModal({
        dismissible: false
    });

    // Authentication
    $('#signIn').click(function(event) {

        event.preventDefault();
        const email = $('#userEmail').val().trim();
        const pwd = $('#password').val().trim();
        const auth = firebase.auth();
        const pUser = auth.signInWithEmailAndPassword(email, pwd);
        pUser.then(function(user) {

            $('#login-page').closeModal();


        userName = $('#userName').val().trim();

        var nameArr = userName.split(" ");
            nameArr.forEach(function(ele) {
                $('#userNameDisplay').html('Welcome  ' + ele.charAt(0).toUpperCase() +
                    ele.substring(1) + ' !');
         })


        }, function(err) {
            console.log(err);
        });
    });

    $('#signUp').click(function(event) {
        event.preventDefault();

        const email = $('#userEmail').val().trim();
        const pwd = $('#password').val().trim();
        const auth = firebase.auth();
        const pUser = auth.createUserWithEmailAndPassword(email, pwd);
        pUser.then(function(user) {
            $('#login-page').closeModal();


        userName = $('#userName').val().trim();

        var nameArr = userName.split(" ");
            nameArr.forEach(function(ele) {
                $('#userNameDisplay').html('Welcome  ' + ele.charAt(0).toUpperCase() +
                    ele.substring(1) + ' !');
         })

        });
        // buttonActions(event);
        pUser.catch(e => console.log(e));
    });


    // });

    $('#signOut').click(function(event) {
        firebase.auth().signOut();

    });

    firebase.auth().onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
            console.log(firebaseUser);
        } else {
            console.log("User not signed in");
        }

    });

    /* this is a promise for the below 2 functions, geoTest which is taking user cordinated and eventsNearMe which is making an API call
    to the eventful api and returning the events near those cordinated
    */

    p = geoTest();
    p.then(eventsNearMe, function(err) {
        console.log(err);
    });

    // geoTest();

    // on the click of the submit button which is displayed on the front page, rest of the things are happenings
    $('#submitButton').on('click', getEventsAndPinn);

    // this function is enabling the functionality of the tabs: this week, today etc
    $(document).on('click', '.view-switch', function(event) {
        event.preventDefault();
        eventArr = [];
        var linkHash = $(this).find('a').attr('href');
        // remove hash from front;
        $('#submitButton').trigger('click', linkHash.slice(1, linkHash.length));

    });

    $("#userName").change(function() {
        userName = $("#userName").val();
        usersRef = database.ref().child('users/' + userName + '/locations');

        usersRef.once("value", function(snapshot) {

            var location = snapshot.val();
            for (var key in location) {
                //removes duplicate citynames
                if (cityArray.indexOf(location[key].cityName) === -1) {
                    cityArray.push(location[key].cityName);
                }
            }
        });
    });


});