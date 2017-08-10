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
      console.log(swing.point.x + ' | ' + swing.point.y);
      µ('#track').style.left = (200 + 200 * swing.point.x + 5) + 'px';
      µ('#track').style.top = (200 + 200 * swing.point.y + 5) + 'px';
    }, 50);
    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') swing.calibrate();
    };

  };

  //exports.app.start = ()=> {};

  provide(exports);
});
