
var url = "172.20.10.2:8080";
var loginStatus = false;
var userId=0;
var saveImage=null;
var app = {

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

    },


    onDeviceReady: function() {
        this.receivedEvent('deviceready');

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        $.extend({ alert: function (message, title) {
                  $("<div></div>").dialog( {
                    buttons: { "Ok": function () { $(this).dialog("close"); } },
                    close: function (event, ui) { $(this).remove(); },
                    resizable: false,
                    title: title,
                    modal: true
                  }).text(message);
                }
                });

        //start - save registration data to the mongo db
        $( "#signUpBtn" ).click(function( event ) {
            var signUpData = $( "#signUpData" ).serializeArray();

             if($("#fNamesignUpId").val()!="" && $("#mailSignUpId").val()!="" && $("#passwordsignUpId").val()!=""){
                if(validateEmail($("#mailSignUpId").val())){
                    $.post("http://"+url+"/UserSignUp",signUpData, function(data, status){

                        console.log("Sending Data ...");

                        return console.log(status);
                    },'json').done(function() {
                                    alert( "you have created an Account successfully" );
                                    $.mobile.changePage("#signIn");
                                    $("#signUpData")[0].reset();
                              }).fail(function(err) {
                                  // alert('Received Event: ' + JSON.stringify(err, undefined, 4) );
                                   alert( "Registration failed, This email already used" );
                              });
                }else{
                    alert("Please enter valid email address");
                }

             }else{
                alert("All the details should be entered");
             }
        });
        //end - save registration data to the mongo db

        //start - login data handler
        $( "#signInBtn" ).click(function( event ) {
            var signInData = $( "#signInData" ).serializeArray();
            if($("#mailSignUpIn").val()!="" && $("#passwordSignInId").val()!=""){
                $.post("http://"+url+"/signIn",signInData, function(data, status){
                    console.log("Sending Data ...");
                    return console.log(status);
                },'json').done(function(data) {
                                alert( "login Successful" );
                                loginStatus=true;

                                 //alert('Received Event: ' + JSON.stringify(data, undefined, 4) );
                                 userId = data[0].emailSignUpName;
                    window.location.href='#NavigationPage';


                                 $("#signInData")[0].reset();

                          }).fail(function(err) {
                             // alert('Received Event: ' + JSON.stringify(err, undefined, 4) );
                               alert( "login Unsuccessful, try again" );
                          });
            }else{
                alert("Please enter valid Details");
            }

        });
        //end - login data handler


         //start - saveToBuy data handler
        $( "#saveToBuy" ).click(function( event ) {

            var saveToBuy = $( "#addToMlab" ).serializeArray();
            if($("#textinput-hide").val()!="" && $("#textarea").val()!="" && $("#textinput-date").val()!="" && $("#email").val()!=""){
                   saveToBuy.push({name: 'user', value:userId});
                  saveToBuy.push({name: 'archive', value:false});
                  saveToBuy.push({name: 'img', value:saveImage});
                  $.post("http://"+url+"/saveToBuy",saveToBuy, function(data, status){

                    return console.log(status);
                  },'json').done(function(data) {
                                alert( "Successfully added" );
                                $("#addToMlab")[0].reset();
                                $('#myImage').attr('src',"img/load.gif");

                          }).fail(function(err) {
                               // alert('Received Event: ' + JSON.stringify(err, undefined, 4) );
                                 alert( "data upload failed, try again" );
                          });
            }else{
                alert("Please Add Employee details !");
            }


        });
        //end - saveToBuy data handler

         //start - capture data handler
        $( "#capture" ).click(function( event ) {
            var cameraDir = navigator.camera.getPicture(onSuccess, onFail, {
                  quality: 50,
                  destinationType: Camera.DestinationType.DATA_URL,
                  cameraDirection: Camera.Direction.BACK,     // Use the back-facing camera
                  targetWidth:600,
                  targetHeight:800
               });

               function onSuccess(imageData) {
               var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
               width = width-30;
               document.getElementById("myImage").setAttribute("style","width:"+width+"px");
                  var image = document.getElementById('myImage');

                  image.src = "data:image/jpeg;base64," + imageData;
                  saveImage = "data:image/jpeg;base64," + imageData;

               }

               function onFail(message) {
                  alert('Failed because: ' + message);
               }
        });
        //end - capture data handler

            //start - popup data handler
            $( "#signOut" ).click(  function() {

                loginStatus = false;
                userId=0;
                 $.mobile.changePage("#signIn");
            });


    }


};


app.initialize();



$( "#show" ).click(function( event ) {

    if(userId!=0 && loginStatus==true) {

        $.get("http://" + url + "/getToBuy/" + userId, function (data) {
            return console.log(data);
        })
            .done(function (data) {
                $(".toBuyDisplay").remove();
                //alert('Received Event: ' + JSON.stringify(data, undefined, 4) );

                var Email;
                $.each(data, function (i, dataObj) {

                    Email = dataObj.Email;
                    $('#toBuyListView').append(
                        '<li class="toBuyDisplay" id=' + dataObj._id + '><a href="#popupParis"  data-img=' + dataObj.img + ' data-pid=' + dataObj._id + ' class="clickDisplay" data-rel="popup" data-position-to="window" data-transition="fade">' +
                        '<img src="' + dataObj.img + '" class="ui-li-thumb popphoto">' +
                        '<h2>' + dataObj.title + '</h2>' +
                        '<h2>' + dataObj.Date + '</h2>' +
                        '<p>' + dataObj.Email + '</p>' +
                        '<p>' + dataObj.textarea + '</p>' +
                        '</a></li>');
                    $('#toBuyListView').listview('refresh');

                });


                var imgdata;
                var title;
                //start - popup data handler
                $("a.clickDisplay").on("click", function () {


                    imgdata = $(this).data("img");
                    pId = $(this).data("pid");

                    $("#popphoto").attr('src', imgdata);

                });
                //end - popup data handler

                //purchasedBtn
                $("#purchasedBtn").click(function (event) {


                    var Emailform = $("#emailform").serializeArray();


                    Emailform.push({name: 'Email', value: Email});


                    alert("Sending E-mail...Please wait");


                    $.post("http://" + url + "/sendto/", Emailform, function (data) {

                        return console.log(data);


                    }, 'json').done(function (data) {


                        alert("Update as achieved !");


                    });

                    window.location.href = '#NavigationPage';

                });


            });

    }



});


function validateEmail(sEmail) {
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    if (filter.test(sEmail)) {
        return true;
    }
    else {
        return false;
    }
}