'use strict';
var fhc = require('fh-fhc');

function createProject(args, cb){
  //'fhc', ['projects', 'create' ,'projectName'],
  if (!args['projectName']){
  	return cb({err: "Missing argument"}, false);
  }
  var projectName = args['projectName'];
  getProjectByName(projectName, function(err, project){
    if (err){
      return cb({err: err}, false);
    }
    if (project){
      cb(null, {response:{guid: project.guid}, changed: false});
    } else {
      fhc.projects({_:['create', projectName, 'hello_world_project']}, function(err, response){
        if (err){
          // Handle error
          //console.log(err)
          cb(err, null);
        } else {
          //console.log(response)
          cb(null, {response:{guid: response.guid}, changed: true});

        }
      });
    }
  });

}

function getProjectByName(projectName, cb){
  if (!projectName){
    return cb({err: "Missing argument"}, null);
  }
  
  fhc.projects({_:[]}, function(err, projects){
    var matched = false;
    var projectMatch;
    projects.forEach(function(project){
      if (project.title == projectName){
        matched = true;
        projectMatch = project;
      }
    });
    if (matched){
      cb(null, projectMatch);
    } else {

      cb(null, false);
    }

  });


}

function getGitUrl(args, cb){
  if (!args['projectName'] || !args['appType']){
    return cb({err: "Missing argument"}, false);
  }
  var projectName = args['projectName'];
  var appType = args['appType'];
  getProjectByName(projectName, function(err, project){
    var gitUrl;
    if (err){
      return cb({err: err}, null)
    } 
    if (project){
      project.apps.forEach(function(app){
        if (app.type == appType){

          gitUrl = app.scmUrl;
        }
      });
      if (gitUrl){
        cb(null, {response:{gitUrl: gitUrl}, changed: false})
      } else{ 
        return cb({err: 'App type not found'}, null);
      }

    } else {
      return cb({err: 'Project not found'}, null);
    }
  })

}

exports.create = createProject;
exports.getGitUrl = getGitUrl;