'use strict';

var obtains = ['./src/swingSensor.js', 'µ/piFig/piFig.js'];

obtain(obtains, ({ swing }, piFig)=> {
  exports.app = {};

  exports.app.start = ()=> {
    var pollInt = setInterval(()=> {
      swing.idle();
    }, 50);

    var pollInt = setInterval(()=> {
      console.log('new point');
      console.log(swing.point);
    }, 500);
    console.log('started');
  };

  provide(exports);
});
