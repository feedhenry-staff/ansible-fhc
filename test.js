#!/usr/local/bin/node
var environment = require('./lib/environment.js');
var init = require('./lib/init.js');
var login = require('./lib/login.js');
var mbaas = require('./lib/mbaas.js');
var project = require('./lib/project.js');
var target = require('./lib/target.js');
var team = require('./lib/team.js');
var user = require('./lib/user.js');
fs = require('fs');
var ansiblefhc = require('./index.js');
var args = process.argv
const argsReg = /(\b\w+)=(.*?(?=\s\w+=|$))/g;
var formattedArgs = {},
action,
data = "";
args.forEach(function(arg){
  data += arg + " ";

})
console.log(data);
if (data){
  while((matching = argsReg.exec(data)) != null) {
    formattedArgs[matching[1]] = matching[2];
  }
}
action = formattedArgs['action'];

init.fhLoad(function(err, success){
      if (err ){
        finish({err: err});
      } else {
        // perform the action (first argument passed)
        processAction(action, formattedArgs, finish);
      }
    });



function finish(output, changed ){
  if (!changed){
    changed = false;
  }
  try {
    var stringOutput = JSON.stringify({changed:changed, output})
    console.log(stringOutput);
  }
  catch(err){
    console.log({err: err});
  }
  
}



function processAction(action, args, finish){
  //finish(args)
  console.log(args)
  if (action == 'target'){
    target.set(args['target'], finish);
  }
  else if (action == 'login'){
    login.doLogin(args['username'], args['password'], finish);
  }
  else if (action == 'createMBaaSTarget'){
    mbaas.create(args, finish);
  }
  else if (action == 'createEnvironment'){
    environment.create(args, finish);
  }
  else if (action == 'createTeam'){
    team.create(args, finish);
  }
  else if (action == 'readTeam'){
    team.read(args, finish);
  }
  else if (action == 'createProject'){
    project.create(args, finish);
  }
  else if (action == 'createUser'){
    user.create(args, finish);
  }
  else if (action == 'addUserToTeam'){
    team.addUser(args, finish);
  }
  else {
    finish({err: 'unknown action'}, false);
  }
}

