'use strict';
var fhc = require('fh-fhc');
var utils = require('./utils.js');
var user = require('./user.js');


//TODO replace the reseller, customer, and domain guids.

// fhc.user({},function(err, data){
//   console.log(data);
//   cb(null, true)
// })
function create(args, cb){
  //['admin', 'environments', 'create', '--id='+MBaaSNameEnv, '--label='+MBaaSNameEnv, '--targets='+MBaaSName]
  if (!args['mbaasName'] || !args['type'] || !args['projectGuid']){
  	return cb("Missing argument",null);
  }
  var mbaases = [],
  environment_permissions = [];
  if (args['environment_permissions']){
    environment_permissions = args['environment_permissions'].split(",");
  }
  environment_permissions.forEach(function(environment){
    mbaases.push(args['mbaasName'] + '-' + environment);
  })
  var teamName = args['mbaasName'] + args['type'];


  //admin.teams.read requires a team guid, which we don't have so we need to read and loop through the list
  listTeams(function(err, teams){
    var matched = false,
    teamId;
    var existingTeam = teams[0]; // take the first team returned as an existing team and use this for cluster info
    teams.forEach(function(team){

      if (team.name == teamName){
        matched = true;
      }
    });
    if (matched){
      cb(null, {name: teamName, changed:false});
    } else {
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
            "cluster": existingTeam['business-objects']['cluster'],
            "cluster/reseller": existingTeam['business-objects']['cluster/reseller'],
            "cluster/reseller/customer": existingTeam['business-objects']['cluster/reseller/customer'],
            "cluster/reseller/customer/domain": existingTeam['business-objects']['cluster/reseller/customer']['domain'],
            "cluster/reseller/customer/domain/admin/environment":
              mbaases,
            "cluster/reseller/customer/domain/admin":[
              "*"
            ],
            "cluster/reseller/customer/domain/admin/mbaas-target":
              mbaases    }
        }
      fhc.admin.teams.create({team:JSON.stringify(teamConfig)}, function(err, response){
        if (err){
          cb(err, null);
        } else {
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

function readTeam(guid, cb){
  if (guid ){
        return cb({err: "Missing argument"}, false);
  } else {
    fhc.admin.teams.read({id: guid}, function(err, response){
      if (err){
        cb(err)
      } else {
        response.changed = false;
        cb(null, response)
      }
    });
  }
}

function getTeamByName(name, cb){
  var matchedTeam;
  listTeams(function(err, teams){
    if (err){
      cb(err, null)
    } else {

      teams.forEach(function(team){
        if (team.name == name){
          matchedTeam = team;
        }
      }); 
      if (matchedTeam){
        cb(null, matchedTeam)
      } else {
        cb("Team not found", null)
      } 
    }
  })
}

function addUser(args, cb){
  if (!args['teamName'] || !args['username'] || !args['mbaasName'] ){
    return cb("Missing argument", null);
  } else{
    getTeamByName(args['mbaasName'] + args['teamName'], function(err, team){
      if (err){
        cb(err, null)
      } else {
        user.getByName(args['username'], function(err, user){
          if (err){
            cb(err, null)
          } else {
            //console.log(team)
            if (team.users.indexOf(user.guid) == -1){
              
              fhc.admin.teams.adduser({team:team._id, user:user.guid },function(err, response){
                if (err){
                  cb(err, null);
                } else {
                  cb(null, {guid: user.guid, changed:true})
                }
              })
            } else {
              //console.log('match')
              cb(null, {guid: user.guid, changed:false})
            }
          }
        });       
      }
    });
  }
}

var developerPerms = {
      "cluster/reseller/customer/domain/service":"write",
      "cluster/reseller/customer/domain/project":"write"
    };

var businessPerms = {
  "cluster/reseller/customer/domain/analytics":"write",
  "cluster/reseller/customer/domain/project":"write",
  "cluster/reseller/customer/domain/project/service":"none",
  "cluster/reseller/customer/domain/project/cloud-resources":"none",
  "cluster/reseller/customer/domain/project/connection":"none",
  "cluster/reseller/customer/domain/project/lifecycle":"none",
  "cluster/reseller/customer/domain/project/client-apps/documentation":"none",
  "cluster/reseller/customer/domain/project/client-apps/cloud-deployment":"none",
  "cluster/reseller/customer/domain/project/client-apps/source-code":"none",
  "cluster/reseller/customer/domain/project/client-apps/push-notifications":"none",
  "cluster/reseller/customer/domain/project/client-apps/credentials":"none",
  "cluster/reseller/customer/domain/project/client-apps/configuration":"none",
  "cluster/reseller/customer/domain/project/client-apps/endpoint":"none",
  "cluster/reseller/customer/domain/project/client-apps/environment-variable":"none",
  "cluster/reseller/customer/domain/project/client-apps/data-browser":"none",
  "cluster/reseller/customer/domain/project/client-apps/event-log":"none",
  "cluster/reseller/customer/domain/project/client-apps/notification":"none",
  "cluster/reseller/customer/domain/project/client-apps/notification-log":"none",
  "cluster/reseller/customer/domain/project/client-apps/api-key":"none",
  "cluster/reseller/customer/domain/project/client-apps/log":"none",
  "cluster/reseller/customer/domain/project/cloud-apps":"write",
  "cluster/reseller/customer/domain/project/cloud-apps/documentation":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/source-code":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/analytics":"write",
  "cluster/reseller/customer/domain/project/cloud-apps/endpoint":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/environment-variable":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/data-browser":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/cloud-deployment":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/event-log":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/notification":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/notification-log":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/api-key":"none",
  "cluster/reseller/customer/domain/project/cloud-apps/log":"none"};

exports.addUser = addUser;
exports.read = readTeam;
exports.create = create;
exports.list = listTeams;