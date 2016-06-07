'use strict';
var fhc = require('fh-fhc');
function createEnvironment(args, cb){
  //['admin', 'environments', 'create', '--id='+MBaaSNameEnv, '--label='+MBaaSNameEnv, '--targets='+MBaaSName]
  if (!args['mbaasName'] || !args['environment']){
  	return cb("Missing argument", null);
  }
  var mbaasName = args['mbaasName'] + "-" + args['environment'];
  fhc.admin.environments.read({id: mbaasName}, function(err, envRead){
  	if (err){  // If the environment does not exist an error is returned from the read call.
  	  fhc.admin.environments.create({
  	    id: mbaasName, 
  	    label: mbaasName, 
  	    targets: mbaasName,
  	  }, function(err, response){
  	      if (err){
  	        // Handle error
  	        //console.log(err)
  	        cb(err);
  	      } else {
  	        //console.log(response)
            response.changed = true;
  	        cb(null, response);
  	      }
  	  });
  	} else {
  		//console.log(envRead)
      console.log(envRead.id);
      console.log(mbaasName)
  		if (envRead.id == mbaasName){
        console.log('matched')
  			cb(null, {id: envRead.id, changed:false});
  		} else {
  			cb("Unknown error reading environment", null);
  		}
  	}
  });
}

exports.create = createEnvironment;