var proxyquire = require('proxyquire');
var fhc = {
	admin: {
		mbaas: {
			create: function(arguments, cb){

				var response = null,
				err = null;

				
				response = {
		          "owner": "3ttcniemc36vavcfagdfcdxe",
		          "fhMbaasHost": "https://ph-mbaas-test-dev.apps.x.xxxx.net",
		          "url": "https://osm1-x.xxxx.net:8443",
		          "username": arguments.username,
		          "routerDNSUrl": "*.apps.x.xxxx.net",
		          "servicekey": "\"\"",
		          "_id": "test-mbaas",
		          "type": "openshift3",
		          "cacheKey": "ph-mbaas-test-dev-mbaas-openshiftdeploy-1464027416578"
		        }
		    	
				cb(err, response);
			},
			read: function(arguments, cb){
				var response = null,
				err = null;
				if (arguments.id == 'test-duplicate-test') {
					response = {
					  "owner": "3ttcniemc36vavcfagdfcdxe",
					  "fhMbaasHost": "https://projectname.x-x.xxx.net",
					  "url": "https://x-x.xxxx.net:8443",
					  "username": "test",
					  "routerDNSUrl": "*.apps.x.xxxx.net",
					  "servicekey": "a7eb9e1339a313ad9950494f0f70732a8fafddb1cd99e2bb0bd6b62977249063",
					  "id": "test-duplicate-test",
					  "label": "projectName",
					  "_id": "574def78f556ac964339c70a",
					  "editable": true,
					  "type": "openshift3"
					}
				} else {
					err = {"userDetail":"Invalid MBaaS target: projectName","systemDetail":"can not read mbaas_target - 'Invalid MBaaS target: projectNa'","code":"FH-SUPERCORE-ERROR"};
				}
				cb(err, response);
			}
		}
	}
		
}

describe('fh MBaaS calls', function () {
  it('should create MBaaS target ', function (done) {
  	var args = {
        mbaasName: 'projectName',
        fhMbaasHost: 'https://projectName.osm1-x.xxxx.net',
        url: 'https://osm1-x.xxxx.net:8443',
        openshiftUsername: 'user',
        openshiftPassword: 'pass',
        routerDNSUrl: '*.apps.x.xxxx.net',
        environment: 'test'
    }

  	var mbaas = proxyquire('../lib/mbaas.js', {'fh-fhc': fhc});
  	mbaas.create(args, function(err, response){
		response.username.should.equal(args.openshiftUsername);
		response.changed.should.equal(true);
		done();
  	});
  });
  it('should not create MBaaS duplicate target ', function (done) {
  	var args = {
        mbaasName: 'test-duplicate',
        fhMbaasHost: 'https://projectName.osm1-xx.xxxx.net',
        url: 'https://osm1-xx.xxxx.net:8443',
        openshiftUsername: 'user',
        openshiftPassword: 'pass',
        routerDNSUrl: '*.apps.xx.xxxx.net',
        environment: 'test'
    }

  	var mbaas = proxyquire('../lib/mbaas.js', {'fh-fhc': fhc});
  	mbaas.create(args, function(err, response){
		
		response.changed.should.equal(false);
		done();
  	});
  });

   it('should not create MBaaS target missing arguments', function (done) {
  	var args = {}

  	var mbaas = proxyquire('../lib/mbaas.js', {'fh-fhc': fhc});
  	mbaas.create(args, function(err, response){
		
		err.should.equal("Missing argument")
		done();
  	});
  });



});
