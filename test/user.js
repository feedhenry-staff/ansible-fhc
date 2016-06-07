var proxyquire = require('proxyquire');
var usersArray = [
              {
                "fields": {
                  "activated": true,
                  "blacklisted": false,
                  "businessObject": "cluster/reseller/user",
                  "defaultDomain": "",
                  "email": "exist@example.com",
                  "enabled": true,
                  "lastLogin": "2016-06-07 18:05:38",
                  "name": "",
                  "parentEntity": "ResellerImpl:ppx5i4eyekwpgfxblg6ur64m:FeedHenry Test Reseller",
                  "prefs": {
                    "accountType": "enterprise",
                    "studio.version": "beta",
                    "viewType": "grid"
                  },
                  "reseller": "ppx5i4eyekwpgfxblg6ur64m",
                  "subscriber": "3ttcniemc36vavcfagdfcdxe",
                  "sysCreated": "2016-03-18 10:49:02:701",
                  "sysGroupFlags": 31,
                  "sysGroupList": "",
                  "sysModified": "2016-06-07 18:05:38:071",
                  "sysShardPoint": 631641622,
                  "sysVersion": 852,
                  "tenant": "",
                  "username": "exist@example.com"
                },
                "guid": "ewtbmfr74wiwfdahpr3sa23i",
                "type": "ten_User"
              },
              {
                "fields": {
                  "activated": true,
                  "blacklisted": false,
                  "businessObject": "cluster/reseller/user",
                  "defaultDomain": "",
                  "email": "yyyyy@example.com",
                  "enabled": true,
                  "lastLogin": "",
                  "name": "",
                  "parentEntity": "ResellerImpl:ppx5i4eyekwpgfxblg6ur64m:FeedHenry Test Reseller",
                  "prefs": {
                    "accountType": "enterprise"
                  },
                  "reseller": "ppx5i4eyekwpgfxblg6ur64m",
                  "subscriber": "cxsvoh2xbkvfliv5uw7wo7pz",
                  "sysCreated": "2016-03-18 10:49:05:628",
                  "sysGroupFlags": 31,
                  "sysGroupList": "",
                  "sysModified": "2016-03-18 10:49:05:637",
                  "sysShardPoint": 2615851049,
                  "sysVersion": 0,
                  "tenant": "",
                  "username": "yyyyy@example.com"
                },
                "guid": "tpvlqkpqw5xe2x66ebhhblwe",
                "type": "ten_User"
              }
            ];

var fhc = {
	'admin-users': {
    list: function(cb){
     
      var users = {
        "count": usersArray.length,
        "list": usersArray
      }
      cb(null, users)
    },
    create: function(datas, cb){
      //['username='+username, 'email='+username, 'invite=true' ]
      const argsReg = /(\b\w+)=(.*?(?=\s\w+=|$))/g;
      var args = {};
      var matching;
      datas.forEach(function(data){
        while((matching = argsReg.exec(data)) != null) {
          args[matching[1]] = matching[2];
        }       
      })

      //console.log(args)
      usersArray.push({fields: {username: args['username']}, guid: 'testGuid'})
      cb(null,{fields: {username: args[0]}} )
    }
  }
}

describe('fh user calls', function () {
  it('should create user', function (done) {
    var args = [];
    args['username'] = 'newUser@example.com';
  	var user = proxyquire('../lib/user.js', {'fh-fhc': fhc});
  	user.create(args , function(err, response){
    response.guid.should.equal('testGuid');
    response.changed.should.equal(true);
		done();
  	});
  });
  it('should not create duplicate user', function (done) {
    var args = [];
    args['username'] = 'exist@example.com';
    var user = proxyquire('../lib/user.js', {'fh-fhc': fhc});
    user.create(args , function(err, response){
    response.guid.should.equal('ewtbmfr74wiwfdahpr3sa23i');
    response.changed.should.equal(false);
    done();
    });
  });
  it('should not create user missing argument', function (done) {
    var args = [];
    
    var user = proxyquire('../lib/user.js', {'fh-fhc': fhc});
    user.create(args , function(err, response){
    err.should.equal('Missing argument');
    
    done();
    });
  })
});
