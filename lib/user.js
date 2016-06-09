'use strict';
var fhc = require('fh-fhc');

function createUser(args, cb){
  //'fhc', ['projects', 'create' ,'projectName'],
  //console.log(args)
  if (!args['username'] || !args['email'] ){
  	return cb("Missing argument");
  }
  var username = args['username'];
  var email = args['email'];
  var team = args['team'];
  //console.log(fhc);
  listUsers(function(err, users){
  	var matched = false;
  	var guid;
    //console.log(users)
	  users.list.forEach(function(user){
      if (user.fields.username == username){
        //console.log(user)
        matched = true;
        guid = user.guid;
      }
    });
    if (matched){
      cb(null, {guid: guid, team: team, changed:false});
    } else {
      fhc['admin-users'].create(['username='+username, 'email='+email, 'invite=true' ], function(err, response){
        if (err){
          // Handle error
          //console.log(err)
          cb(err, null);
        } else {
          //console.log(response)
          //Have to list users again to find the guid to return.
          fhc['admin-users'].list(function(err, users){
            var matched = false;
            var guid;
            users.list.forEach(function(user){
              if (user.fields.username == username){
                guid = user.guid;
              }
            });

            cb(null, {guid:guid, team:team, changed: true});
          });

        }
      });
    }

  });



}

function getByName(username, cb){
  var matchedUser;
  listUsers(function(err, users){
    if (err){
      cb(err, null);
    } else {
      users.list.forEach(function(user){
        if (user.fields.username == username){
          matchedUser = user
        }
      });
      if (matchedUser){
        cb(null, matchedUser)
      } else {
        cb("user not found", null);
      }
      
    }
  })
}

function listUsers(cb){
  fhc['admin-users'].list(function(err, users){
    if (err){
      cb (err, null)
    } else {
      cb(null, users)
    }
    
  });
}
exports.getByName = getByName;
exports.create = createUser;