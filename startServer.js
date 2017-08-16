
global.provide = ()=> {};

global.obtain = (addr, func)=> {
  var _this = this;

  //addr.replace('µ', './common/src/muse/');
  var objs = [];
  if (addr.length <= 0) func();
  else {
    addr.forEach(function(adr, ind, arr) {
      objs[ind] = require(adr.replace('µ', './common/src/muse/'));
    });

    func.apply(null, objs);
  };

};

//require('./common/src/muse/SerialElectron.js');
obtain(['./local/src/server/express.js'], ({ fileServer })=> {
  
});
