'use strict';
var fhc = require('fh-fhc');

function createProject(args, cb){
  //'fhc', ['projects', 'create' ,'projectName'],
  if (!args['projectName']){
  	return cb({err: "Missing argument"}, false);
  }
  var projectName = args['projectName'];
  fhc.projects({_:[]}, function(err, projects){
  	var matched = false;
  	var guid;
	projects.forEach(function(project){
      if (project.title == projectName){
        matched = true;
        guid = project.guid;
      }
    });
    if (matched){
      cb(null, {response:{guid: guid}, changed: false});
    } else {

      fhc.projects({_:['create', projectName, 'hello_world_project']}, function(err, response){
        if (err){
          // Handle error
          //console.log(err)
          cb(err, null);
        } else {
          console.log(response)
          cb(null, {response:{guid: response.guid}, changed: true});

        }
      });
    }

  });



}

exports.create = createProject;