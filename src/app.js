'use strict';

var obtains = ['./src/hx711rpio.js', 'µ/piFig/piFig.js'];

obtain(obtains, ({ hx711:HX711 }, piFig)=> {
  exports.app = {};

  console.log('here');

  var cell = new HX711(17, 18);

  cell.begin(100);

  setInterval(()=> {
    console.log(cell.average);
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
