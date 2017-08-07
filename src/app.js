'use strict';

obtain(['µ/midi.js', './src/scope.js'], (midi, scope)=> {
  exports.app = {};

  var twelfth = Math.pow(2, 1 / 12);

  var audio = new window.AudioContext();

  var analyser = audio.createAnalyser();
  analyser.fftSize = 2048;

  //create the oscillator, volume control and stereo panning

  var real = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0]);
  var imag = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0]);

  var hCont = [0, 0, 0, 0, 0, 0];

  var wave = audio.createPeriodicWave(real, imag);

  var notes = [];

  var attackTime = .1;
  var decayTime = 3;

  for (let i = 0; i < 32; i++) {
    let note = { osc: audio.createOscillator(), gain: audio.createGain() };

    //note.osc.connect(note.gain);

    //notes[i].osc.type = 'custom';
    note.osc.setPeriodicWave(wave);
    note.gain.connect(audio.destination);
    note.osc.start(0);
    note.gain.gain.value = 0;
    note.osc.frequency.value = 0;
    note.attack = (vel)=> {
      console.log(vel);
      let now = audio.currentTime;
      note.gain.gain.cancelScheduledValues(now);
      note.gain.gain.linearRampToValueAtTime(vel, now + attackTime);
    };

    note.decay = (vel)=> {
      let now = audio.currentTime;
      note.gain.gain.linearRampToValueAtTime(0, now + decayTime);
    };

    notes.push(note);
  }

  var analyserNote = null;

  let harmonic = function() {
    var _this = this;
    _this.connectedNote = null;
    _this.stopped = false;
    _this.order = [];
    for (let j = 0; j < 6; j++) {
      _this.order[j] = { osc: audio.createOscillator(), gain: audio.createGain() };
      _this.order[j].osc.connect(_this.order[j].gain);
      _this.order[j].osc.start(0);
    }

    _this.stop = ()=> {
      for (let j = 0; j < 6; j++) {
        _this.order[j].osc.stop(decayTime);
      }

      _this.stopped = true;
      note.harmonics = null;
    };

    _this.setHarmonics = (note)=> {
      if (!note && _this.connectedNote) note = _this.connectedNote;
      var primary = note.osc.frequency.value;
      console.log(primary);
      for (let j = 0; j < 6; j++) {
        _this.order[j].osc.frequency.setValueAtTime(primary * (j + 1), audio.currentTime);
        _this.order[j].gain.gain.value = hCont[j];
        _this.order[j].gain.disconnect();
        _this.order[j].gain.connect(note.gain);
      }

      if (analyserNote) analyserNote.gain.disconnect(analyser);
      analyserNote = note;
      analyserNote.gain.connect(analyser);

      _this.connectedNote = note;
    };
  };

  //var harm = new harmonic();

  var harmonics = [];
  for (let i = 0; i < 3; i++) {
    harmonics[i] = new harmonic();
  }

  harmonics.index = 0;

  harmonics.set = (note)=> {
    console.log(harmonics[harmonics.index].connectedNote);

    if (harmonics[harmonics.index].connectedNote !== note) {
      harmonics.index = (harmonics.index + 1) % harmonics.length;
      harmonics[harmonics.index].setHarmonics(note);
    }
  };

  exports.app.start = ()=> {
    midi.in.setNoteHandler((note, vel)=> {
      if (note >= 48 && note < 80) {
        vel = vel / 256;

        var now = audio.currentTime;
        notes[note - 48].osc.frequency.value = 523.251 * Math.pow(2.0, (note - 60) / 12);

        //notes[note - 48].harmonics = new harmonic(notes[note - 48]);

        //notes[note - 48].setHarmonics(523.251 * Math.pow(2.0, (note - 60) / 12));
        if (vel) {
          notes[note - 48].attack(vel);
          harmonics.set(notes[note - 48], now);
        } else {
          notes[note - 48].decay();//.gain.gain.value = 0;
          //notes[note - 48].harmonics.stop();
        }
      }
    });
    midi.in.setControlHandler((note, vel)=> {
      console.log(note);
      if (note > 2) {
        //if (note % 2) real[(note - 1) / 2] = (vel) / 128.0;
        //else imag[(note - 2) / 2] = (vel) / 128.0;

        hCont[note - 3] = vel / 128.0;

        //wave = audio.createPeriodicWave(real, imag);
        for (let i = 0; i < 3; i++) {
          //notes[i].osc.setPeriodicWave(wave);
          harmonics[i].setHarmonics();
        }
      } else if (note == 1) attackTime = (vel) / 128.0;
      else if (note == 2) decayTime = 3 * (vel) / 128.0;
    });

    //notes[16].gain.connect(analyser);

    var oscScope = new scope.scope(analyser, µ('#scope'));

    function draw() {
      oscScope.draw();

      requestAnimationFrame(draw);
    }

    draw();

    console.log('started');
  };

  provide(exports);
});
