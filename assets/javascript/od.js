
var eventArr=[];
var city;
var category;
// parameter object to be passed to eventful API
var oArgs = {

  app_key: "3sqmmtWF3swnsGxH",
  where: city, 
  when: "Future",   
  cagtegory: category,
  page_size: 5,
  sort_order: "popularity"

};
var p1, p2;


$(document).ready(function(){
  
  $('#userInputs').on('submit',getEventsAndPinn);


  // get events from eventful API and pin them on the map using Google API
  function getEventsAndPinn(event){
    event.preventDefault();
    console.log("inside getEventsAndPinn");

    city= $('#city').val().trim();
    category= $('#category').val().trim();
    when= $('#when').val().trim();


    oArgs.where=city;
    oArgs.category = category;
    if(when){
      oArgs.when = when;
    }
              

    p1 = getEvents("/events/search", oArgs);
    p2 = initialiseGoogleMap(document.getElementById('map'),{
        zoom: 8,
        center: {lat: -34.397, lng: 150.644}
      });



    p1.then(pushEventsToArray)
      .then(geocodeEvents,function(err){ console.log("error")});

  }



  function initialiseGoogleMap(divID,mapParamObj){


      return new Promise(function(resolve,reject){
        var map = new google.maps.Map(divID,mapParamObj);
        var geocoder = new google.maps.Geocoder();

        if (map && geocoder){
          resolve({map:map,geocoder:geocoder});
        }else {reject ("error");}

      });
  }

  function pushEventsToArray(data){
    data.events.event.forEach(function(ele){
      eventArr.push({eventName : ele.title,
                      eventDate: ele.start_time,
                      venue: ele.venue_name,
                      latitude: ele.latitude,
                      longitude: ele.longitude,
                      eventAddress: ele.venue_address+', '+ele.postal_code});


    });

    return p2;
  }

  function getEvents(url,paramObj){


    return new Promise(function(resolve,reject){

          EVDB.API.call(url, paramObj, function(oData) {
            
              if(oData){
               resolve(oData);
             }else reject("error");

           });


      });
  }

  function geocodeEvents(data){
    eventArr.forEach(function(ele){
            console.log(ele);
          data.geocoder.geocode({'address': ele.eventAddress}, function(results, status) {
                if (status === 'OK') {
                    data.map.setCenter(results[0].geometry.location);
                    var contentString ='<div>'+ele.eventAddress+'<br>'+ele.eventDate+'</div>';

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


});





