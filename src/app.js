'use strict';

var obtains = ['./src/swingSensor.js', 'µ/piFig/piFig.js'];

obtain(obtains, ({ swing }, piFig)=> {
  exports.app = {};

  exports.app.start = ()=> {
    var pollInt = setInterval(()=> {
      //swing.idle();
    }, 50);

    var pollInt = setInterval(()=> {
      console.log('getting units');
      console.log(swing.getUnits(1));
    }, 500);
    console.log('started');
  };

  provide(exports);
});
