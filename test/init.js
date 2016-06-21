var proxyquire = require('proxyquire');
var fs = {
  //fs.readFile(process.argv[2], 'utf8', function (err,data) {  
    readFile: function(filename, format, cb){
      if (filename == 'path/to/filename'){
        cb(null, "action=createProject projectName=projectNameproject2 stringWithSpaces='this is a string with spaces'")
      } else if (filename == 'path/to/invalid/file'){
        cb('Error reading file', null);
      }
      else {
        cb(null, null);
      }
      
    }
}

describe('Init calls', function () {
  it('should convert string to array of key pairs', function (done) {
    process.argv[2] = 'path/to/filename';
  	var init = proxyquire('../lib/init.js', {'fs': fs});
  	init.getArgs( function(err, args){
		args.action.should.equal('createProject');
    args.projectName.should.equal('projectNameproject2');
    args.stringWithSpaces.should.equal('this is a string with spaces');
		// response.changed.should.equal(true);
		done();
  	});
  });
  it('should return empty array', function (done) {
    process.argv[2] = '';
    var init = proxyquire('../lib/init.js', {'fs': fs});
    init.getArgs( function(err, args){
    args.length.should.equal(0);
    done();
    });
  });
  it('should return error', function (done) {
    process.argv[2] = 'path/to/invalid/file';
    var init = proxyquire('../lib/init.js', {'fs': fs});
    init.getArgs( function(err, args){
    err.should.equal('Unable to load arguments');
    done();
    });
  });

});
