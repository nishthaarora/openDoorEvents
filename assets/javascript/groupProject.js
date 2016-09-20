

  // // Initialize Firebase
  // var config = {
  //   apiKey: "AIzaSyAeTLSZjy3Tm0U9UoRTePBVg2HD3mYUqQM",
  //   authDomain: "firstgroupprojec-1473951653941.firebaseapp.com",
  //   databaseURL: "https://firstgroupprojec-1473951653941.firebaseio.com",
  //   storageBucket: "firstgroupprojec-1473951653941.appspot.com",
  //   messagingSenderId: "1058292953682"
  // };
  // firebase.initializeApp(config);

  // var database = firebase.database();


  // making API call on eventfull  
function apiCall()

{
	// getting category value from user input
 var categoryResponse = $('#userCategoryInput').val().trim();
 	// getting user input of location 
 var stateResponse = $('#userStateInput').val().trim();
 	// getting user input of date
 var dateResponse = $('#userDateInput').val().trim()
// converting date string into numeric value
// var dateResponseNum = Date.parse(dateResponse);
// console.log(dateResponseNum);
// // current day from moments.js
// var currentDate = moment().format('YYYY-MM-DD');
// // converting current day string into a number
// var currentDateNum = Date.parse(currentDate);

// var timeAfter7Days = currentDateNum + (7*24*60*60*1000);
// console.log(timeAfter7Days)


// if(dateResponseNum === currentDateNum) {
// 	console.log('today');
// } else if(dateResponseNum < timeAfter7Days) {
// 	console.log('thisWeek')
// } else {
// 	console.log('later')
// }


var apiParameters = {

            app_key:"3sqmmtWF3swnsGxH",

            category: categoryResponse,

            location: stateResponse,

            date: dateResponse,

            page_size: 2
  };

  EVDB.API.call("/events/search", apiParameters, function(response) {
    
    	var resultArr = response.events.event;
    	
    	   	resultArr.forEach(function(ele){
    		// event address
    		var eventAddress = ele.venue_address;
    		// event date
    		var eventDate = ele.start_time;
    		// latitude
    		var eventLatitude = ele.latitude;
    		var eventLatitudeNumer = parseFloat(eventLatitude);
    		// longitude
    		var eventLongitude = ele.longitude;
    		var eventLongitudeNumber = parseFloat(eventLongitude);

    		// lat and long together
    		initMap(eventLatitudeNumer, eventLongitudeNumber, eventDate);

    		
    	})
    });

}

// function sum( a, b ) {
//  var sum = a + b;
//  var product = a * b;
// }

// var sumOf2 = sum(2,3); 

		var map;

       function initMap(lat, long, eventDate) {
       	var cordinates = {lat: lat, lng: long};
       	var eventDate = eventDate;

       	if (!map) {
       		map = new google.maps.Map(document.getElementById('map'), {
          	zoom: 8,
          	center: cordinates
        });
       	}
        var geocoder = new google.maps.Geocoder();  
        geocodeLatLng(geocoder, map, cordinates, eventDate);
        return cordinates;
        
      }

      function geocodeLatLng(geocoder, map, cordinates, eventDate) { 
      

         geocoder.geocode({'location': cordinates}, function(results, status){
          if (status === 'OK') {  
          	if (results[1]) {
              map.setZoom(11);
              var marker = new google.maps.Marker({
                position: cordinates,
                map: map, 
                
              });

              var contentString = '<div>'+results[1].formatted_address+'<br>'+'Date and Time: '+eventDate+'</div>';
              
              var infowindow = new google.maps.InfoWindow({
                content: contentString

              });

			         			
            marker.addListener('click', function() {
                infowindow.open(map, marker);
              });
            
            } else {
              window.alert('No results found');
            }
                         
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
     
      }

$('#submitButton').on('click', apiCall); 

