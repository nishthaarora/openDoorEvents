var eventArr = [];
var city;
var category;

// parameter object to be passed to eventful API for making an api call
var apiParameters = {

    app_key: "3sqmmtWF3swnsGxH",
    where: city,
    date: date,
    cagtegory: category,
    page_size: 2,
    sort_order: "popularity"

};
var p1, p2, p0;


$(document).ready(function() {

    $('#submitButton').on('click', getEventsAndPinn);


    // get events from eventful API and pin them on the map using Google API
    function getEventsAndPinn(event) {
        event.preventDefault();

        city = $('#city').val();
        category = $('#category').val();
        date = $('#date').val();

        apiParameters.where = city;
        apiParameters.category = category;
        apiParameters.date = date;

        // These are the variables for the promise that we are making 
        p0 = getWeather(city);
        p1 = getEvents("/events/search", apiParameters);

        p2 = initialiseGoogleMap(document.getElementById('map'), {
            zoom: 8,
            center: {
                lat: -34.397,
                lng: 150.644
            }
        });


        // sequence of promises
        p1.then(pushEventsToArray)
          .then(geocodeEvents,function(err){
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

                    getWeather(city)
                        .then(function(weatherResponse) {
                            resolve({
                                map: map,
                                geocoder: geocoder,
                                temp: getTempFromWeatherObj(weatherResponse)
                            });
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
            data.events.event.forEach(function(ele) {
                eventArr.push({
                    eventName: ele.title,
                    eventDate: ele.start_time,
                    venue: ele.venue_name,
                    latitude: ele.latitude,
                    longitude: ele.longitude,
                    eventAddress: ele.venue_address + ', ' + ele.postal_code

                });
            });

            updateDomTable();
             // p2 is the second promise which is initialising my google maps.
            return p2;
        }


        /* This is the first promise p1 to get all the events from eventful api and we are passing 2 argu,ments url and parameters
        A call back function with event data we are getting the event data from api and sendng it to function pushEventsToArray with 
        "data"
        */
        function getEvents(url, paramObj) {


            return new Promise(function(resolve, reject) {

                EVDB.API.call(url, paramObj, function(eventData) {

                    if (eventData) {
                        resolve(eventData);
                    } else reject("error");

                });


            });
        }


        // This is the funtion where we are defining out markers and passing the values to googlemaps
        function geocodeEvents(data) {

            var temp = data.temp;

            eventArr.forEach(function(ele) {

                data.geocoder.geocode({
                    'address': ele.eventAddress
                }, function(results, status) {

                    if (status === 'OK') {
                        data.map.setCenter(results[0].geometry.location);

                         var contentString ='<div>'+'Event: '+ele.eventName+'<br>'+
                                        'Address: '+ele.eventAddress+'<br>'+
                                        'Date: '+ele.eventDate+'<br>'+
                                        'temp: '+temp+'</div>';

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


        function getWeather(city) {

            // This is our API Key
            var APIKey = "166a433c57516f51dfab1f7edaed8413";

            // Here we are building the URL we need to query the database
            var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + '166a433c57516f51dfab1f7edaed8413';
            return $.ajax({
                url: queryURL,
                method: 'GET'
            });

        }

    };

    function getTempFromWeatherObj(response) {
        var temp = response.main.temp;
        return temp;
    }

    function updateDomTable(){
      eventArr.forEach(function(ele){
        $('#tableBody').append('<tr>'+
                      '<td>'+ele.eventName+'</td>'+
                      '<td>'+ele.eventAddress+'</td>'+
                      '<td>'+ele.eventDate+'</td>'+
                      '<td></td>'+
                    '</tr>');
      });    
    }


});