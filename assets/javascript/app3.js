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
var category;
var state;
//setting table name as users in database
var usersRef = database.ref().child("users");




$("#searchBt").on("click",function(){

	event.preventDefault();

  	var userCount;

  	userName = $("#userName").val();
 	cityName = $("#city").val();
  	category = $("#eventId").val();
  	state = $("#statId").val();

	console.log("userName"+userName);
 	console.log("cityName"+cityName);
  	console.log("category"+category);
   	console.log("state"+state);

	usersRef.child(userName).set(
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
$("#userName").change( function() {

	usersRef.once("value", function(snapshot){
		
		var tempUserName = $("#userName").val();
		console.log("tempUserName:"+tempUserName);
		console.log(snapshot.hasChild(tempUserName));
		if (snapshot.hasChild(tempUserName) ){
			console.log("cityName  : "+JSON.stringify(snapshot.child(tempUserName).val()));
			console.log("cityName"+snapshot.child(tempUserName+"/"+"cityName").val());
  			console.log("category"+snapshot.child(tempUserName+"/"+"category").val());
   			console.log("state"+snapshot.child(tempUserName+"/"+"state").val());
   			$("#city").attr("placeholder",snapshot.child(tempUserName+"/"+"cityName").val());
   			var tempEventId = snapshot.child(tempUserName+"/"+"category").val();
   			$('#eventId option[value='+tempEventId+']').attr("selected","selected");
   			var tempStateId = snapshot.child(tempUserName+"/"+"state").val();
   			$('#statId option[value='+tempStateId+']').attr("selected","selected");

   		//	$("#statId").html(snapshot.child(tempUserName+"/"+"state").val());
		}
	});

});