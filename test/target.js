var proxyquire = require('proxyquire');
var fhc = {
	target: function(arguments, cb){
		var response;
		var target = arguments._[0];
		
		if (!target) {
			response = 'https://target.xxxx.com'
		} else if (target) {
			response = target;
		}
		cb(null, response);
	}
}

describe('fh target calls', function () {
  it('should not change target ', function (done) {
  	var target = proxyquire('../lib/target.js', {'fh-fhc': fhc});
  	target.set('https://target.xxxx.com', function(response, changed){
		response.target.should.equal('https://target.xxxx.com');
		changed.should.equal(false);
		done();
  	});
  });
  it('should change target ', function (done) {
    var target = proxyquire('../lib/target.js', {'fh-fhc': fhc});
    target.set('https://newtarget.xxxx.com', function(response, changed){
    response.target.should.equal('https://newtarget.xxxx.com');
    changed.should.equal(true);
    done();
    });
  });

});
