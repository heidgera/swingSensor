'use strict';

var obtains = ['./src/swingSensor.js', 'µ/utilities.js'];

obtain(obtains, ({ swing }, { clamp })=> {
  exports.app = {};

  var setupAudioControl = (cfg)=> {
    if (cfg) {
      var tracks = cfg.tracks.map(el=> new Audio(el));
      tracks.forEach((el)=>{el.play()});
      var pollInt = setInterval(()=> {
        cfg.ctrlFunc(swing.point.x, swing.point.y, tracks);
        µ('#track').style.left = (µ('#outer').offsetWidth / 2 + µ('#outer').offsetWidth * swing.point.x + 5) + 'px';
        µ('#track').style.top = (µ('#outer').offsetHeight / 2 - µ('#outer').offsetHeight * swing.point.y + 5) + 'px';
      }, 50);
    }
  };

  exports.app.start = ()=> {
    /*var pollInt = setInterval(()=> {
      //console.log(swing.point.x + ' | ' + swing.point.y);
      µ('#track').style.left = (µ('#outer').offsetWidth / 2 + µ('#outer').offsetWidth * swing.point.x + 5) + 'px';
      µ('#track').style.top = (µ('#outer').offsetHeight / 2 - µ('#outer').offsetHeight * swing.point.y + 5) + 'px';
    }, 50);*/

    var req = get('tulsa-swing-controller.net', { type: 'application/json' }).then((res)=> {
      setupAudioControl(JSON.parse(res.responseText));
    }, (error)=> {
      setupAudioControl({
        tracks: ['./audio/chimes.mp3'],
        ctrlFunc: (x, y, audio)=> {
          let dist = clamp(Math.sqrt(x * x + y * y), 0, 1);
          audio[0].volume = Math.pow(1 - dist, 1);
        },
      });
    });

    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') swing.calibrate();
    };

    document.onkeyup = (e)=> {
      var electron = require('electron');
      if (e.which == 27) electron.remote.process.exit();
    };

  };

  //exports.app.start = ()=> {};

  provide(exports);
});
