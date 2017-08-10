'use strict';

var obtains = ['./src/swingSensor.js', 'µ/piFig/piFig.js'];

obtain(obtains, ({ swing }, piFig)=> {
  exports.app = {};

  console.log('here');

  /*setInterval(()=> {
    console.log(swing.point.x + ' | ' + swing.point.y);
  }, 500);*/

  exports.app.start = ()=> {
    var pollInt = setInterval(()=> {
      swing.point.x;
    }, 1000);
    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') swing.calibrate();
    };

  };

  //exports.app.start = ()=> {};

  provide(exports);
});
