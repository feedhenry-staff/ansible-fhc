'use strict';
var fhc = require('fh-fhc');
function createMBaaSTarget(args, cb){
	
  if (!args['environment'] || !args['engagementName'] || ! args['fhMbaasHost'] || !args['url'] || !args['openshiftUsername'] || !args['openshiftPassword'] || !args['routerDNSUrl']){
  	return cb("Missing argument", null);
  }
  var engagementName = args['engagementName'] + "-" + args['environment'];
  fhc.admin.mbaas.read({id: engagementName}, function(err, mbaasRead){
  	if (err){  // If the mbaas does not exist an error is returned from the read call.
	  fhc.admin.mbaas.create(
	  {
	    id: engagementName , 
	    type: 'openshift3', 
	    fhMbaasHost:args['fhMbaasHost'], 
	    provisionMBaaS: true, 
	    type_target: 'openshift3', 
	    url: args['url'], 
	    username: args['openshiftUsername'], 
	    password: args['openshiftPassword'], 
	    routerDNSUrl: args['routerDNSUrl'], 
	    servicekey:""
	  }, function(err, response){
	      if (err){
	        cb(err);
	      } else {
	      	response.changed = true;
	        cb(null, response);
	      }
	  });
  	} else {
  		if (mbaasRead.id == engagementName){
  			cb(null, {id: mbaasRead.id, changed: false});
  		} else {
  			cb(err, null);
  		}
  	}
  });
}
exports.create = createMBaaSTarget;