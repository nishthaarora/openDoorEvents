var eventArr = [];
var city;
var category;
var zipCode;

// parameter object to be passed to eventful API for making an api call
var apiParameters = {
    app_key: "3sqmmtWF3swnsGxH",
    page_size: 2,
    sort_order: "popularity"

}; <<
<< << < HEAD
var p1, p2, p0, temp;

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAsq6cXBKkFnimoovY-5ejzKIJ4kfMT6Xk",
    authDomain: "groupproject3-b7b27.firebaseapp.com",
    databaseURL: "https://groupproject3-b7b27.firebaseio.com",
    storageBucket: "groupproject3-b7b27.appspot.com",
    messagingSenderId: "758842518995"
};

firebase.initializeApp(config);


var database = firebase.database();
var userName;
var cityName;
var usersRef;
var eventsArray = [];
var cityArray = [];

$(document).ready(function() {


    $('#submitButton').on('click', getEventsAndPinn);


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
        p0 = getWeather(zipCode);
        p1 = getEvents("/events/search", apiParameters);
        p2 = initialiseGoogleMap(document.getElementById('map'), {
            zoom: 12,
            center: {
                lat: -34.397,
                lng: 150.644
            }
        });

        p0.then(getTempFromWeatherObj, function(err) {
            console.log(err);
        });
        // sequence of promises
        p1.then(pushEventsToArray)
            .then(geocodeEvents, function(err) {
                console.log(err);
            });



        /* This is our second promise that we are making in this we are initialising our googlemaps and sending the params
        divID and map parameters which are defined in p2 promise above. divId is the id in HTML for maps and mapParamObject
        are defining the initial zoom and lat and lon for the map.
        */
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


        /* once getEvents is executed then we are passing its values with data variable and further looping
        through the objects of array and pushing it to our array i.e eventArr
        */
        function pushEventsToArray(data) {

            eventArr = [];
            $('#tableBody').children().remove();

            data.events.event.forEach(function(ele) {
                eventArr.push({
                    eventName: ele.title,
                    eventDate: ele.start_time,
                    venue: ele.venue_name,
                    latitude: ele.latitude,
                    longitude: ele.longitude,
                    eventAddress: ele.venue_address + ', ' + ele.postal_code,
                    city: ele.city_name,
                    state: ele.region_name

                });
            });

            updateDomTable();
            // p2 is the second promise which is initialising my google maps.
            return p2;
        }


        /* This is the first promise p1 to get all the events from eventful api
        and we are passing 2 arguments url and parameters a call back function
        with event data. We are getting the event data from api and sendng it to
         function pushEventsToArray with "data"
        */
        function getEvents(url, paramObj) {

            return new Promise(function(resolve, reject) {

                EVDB.API.call(url, paramObj, function(eventData) {
                    console.log(eventData)

                    if (eventData) {
                        resolve(eventData);
                    } else reject("error");

                });


            });
        }


        // This is the funtion where we are defining out markers and passing the values to googlemaps
        function geocodeEvents(data) {



            eventArr.forEach(function(ele) {


                data.geocoder.geocode({
                    'address': ele.eventAddress
                }, function(results, status) {

                    if (status === 'OK') {

                        data.map.setCenter(results[0].geometry.location);

                        var contentString = '<div>' + 'Event: ' + ele.eventName + '<br>' +
                            'Address: ' + ele.eventAddress + '<br>' +
                            'Date: ' + moment(ele.eventDate).format('MM DD YYYY, hh:mm a') + '<br>' +
                            'temp: ' + temp + ' F' + '</div>';

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
                        marker.addListener('mouseout', function() {
                            infowindow.close(map, marker);
                        });

                    } else {
                        alert('Geocode was not successful for the following reason: ' + status);
                    }
                });
            });
        }

        // This ia function to get the weather from the third API i.e weather
        function getWeather(zipCode) {

            // This is our API Key
            var APIKey = "166a433c57516f51dfab1f7edaed8413";

            // Here we are building the URL we need to query the database
            var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + zipCode + "&units=imperial&appid=" + '166a433c57516f51dfab1f7edaed8413';
            return $.ajax({
                url: queryURL,
                method: 'GET'
            });

        }

    };

    // This function is to get the weather from the weather object which we are receiving in the above function
    function getTempFromWeatherObj(response) {
        temp = response.main.temp;

    }


    // function to update the table of events on the webpage
    function updateDomTable() {
        eventArr.forEach(function(ele) {
            $('#tableBody').append('<tr>' +
                '<td>' + ele.eventName + '</td>' +
                '<td>' + ele.eventAddress + '</td>' +
                '<td>' + ele.eventDate + '</td>' +
                '<td></td>' +
                '</tr>');
        });
    }


    // this function is enabling the functionality of the tabs: this week, today etc
    $(document).on('click', '.viewSwitch', function(event) {
        event.preventDefault();
        eventArr = [];

        var linkHash = $(this).find('a').attr('href');

        // remove hash from front;
        $('#submitButton').trigger('click', linkHash.slice(1, linkHash.length));

    });

    // Creating ImageTags dinamically

    var random = Math.floor(Math.random() * 8);

    function getImages() {
        var imageDiv = $('<div class="row ImageRow">');
        $('.frontPage').append(imageDiv);

        for (var i = 0; i < 8; i++) {
            var image = $('<img>');
            image.addClass('randomImages col m3 s1');
            image.attr('src', 'assets/images/' + i + '.jpg' || '.jpeg');
            $('.ImageRow').append(image);

        }


    }

    /* enterWebsite,below is a submit button displayed on the front page. If the user click on submit
    then he will go to the mainPage currently he is on frontPage
    */

    $('#enterWebsite').on('click', function() {

        var name = $('#userName').val();
        console.log(name);
        if (!name) {
            $('.mainPage').hide();
            // $('.userNameInput,.enterWebsite').append('Please enter your Name');
            $('.userNameInput,.enterWebsite').attr('placeholder', 'Please enter your Name');
        } else {
            $('.mainPage').show();
            $('.frontPage').hide();

            var nameArr = name.split(" ");
            nameArr.forEach(function(ele) {
                $('.userNameInput,.enterWebsite').html('Welcome ' + ele.charAt(0).toUpperCase() +
                    ele.substring(1) + '!');
            });
        }
    });


    // This function is hiding carousel from the web page and displaying the map on click of submit

    $('#submitButton').on('click', function() {
        $('.eventDisplayTabs').show();

    })


    getImages();


});

//on entering username get the location/city and store them in an array
$("#userName").change(function() {
    userName = $("#userName").val();
    usersRef = database.ref().child('users/' + userName + '/locations');

    usersRef.once("value", function(snapshot) {

        var location = snapshot.val();
        console.log(location);
        for (var key in location) {
            cityArray.push(location[key].cityName);
            console.log("cityName:" + location[key].cityName);
        }
        console.log("cityArray" + cityArray);

    });

});

$("#city").autocomplete({
    source: cityArray
});

function storeInFirebase() {
    userName = $("#userName").val();
    cityName = $("#city").val();
    category = $("#category").val();
    state = $("#state").val();

    console.log("userName" + userName);
    console.log("cityName" + cityName);
    console.log("category" + category);
    console.log("state" + state);
    usersRef = database.ref().child('users/' + userName);


    usersRef.child('locations').push({
        cityName: cityName,
        state: state,
        category: category
    });

    console.log("push done");
}