'use strict';

var obtains = ['./src/swingSensor.js', 'electron'];

obtain(obtains, ({ swing })=> {
  exports.app = {};

  exports.app.start = ()=> {
    var pollInt = setInterval(()=> {
      //console.log(swing.point.x + ' | ' + swing.point.y);
      µ('#track').style.left = (µ('#outer').offsetWidth / 2 + µ('#outer').offsetWidth * swing.point.x + 5) + 'px';
      µ('#track').style.top = (µ('#outer').offsetHeight / 2 - µ('#outer').offsetHeight * swing.point.y + 5) + 'px';
    }, 50);
    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') swing.calibrate();
    };

    document.onkeyup = (e)=> {
      var electron = require('electron');
      if (e.which == 27) electron.app.quit();
    };

  };

  //exports.app.start = ()=> {};

  provide(exports);
});
