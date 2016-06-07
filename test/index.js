var proxyquire = require('proxyquire');
var environment = {
	create: function(args, cb){
		cb(null,  { __v: 0,
		  created: '2016-06-01T17:56:35.732Z',
		  modified: '2016-06-01T17:56:35.732Z',
		  target: 'projectName',
		  order: 2,
		  domain: 'testing',
		  owner: '3ttcniemc36vavcfagdfcdxe',
		  label: 'projectName',
		  id: 'projectName',
		  _id: '574f21d3b04bb86658e45ec1',
		  enabled: true ,
		  changed: false
		})
	}
}

var target = {
	set: function(target, cb){
		cb(null, {target: target, changed: false})
	}
}

var team = {
	create: function(args, cb){
		cb(null,{ name: 'projectNamedeveloper',
		  code: 'projectNamedeveloper',
		  desc: 'projectNamedeveloper',
		  created: '1464806205725',
		  updated: '1464806205725',
		  _id: '574f2b3db027cfee3aa5d003',
		  bosLabel: 'default',
		  'business-objects':
		   { 'cluster/reseller/customer/domain/admin/mbaas-target': [ 'ph-mbaas' ],
		     'cluster/reseller/customer/domain/admin': [ '*' ],
		     'cluster/reseller/customer/domain/admin/environment': [ 'ph-mbaas' ],
		     'cluster/reseller/customer/domain': [ 'v5cu7xtd7abtig5yyproaozc' ],
		     'cluster/reseller/customer': [ 'IlV_eqt_AArFNGB-KSr0oZ9F' ],
		     'cluster/reseller': [ 'ppx5i4eyekwpgfxblg6ur64m' ],
		     cluster: [ 'grdryn3-single' ],
		     'cluster/reseller/customer/domain/project': [] },
		  users: [],
		  perms:
		   { 'cluster/reseller/customer/domain/project': 'write',
		     'cluster/reseller/customer/domain/service': 'write' },
		  defaultTeam: false ,
		  changed: false
		});
	}
}

var login = {
	set: function(username, password, cb){
		cb(null, { 
			csrf: 'b1a9dc5c430f3597f43bb4050a70632c',
  			domain: 'test',
  			login: 'rz7zhdvy44fwvz4mbbx3hm3c',
  			responses: { 
  				local: { 
  					status: 'ok' 
  				} 
  			},
  			result: 'ok',
  			sub: '3ttcniemc36vavcfagdfcdxe',
  			timestamp: 1464784789898,
  			user: 'ewtbmfr74wiwfdahpr3sa23i',
  			changed: true
		})
	}
}

var mbaas = {
	create: function(args, cb){
		cb({
          "owner": "3ttcniemc36vavcfagdfcdxe",
          "fhMbaasHost": "https://ph-mbaas-test-dev.apps.x.xxxx.net",
          "url": "https://osm1-x.xxxx.net:8443",
          "username": arguments.username,
          "routerDNSUrl": "*.apps.x.xxxx.net",
          "servicekey": "\"\"",
          "_id": "test-mbaas",
          "type": "openshift3",
          "cacheKey": "ph-mbaas-test-dev-mbaas-openshiftdeploy-1464027416578"
        }, true)
	}
}


var project = {
	create: function(args, cb){
		cb({guid: 'projectGuid'}, false)
	}
}

var user = {
	create: function(args, cb){
		cb({guid: 'userGuid'}, false)
	}
}


describe('index calls', function () {
  it('should make call to target ', function (done) {
  	var index = proxyquire('../index.js', {
  		'./lib/environment.js': environment, 
  		'./lib/target.js': target,
  		'./lib/team.js': team,
  		'./lib/login.js': login,
  		'./lib/mbaas.js': mbaas,
  		'./lib/project.js': project,
  		'./lib/user.js': user
  	});
  	var args = [];
  	args['target'] = 'http://testurl.com';
  	index.process('target', args, function(err, response){
		response.target.should.equal(args['target']);
		response.changed.should.equal(false);
		done();
  	});
  });
   it('should not match action', function (done) {
  	var index = proxyquire('../index.js', {
  		'./lib/environment.js': environment, 
  		'./lib/target.js': target,
  		'./lib/team.js': team,
  		'./lib/login.js': login,
  		'./lib/mbaas.js': mbaas,
  		'./lib/project.js': project,
  		'./lib/user.js': user
  	});
  	var args = [];
  	
  	index.process('unsupported', args, function(response, changed){
		changed.should.equal(false);
		done();
  	});
  });
  

});
