'use strict';

var obtains = ['./src/swingSensor.js', './src/button.js', 'µ/utilities.js', 'rpio'];

obtain(obtains, ({ swing }, { button: Button }, { clamp }, rpio)=> {
  exports.app = {};

  var calibButton = new Button(4);

  var setupAudioControl = (cfg)=> {
    if (cfg) {
      var tracks = cfg.tracks.map(el=> new Audio(el));
      tracks.forEach(cfg.setupFunc);
      var pollInt = setInterval(()=> {
        cfg.ctrlFunc(swing, tracks);
        if (cfg.visualize) {
          µ('#track').style.left = (µ('#outer').offsetWidth / 2 + µ('#outer').offsetWidth * swing.point.x + 5) + 'px';
          µ('#track').style.top = (µ('#outer').offsetHeight / 2 - µ('#outer').offsetHeight * swing.point.y + 5) + 'px';
        }
      }, (cfg.pollTime || 100));
    }
  };

  exports.app.start = ()=> {
    var req = get('http://192.168.0.1/controlConfig.js', { type: 'text' }).then((res)=> {
      var ctrlCfg = eval('//# sourceURL=remoteInstructions\n ()=>{ \nreturn ' + res.responseText + '}')();
      console.log(ctrlCfg);
      setupAudioControl(ctrlCfg);
    }, (error)=> {
      setupAudioControl({
        tracks: ['./audio/chimes.mp3'],
        setupFunc: (el, ind, arr)=> {
          el.loop = true;
          el.play();
        },

        ctrlFunc: (swing, audio)=> {
          if (swing.totalWeight() > 15) {
            var x = swing.point.x;
            var y = swing.point.y;
            let dist = clamp(Math.sqrt(x * x + y * y) * 2, 0, 1);
            audio[0].volume = Math.pow(1 - dist, 2);
          } else audio[0].volume = 0;
        },

        visualize: true,
        pollTime: 100,
      });
    });

    console.log('started');

    var pollInt = setInterval(()=> {
      console.log(swing.point.x + ' ' + swing.point.y);
      var w = swing.weights();
      console.log('Weights are ' + w[0] + ' ' + w[1] + ' ' + w[2]);
    }, 1000);

    calibButton.onPressDown = swing.calibrate;

    document.onkeypress = (e)=> {
      if (e.key == ' ') swing.calibrate();
    };

    document.onkeyup = (e)=> {
      var electron = require('electron');
      if (e.which == 27) electron.remote.process.exit();
    };

  };

  provide(exports);
});
