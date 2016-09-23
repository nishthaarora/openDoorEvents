// Initialize Firebase
 var config = {
    apiKey: "AIzaSyAjiFcMAppFW9AqRusRp7dOSQSF-vVbYlA",
    authDomain: "odeusers.firebaseapp.com",
    databaseURL: "https://odeusers.firebaseio.com",
    storageBucket: "odeusers.appspot.com",
    messagingSenderId: "788239866664"
  };
  firebase.initializeApp(config);

var database = firebase.database();
var userName;
var cityName;
var category;
var state;
//setting table name as users in database


 	var locationsRef = database.ref('users/'+'bhagya'+'/locations');
   	var locationArr =[];

   	locationsRef.once("value", function(snapshot){
   		var locations = snapshot.val();
   		console.log("location",location);

   		for(var key in locations){
   			locationArr.push(locations[key].cityName);

   		}
   		
   		
   	});
   	console.log("locationArr",locationArr);

    $( "#city" ).autocomplete({
      source: locationArr
    });
	

$("#searchBt").on("click",function(){
	

	event.preventDefault();

  	var userCount;

  	userName = $("#userName").val();
 	cityName = $("#city").val();
  	category = $("#eventId").val();
  	state = $("#statId").val();

	// console.log("userName"+userName);
 // 	console.log("cityName"+cityName);
 //  	console.log("category"+category);
 //   	console.log("state"+state);


  

   	// console.log("locationArray",locationArr);
		
// 		var tempUserName = $("#userName").val();
// 		console.log("tempUserName:"+tempUserName);
// 		console.log(snapshot.hasChild(tempUserName));
// 		if (snapshot.hasChild(tempUserName) ){
	usersRef = database.ref('users/'+userName);

	usersRef.child('locations').push(
									{
										cityName :  cityName,
										state : state,
										category : category
									}
								);

	console.log("push done");

});

//on entering username see if the username is already exits in the firbase
//if exits in firebase database get the related eventdetails in html
// $("#userName").change( function() {

// 	usersRef.once("value", function(snapshot){
		
// 		var tempUserName = $("#userName").val();
// 		console.log("tempUserName:"+tempUserName);
// 		console.log(snapshot.hasChild(tempUserName));
// 		if (snapshot.hasChild(tempUserName) ){
// 			console.log("cityName  : "+JSON.stringify(snapshot.child(tempUserName).val()));
// 			console.log("cityName"+snapshot.child(tempUserName+"/"+"cityName").val());
//   			console.log("category"+snapshot.child(tempUserName+"/"+"category").val());
//    			console.log("state"+snapshot.child(tempUserName+"/"+"state").val());
//    			$("#city").attr("placeholder",snapshot.child(tempUserName+"/"+"cityName").val());
//    			var tempEventId = snapshot.child(tempUserName+"/"+"category").val();
//    			$('#eventId option[value='+tempEventId+']').attr("selected","selected");
//    			var tempStateId = snapshot.child(tempUserName+"/"+"state").val();
//    			$('#statId option[value='+tempStateId+']').attr("selected","selected");

//    		//	$("#statId").html(snapshot.child(tempUserName+"/"+"state").val());
// 		}
// 	});

// });