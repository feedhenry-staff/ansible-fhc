'use strict';
var fhc = require('fh-fhc');
var utils = require('./utils.js');
var user = require('./user.js');
var project = require('./project.js');


function update(args, cb){
  if (!args['teamName'] || !args['updateType'] || !args['engagementName'] || !args['newValue'] ){
    return cb("Missing argument", null);
  } else{
    getTeamByName(args['engagementName'] + args['teamName'], function(err, team){
      if (err){
        return cb(err, null);
      } else if (args['isLive'] == 1 && args['teamType'] !== 'operations'){
        team.changed = false;
        return cb(null, team)
      } else {

        getItemGuid(args['updateType'], args['newValue'], function(err, guid){
          var key;
          if (err){
            cb(err, null)
          } else {
            switch (args['updateType']){
              case 'project':
                key = 'cluster/reseller/customer/domain/project';
                break;
              case 'mbaas':
                key = 'cluster/reseller/customer/domain/admin/mbaas-target';
                guid = args['engagementName'] + "-" + guid;
                break;
              case 'environment':
                key = 'cluster/reseller/customer/domain/admin/environment';
                guid = args['engagementName'] + "-" + guid;
                break;
              default:
                return cb('unknown update type', null)
            }
            if (isInBussinessObject(team, key, guid)){
              team.changed = false;
              return cb(null, team)
            } else {
              updateBusinessObject(team, key, guid);
              fhc.admin.teams.create({team:JSON.stringify(team)}, function(err, response){
                if (err){
                  cb(err, null);
                } else {
                  response.changed = true;
                  cb(null, response);

                }
              });
            }
          }
        })
        
      }
    });


  }
}

function getItemGuid(type, value, cb){
    // only project updates require a lookup to get the guid.
    if (type == 'project'){ 
      project.getProjectByName(value, function(err, project){
        if (err){
          cb(err, null)
        } else if(!project.guid){
          cb('Project guid not found', null)

        } else {
          cb(null, project.guid);
        }

      });
    } else {
      // all other update types just return their value
      cb(null, value);
    }
}

function isInBussinessObject(team, key, value){

  if (team['business-objects'][key].indexOf(value) !== -1){
    return true;
  } else {
    return false;
  }

}

function updateBusinessObject(team, key, value){

  team['business-objects'][key].push(value);
  return team;

}
function create(args, cb){
  //['admin', 'environments', 'create', '--id='+engagementNameEnv, '--label='+engagementNameEnv, '--targets='+engagementName]
  if (!args['engagementName'] || !args['name'] || !args['type'] ){
  	return cb("Missing argument",null);
  }

  var teamName = args['engagementName'] + args['name'];


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
          "perms": getPerms(args['type']),
          "users": [],
          "business-objects":{

            "cluster/reseller/customer/domain/project":[],
            "cluster": existingTeam['business-objects']['cluster'],
            "cluster/reseller": existingTeam['business-objects']['cluster/reseller'],
            "cluster/reseller/customer": existingTeam['business-objects']['cluster/reseller/customer'],
            "cluster/reseller/customer/domain": existingTeam['business-objects']['cluster/reseller/customer/domain'],
            "cluster/reseller/customer/domain/admin/environment":
              [],
            "cluster/reseller/customer/domain/admin":[
              "*"
            ],
            "cluster/reseller/customer/domain/admin/mbaas-target":
              []    }
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
  if (!args['teamName'] || !args['username'] || !args['engagementName'] ){
    return cb("Missing argument", null);
  } else{
    getTeamByName(args['engagementName'] + args['teamName'], function(err, team){
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

function getPerms(type){
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
    "cluster/reseller/customer/domain/project/cloud-apps/log":"none"
  };
  switch(type){
    case 'developer':
    case 'operations':
      return developerPerms;
    case 'business':
      return businessPerms;
    default:
      return {};

  }
}



exports.addUser = addUser;
exports.read = readTeam;
exports.create = create;
exports.list = listTeams;
exports.update= update;