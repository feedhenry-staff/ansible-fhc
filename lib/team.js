'use strict';
var fhc = require('fh-fhc');
var utils = require('./utils.js');

function create(args, cb){
  //['admin', 'environments', 'create', '--id='+MBaaSNameEnv, '--label='+MBaaSNameEnv, '--targets='+MBaaSName]
  if (!args['mbaasName']){
  	return cb("Missing argument",null);
  }
  //return cb(args['mbaases']);
  var mbaases = [],
  environments = [];
  if (args['mbaases']){
    mbaases = args['mbaases'].split(",");
  }
  if (args['environments']){
    environments = args['environments'].split(",");
  }
  

  var teamName = args['mbaasName'] + 'developer';
  var teamConfig = {
    "name": teamName,
    "code": teamName,
    "desc": teamName,
    "perms": {
      "cluster/reseller/customer/domain/service":"write",
      "cluster/reseller/customer/domain/project":"write"
    },
    "users": [],
    "business-objects":{
      "cluster/reseller/customer/domain/project":[
        args['projectGuid']
      ],
      "cluster":[
        "sam1-core"
      ],
      "cluster/reseller":[
        "6Oz0VqOQoT5KDG5Fj_0c_DXN"
      ],
      "cluster/reseller/customer":[
        "IlV_eqt_AArFNGB-KSr0oZ9F"
      ],
      "cluster/reseller/customer/domain":[
        "v5cu7xtd7abtig5yyproaozc"
      ],
      "cluster/reseller/customer/domain/admin/environment":
        environments,
      "cluster/reseller/customer/domain/admin":[
        "*"
      ],
      "cluster/reseller/customer/domain/admin/mbaas-target":
        mbaases    }
  }

  //admin.teams.read requires a team guid, which we don't have so we need to read and loop through the list
  listTeams(function(err, teams){
    var matched = false,
    teamId;
    teams.forEach(function(team){
      if (team.name == teamName){
        matched = true;
      }
    });
    if (matched){
      cb(null, {name: teamName, changed:false});
    } else {

      fhc.admin.teams.create({team:JSON.stringify(teamConfig)}, function(err, response){
        if (err){
          // Handle error
          //console.log(err)
          cb(err, null);
        } else {
          //console.log(response)
          response.changed = true;
          cb(null, response);

        }
      });
    }
  });



}

function listTeams(cb){
  fhc.admin.teams.list({}, function(err, teams){
    if (err){
      cb(err,null);
    } else {
      cb(null, teams);
    }
  });
}

function readTeam(args, cb){
  //console.log(args)
  if (!args['teamGuid'] ){
        return cb({err: "Missing argument"}, false);
  } else {
   
    fhc.admin.teams.read({id: args['teamGuid']}, function(err, response){
      
      if (err){
        cb(err)
      } else {
        response.changed = false;
        cb(null, response)
      }

    })
  }
}

function addUser(args, cb){
  if (!args['teamGuid'] || !args['userGuid']){
    return cb("Missing argument", null);
  } else{
    readTeam(args, function(err, team){
      if (err){
        return cb(err,null);
      } else {
        
        if (team.users.indexOf(args['userGuid']) == -1){
          
          fhc.admin.teams.adduser({team:args['teamGuid'], user:args['userGuid'] },function(err, response){
            if (err){
              cb(err, null);
            } else {
              cb(null, {guid: args['userGuid'], changed:true})
            }
          })
        } else {
          cb(null, {guid: userGuid, changed:false})
        }
        
      }
    })
  }

}

exports.addUser = addUser;
exports.read = readTeam;
exports.create = create;
exports.list = listTeams;