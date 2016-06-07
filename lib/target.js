'use strict';
var fhc = require('fh-fhc');
var url = require('url');

function setTarget(target, cb){
    // test current target
    fhc.target({_:[]}, function(err, callResponse){
      var response = {};

      if (url.parse(callResponse).hostname == url.parse(target).hostname){
        cb(null, {target: target, changed:false})
      } else{
        fhc.target( {_:[target]}, function(err, targetResponse){
          if (err){
            // Handle error
            cb(err, null);
          } else {
            response.target = targetResponse
            response.changed = true
            cb(null, response);

          }
        });
      }
    
    })

}

exports.set = setTarget;