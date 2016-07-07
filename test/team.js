


var proxyquire = require('proxyquire');

var project = {
	getProjectByName: function(projectName,cb){
		if (projectName == 'newProject'){
			cb(null, {guid:'newProjectGuid'});
		} else {
			cb(null, {guid:'existingProjectGuid'});
		}
		
	}


}
var fhc = {
	admin: {
		teams: {
			create: function(arguments, cb){

				var response = null,
				err = null;
				
				cb(err, JSON.parse(arguments.team));
			},
			list: function(arguments, cb){
				var response = null,
				err = null;
				
				  response = [

				  	{ _id: '56ebe602f5f3d4424c7e2b98',
					  code: 'default-ppx5i4eyekwpgfxblg6ur64m-owner',
					  created: '1458300418187',
					  desc: 'A team that gives users access only to the things they create',
					  name: 'Owner Only (FeedHenry Test Reseller reseller)',            
					  'business-objects': {
					  	'cluster': 'cluster',
            			'cluster/reseller' : 'reseller',
            			'cluster/reseller/customer' : 'customer',
            			'cluster/reseller/customer/domain' : 'domain'
            			}

					},
					{ _id: '56ebe602f5f3d4424c7e2b34',
					  code: 'default-ppx5i4eyekwpgfxblg634534m-owner',
					  created: '1458300418187',
					  desc: 'A team that gives users access only to the things they create',
					  name: 'testTeamdeveloper',
					  'business-objects':
					   { 
					   	"cluster/reseller/customer/domain/project": ['existingProjectGuid'],	
					   	'cluster/reseller/customer/domain/admin/mbaas-target': [ 'testTeam-existingMbaaS' ],
					     'cluster/reseller/customer/domain/admin': [ '*' ],
					     'cluster/reseller/customer/domain/admin/environment': [ 'existingEnvironment' ],
					     'cluster/reseller/customer/domain': [ 'v5cu7xtd7abtig5yyproaozc' ],
					     'cluster/reseller/customer': [ 'IlV_eqt_AArFNGB-KSr0oZ9F' ],
					     'cluster/reseller': [ 'ppx5i4eyekwpgfxblg6ur64m' ],
					     cluster: [ 'grdryn3-single' ]},
					  users: [],
					  perms:
					   { 'cluster/reseller/customer/domain/project': 'write',
					     'cluster/reseller/customer/domain/service': 'write' }
					}
				  ]
				
				cb(err, response);
			}
		}
	}
		
}

describe('fh team calls', function () {
  it('should create team ', function (done) {
  	var args = {
        engagementName: 'projectName',
        type: 'developer',
        name: 'developer'
        
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc});
  	team.create(args, function(err, response){
 
		response.name.should.equal(args.engagementName+'developer');
		response.changed.should.equal(true);
		done();
  	});
  });
  it('should not create duplicate team ', function (done) {
  	var args = {
        engagementName: 'testTeam',
        type: 'developer',
        name: 'developer'
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc});
  	team.create(args, function(err, response){
		
		response.changed.should.equal(false);
		done();
  	});
  });

  it('should not create team missing arguments', function (done) {
  	var args = {}

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc});
  	team.create(args, function(err, response){
		
		err.should.equal("Missing argument");
		done();
  	});
  });
  it('should add project to team', function (done) {
  	var args = {
        engagementName: 'testTeam',
        teamName: 'developer',
        updateType: 'project',
        newValue: 'newProject'
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc, './project.js': project});
  	team.update(args, function(err, response){
		response.changed.should.equal(true);
		done();
  	});
  });
  it('should not add project to team', function (done) {
  	var args = {
        engagementName: 'testTeam',
        teamName: 'developer',
        updateType: 'project',
        newValue: 'existingProject'
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc, './project.js': project});
  	team.update(args, function(err, response){
		response.changed.should.equal(false);
		done();
  	});
  });
  it('should add mbaas to team', function (done) {
  	var args = {
        engagementName: 'testTeam',
        teamName: 'developer',
        updateType: 'mbaas',
        newValue: 'newMbaaS',
        teamType: 'developer',
        isLive: 0
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc, './project.js': project});
  	team.update(args, function(err, response){
		response.changed.should.equal(true);
		done();
  	});
  });
  it('should not add mbaas to team isLive', function (done) {
  	var args = {
        engagementName: 'testTeam',
        teamName: 'developer',
        updateType: 'mbaas',
        newValue: 'newMbaaS',
        teamType: 'developer',
        isLive: 1
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc, './project.js': project});
  	team.update(args, function(err, response){
		response.changed.should.equal(false);
		done();
  	});
  });
  it('should not add mbaas to team existing', function (done) {
  	var args = {
        engagementName: 'testTeam',
        teamName: 'developer',
        updateType: 'mbaas',
        newValue: 'existingMbaaS',
        teamType: 'developer',
        isLive: 0
    }

  	var team = proxyquire('../lib/team.js', {'fh-fhc': fhc, './project.js': project});
  	team.update(args, function(err, response){
		response.changed.should.equal(false);
		done();
  	});
  });

});
