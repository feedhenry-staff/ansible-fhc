'use strict';
var fhc = require('fh-fhc');
function createEnvironment(args, cb){
  //['admin', 'environments', 'create', '--id='+engagementNameEnv, '--label='+engagementNameEnv, '--targets='+engagementName]
  if (!args['engagementName'] || !args['environment']){
  	return cb("Missing argument", null);
  }
  var engagementName = args['engagementName'] + "-" + args['environment'];
  fhc.admin.environments.read({id: engagementName}, function(err, envRead){
  	if (err){  // If the environment does not exist an error is returned from the read call.
  	  fhc.admin.environments.create({
  	    id: engagementName, 
  	    label: engagementName, 
  	    targets: engagementName,
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
      
  		if (envRead.id == engagementName){
      
  			cb(null, {id: envRead.id, changed:false});
  		} else {
  			cb("Unknown error reading environment", null);
  		}
  	}
  });
}

exports.create = createEnvironment;