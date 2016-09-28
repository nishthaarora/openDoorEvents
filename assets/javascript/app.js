var eventArr = [];
var city;
var category;
var zipCode;

// parameter object to be passed to eventful API for making an api call
var apiParameters = {
    app_key: "3sqmmtWF3swnsGxH",
    page_size: 8,
    sort_order: "popularity"

};
var p1, p2, p0, temp, tempForcastArr;

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
var tempCity;
var tempState;
var p;
var eventDetailsDiv;
var tempEvent;
// var eventsLoaded = false;
// var frontPageMap, map;
var map;
var mapParamObj;
var geocoder;

$(document).ready(function() {

    $('.slider').slider();
    $('.modal-trigger').leanModal();

    state = undefined;
    city = undefined;
    userName = undefined;
    tempCity = undefined;
    tempState = undefined;

    mapParamObj = {
            zoom: 8,
            center: {
                lat: -34.397,
                lng: 150.644
            }
        };

    try {

     //   frontPageMap = new google.maps.Map(document.getElementById('frontpagemap'), mapParamObj);
        map = new google.maps.Map(document.getElementById('map'), mapParamObj);
        geocoder = new google.maps.Geocoder();

    } catch(err) {
        console.log("document ready error for maps :"+err.message);
    }

    $("#userName").val("");
    $('#state').val("");
    $('#city').val("");
 //   $("#frontpagemap").show();

    /* this is a promise for the below 2 functions, geoTest which is taking user cordinated and eventsNearMe which is making an API call
    to the eventful api and returning the events near those cordinated
    */
    p = geoTest();
    p.then(eventsNearMe, function(err) {
        console.log("document ready err:"+err);
    });

    loadMapInfo();

    // taking user cordinated lat and long to show the events near that location.
    function geoTest() {

        return new Promise(function(resolve, reject) {

            navigator.geolocation.getCurrentPosition(function(position) {

                if (position) {
                 //ajax call to get current state and city for current latitude and longitude
                 $.ajax({ url:'http://maps.googleapis.com/maps/api/geocode/json?latlng='+
                    position.coords.latitude +','+
                     position.coords.longitude+'&sensor=true',
                     success: function(data){
                             tempCity = data.results[0].address_components[2].long_name;

                            tempState = data.results[0].address_components[4].long_name;
                             $("#eventheading").html('<h4>'+"Things to do in "+tempCity+',' +tempState+'</h4>');
                         //or you could iterate the components for only the city and state/
                         // eventsLoaded = true;

                        }
                    }); 

                    resolve(position);

                } else {
                    console.log("inside geoTest else");
                    reject("error");
                }
            });

        });


    }

    //geoTest();

    function displayEvents() {

        eventArr.forEach(function(ele) {

        });

    } // end of - displayEvents

    // This function is taking user cordinates from the above function and giving all the events near that location

    function eventsNearMe(currentLocation) {

        var coords = currentLocation.coords.latitude + "," + currentLocation.coords.longitude;
        apiParameters.location = coords;

        apiParameters.date = moment().format('DD-MM-YYYY');
        apiParameters.within = 100;

        console.log("inside eventsNearMe");
        getEvents("/events/search", apiParameters)
            .then(function(ele) {

                var events = ele.events.event;

                events.forEach(function(event) {
                    //console.log("event:"+(event));
                    var image = event.image.thumb.url;
                    var title = event.title;
                    var url = event.url;
                  //  console.log("tempEvent:"+JSON.stringify(tempEvent));
                    var eventURL = $('<a class="infoURL"> Click for more details</a>');
                    eventURL.attr('href', url);

                    var detail = '<div class="eventDescription">' + 'Venue: ' + event.venue_name + "<br>" + 'Address: ' + event.venue_address +
                    "<br>" + 'City: ' + event.city_name + "<br>" + 'Date & Time: ' +event.start_time + '</div>';

                    
                    var figDiv = $('<figure>');
                    var imageDiv = $('<img class=eventNearMeImage > ');
                    imageDiv.attr('src', image);

                    console.log("image:"+image);
                    eventDetailsDiv = $('<div class="eventDetails ">');
                   
                    figDiv.append(imageDiv);
                    var figcaptionDiv = $('<figcaption >' + title + '</figcaption>');
                    figDiv.append(figcaptionDiv);

                    eventDetailsDiv.append(figDiv);
                    eventDetailsDiv.append(detail);
                    eventDetailsDiv.append(eventURL);

                    $('.eventsRow').append(eventDetailsDiv);
                    //eventsLoaded = true;

                });

                loadMapInfo(); //added to load map on front page
                
            });


    }
 




    // on the click of the submit button which is displayed on the front page, rest of the things are happenings

    $('#submitButton').on('click', getEventsAndPinn);


    // get events from eventful API and pin them on the map using Google API
    function getEventsAndPinn(event, date) {


     //   if (eventsLoaded === false) {
       //     return;
        // }

       // if ($('#city').val()) {
            event.preventDefault();
      // }

    //    console.log('event1', event)
            // store user event info into firebase database
        storeInFirebase();
        loadMapInfo();

    }

    function loadMapInfo() {
        // capturing user inputs
        console.log("inside loadMapInfo");
        state = $('#state').val();
        city = $('#city').val();
        category = $('#category').val();
        date = date || $('#date').val();

        // making an API call by sending user inputs
        apiParameters.location = '';
         if (city) {
            apiParameters.location = city + ',';
        } else {
            apiParameters.location = tempCity + ',';
            city = tempCity;
        }

        if (state) {
            apiParameters.location += state;
        } else {
            apiParameters.location += tempState;
            state = tempState;
        }
        apiParameters.category = category;
        apiParameters.date = date;

        // These are the variables for the promise that we are making
        p0 = getWeather(city + ',' + state + ',usa');
        p1 = getEvents("/events/search", apiParameters);

        p2 = initialiseGoogleMap(map);

        p0.then(getTempFromWeatherObj, function(err) {
            console.log(err);
        });


        // sequence of promises
        p1.then(pushEventsToArray)
            .then(geocodeEvents, function(err) {
                console.log("inside pushEventsToArray err:"+ err);
            });

    } // end of - loadMapInfo

    /* This is our second promise that we are making in this we are initialising our googlemaps and sending the params
    divID and map parameters which are defined in p2 promise above. divId is the id in HTML for maps and mapParamObject
    are defining the initial zoom and lat and lon for the map.
    */
    function initialiseGoogleMap(tempMap) {

      //  console.log("inside initialiseGoogleMap divID:"+divID);
        return new Promise(function(resolve, reject) {
            console.log("mapParamObj:"+mapParamObj);

            try {
                if (tempMap && geocoder) {
                    resolve({
                        map: tempMap,
                        geocoder: geocoder,

                    });
                } else {
                    reject("initialiseGoogleMap error");
                }

            } catch(err) {
                console.log("initialiseGoogleMap error for maps :"+err.message);
            }

        });

    }


    /* once getEvents is executed then we are passing its values with data variable and further looping
    through the objects of array and pushing it to our array i.e eventArr
    */
    function pushEventsToArray(data) {
        console.log('array', data);
        eventArr = [];
        $('#tableBody').children().remove();

        data.events.event.forEach(function(ele) {


            var eventDate = moment(ele.start_time, "YYYY-MM-DD hh:mm:ss").format('MMDDYYYY');
            var eventTemp = getTempForEvent(eventDate);
            console.log("TEMP", eventTemp);

            eventArr.push({
                eventName: ele.title,
                eventDate: ele.start_time,
                venue: ele.venue_name,
                latitude: ele.latitude,
                longitude: ele.longitude,
                eventAddress: ele.venue_address + ', ' + ele.postal_code,
                city: ele.city_name,
                state: ele.region_name,
                temp: eventTemp

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
        console.log(url, paramObj);

        console.log("inside getEvents - url:"+url+", paramObj:"+JSON.stringify(paramObj));
        return new Promise(function(resolve, reject) {

            EVDB.API.call(url, paramObj, function(eventData) {
                console.log(' EVDB event', eventData)

                if (eventData) {
                    console.log("EVDB event inside eventData"+eventData);

          //          tempEvent = eventData;
                    resolve(eventData);
                } else reject("error");

            });


        });
    }


    // This is the funtion where we are defining our markers and passing the values to googlemaps
    function geocodeEvents(data) {
        console.log("inside geocodeEvents data:"+data);


        eventArr.forEach(function(ele) {

            console.log("ele:"+ele);
            data.geocoder.geocode({
                'address': ele.eventAddress
            }, function(results, status) {

                if (status === 'OK') {

                    data.map.setCenter(results[0].geometry.location);

                    var contentString = '<div>' + 'Event: ' + ele.eventName + '<br>' +
                        'Address: ' + ele.eventAddress + '<br>' +
                        'Date: ' + moment(ele.eventDate).format('MM-DD-YYYY, hh:mm a') + '<br>' +
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

        console.log("weather reasponse", response);
        tempForcastArr = [];
        response.list.forEach(function(ele) {
            tempForcastArr.push({
                date: ele.dt,
                temp: ele.temp.day
            });

        });

    }

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


    // function to update the table of events on the webpage
    function updateDomTable() {
        eventArr.forEach(function(ele) {
            $('#tableBody').append('<tr>' +
                '<td>' + ele.eventName + '</td>' +
                '<td>' + ele.eventAddress + '</td>' +
                '<td>' + moment(ele.eventDate).format('MM-DD-YYYY, hh:mm a') + '</td>' +
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


    // firebase settings
    //on entering username get the location/city and store them in an array
    $("#userName").change(function() {
        userName = $("#userName").val();
        usersRef = database.ref().child('users/' + userName + '/locations');

        console.log("userName:"+userName);
        usersRef.once("value", function(snapshot) {

            var location = snapshot.val();
            console.log(location);
            for (var key in location) {
                //removes duplicate citynames
                if (cityArray.indexOf(location[key].cityName) === -1) {
                    cityArray.push(location[key].cityName);
                    console.log("cityName:" + location[key].cityName);
                }

            }
            console.log("cityArray" + cityArray);

        });
    });

    $("#city").autocomplete({
        source: cityArray
    });


    // store in firebase
    function storeInFirebase() {
        cityName = $("#city").val();
        category = $("#category").val();
        state = $("#state").val();

        console.log("userName2" + userName);
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

    // Creating ImageTags dinamically

    function getImages() {
        var imageDiv = $('<div class="row imageRow">');
        $('.frontPage').append(imageDiv);

        for (var i = 0; i < 1; i++) {
            var image = $('<img>');
            image.addClass('randomImages col m12 s1');
            image.attr('src', 'assets/images/' + Math.floor(Math.random() * 22) + '.jpg' || '.jpeg');

            $('.imageRow').append(image);
        }
    }
 //   getImages();


    /* enterWebsite,below is a submit button displayed on the front page. If the user click on submit
    then he will go to the mainPage currently he is on frontPage
    */

    $('#enterWebsite').on('click', function() {

        userName = $("#userName").val();
        if (!userName) {
       //     $('.mainPage').hide();
     //       $('#map').hide();
            // $('.userNameInput,.enterWebsite').append('Please enter your Name');
            $('.userNameInput,.enterWebsite').attr('placeholder', 'Please enter your Name');
    //        $('#frontpagemap').hide();
            $('.frontPage').show();
            console.log("inside enterWebsite  userName:"+userName);
        } else {
      //      $('#frontpagemap').hide();
           $('.frontPage').hide();
            $('#map').show();
            $('.mainPage').show();
            $("#frontpageId").hide();
            var nameArr = userName.split(" ");
            console.log("inside enterWebsite else userName:"+userName);

            tempCity = undefined;
            tempState = undefined;


            loadMapInfo();

            /*
            p = geoTest();
            p.then(eventsNearMe, function(err) {
                console.log("document ready err:"+err);
            });
*/

            nameArr.forEach(function(ele) {
                $('.userNameInput,.enterWebsite').html('Welcome ' + ele.charAt(0).toUpperCase() +
                    ele.substring(1) + '!');

            });
        }


    });


    // This function is hiding carousel from the web page and displaying the map on click of submit

    $('#submitButton').on('click', function() {
 //      $('#frontpagemap').hide();
        $('#map').show();
        $('.eventDisplayTabs').show();
        // $('#tableHeading').show();
        // $('#tableBody').show();

    });



});

//getting username
/* $("#enterWebsite").on("click", function() {
 //   userName = $("#userName").val();
    console.log("userName1" + userName);
});

*/
