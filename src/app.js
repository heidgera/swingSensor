'use strict';

var obtains = ['./src/hx711.js', 'µ/piFig/piFig.js'];

obtain(obtains, ({ hx711 }, piFig)=> {
  exports.app = {};

  console.log('here');

  var cell = new hx711(0, 1);

  cell.begin(50);

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
