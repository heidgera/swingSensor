'use strict';

var obtains = ['hx711', 'µ/piFig/piFig.js'];

obtain(obtains, (HX711, piFig)=> {
  exports.app = {};

  console.log('here');

  var cell = new HX711(17, 18);

  //cell.begin(500);

  setInterval(()=> {
    console.log(cell.read());
  }, 500);

  /*exports.app.start = ()=> {
    var pollInt = setInterval(()=> {
      console.log(swing.point);
    }, 500);
    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') swing.calibrate();
    };

  };*/

  exports.app.start = ()=> {};

  provide(exports);
});
