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
		//console.log(response)
		cb(null, response);
	}
}

describe('fh target calls', function () {
  it('should not change target ', function (done) {
  	var target = proxyquire('../lib/target.js', {'fh-fhc': fhc});
  	target.set('https://target.xxxx.com', function(err, response){
		response.target.should.equal('https://target.xxxx.com');
		response.changed.should.equal(false);
		done();
  	});
  });
  it('should change target ', function (done) {
    var target = proxyquire('../lib/target.js', {'fh-fhc': fhc});
    target.set('https://newtarget.xxxx.com', function(err, response){
    response.target.should.equal('https://newtarget.xxxx.com');
    response.changed.should.equal(true);
    done();
    });
  });

});
