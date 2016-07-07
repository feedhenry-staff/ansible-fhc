var environment = require('./lib/environment.js');
var init = require('./lib/init.js');
var login = require('./lib/login.js');
var mbaas = require('./lib/mbaas.js');
var project = require('./lib/project.js');
var target = require('./lib/target.js');
var team = require('./lib/team.js');
var user = require('./lib/user.js');

exports.user = user;
exports.environment = environment;
exports.init = init;
exports.login = login;
exports.mbaas = mbaas;
exports.project = project;
exports.target = target;
exports.team = team;
exports.user = user;

exports.process = function(action, args, finish){
  //finish(args)
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
  else if (action == 'getGitUrl'){
    project.getGitUrl(args, finish);
  }
  else if (action == 'getAppGuid'){
    project.getAppGuid(args, finish);
  }
  else if (action == 'createUser'){
    user.create(args, finish);
  }
  else if (action == 'addUserToTeam'){
  	team.addUser(args, finish);
  }
  else if (action == 'updateTeam'){
    team.update(args, finish);
  }
  else {
  	finish({err: 'unknown action'}, false);
  }
}
