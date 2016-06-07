'use strict';
var fhc = require('fh-fhc');

function doLogin(username, password, cb){
	//console.log(fhc);
	fhc.user({},function(err, currentUser){
		var changed = true;
		//console.log(currentUser);
		if (currentUser && currentUser.displayName == username){
			changed = false;
		}
		fhc.login( {_:[username,password]}, function(err, response){
 			if (err){
 				cb(err, null)
 			}
      		if (response && response.result == 'ok'){
      			response.changed = changed;
      			cb(null, response);
      		} else {
      			
      			cb(response);
      		}
      
    	});
	})

}


exports.doLogin = doLogin;