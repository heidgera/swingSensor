obtain(['rpio', 'µ/utilities.js'], (rpio, { averager: Averager })=> {

  if (!window.rpioSetup) {
    rpio.init({ mapping: 'gpio' });
    window.rpioSetup = true;
  }

  exports.hx711 = function(clkPin, dataPin) {
    var _this = this;

    var GAIN = 128;

    var ave = new Averager();

    rpio.open(clkPin, rpio.OUTPUT, rpio.LOW);
    rpio.open(dataPin, rpio.INPUT);

    //rpio.pullUpDnControl(data, rpio.PUD_DOWN);

    _this.average = 0;

    _this.offset = 0;

    _this.scale = 1;

    _this.initValue = 0;

    _this.isReady = ()=> {
      return rpio.read(dataPin) == rpio.LOW;
    };

    var readInt = null;

    _this.begin = (readTime = 50)=> {
      readInt = setInterval(_this.read, readTime);
    };

    _this.halt = ()=> {
      clearInterval(readInt);
    };

    _this.setGain = (gain)=> {
      switch (gain) {
        case 128:    // channel A, gain factor 128
          GAIN = 1;
          break;
        case 64:    // channel A, gain factor 64
          GAIN = 3;
          break;
        case 32:    // channel B, gain factor 32
          GAIN = 2;
          break;
      }

      rpio.write(clkPin, rpio.LOW);
      _this.read();
    };

    var tracker = 0;

    var shiftIn = ()=> {
      let dat = 0;
      for (var i = 24; i--;) {
        rpio.write(clkPin, rpio.HIGH);
        for (var j = 50; j--;) rpio.read(dataPin);
        dat |= (rpio.read(dataPin) << i);

        rpio.write(clkPin, rpio.LOW);
      }

      return dat;
    };

    _this.readBase = (cb)=> {
      var value = 0;
      var dat = [0, 0, 0];
      var filler = 0x00;

      console.log('read');
      value = shiftIn();

      //console.log('Data ' + ' ' + dat[2] + ' ' + dat[1] + ' ' + dat[0]);

      // set the channel and the gain factor for the next reading using the clock pin
      for (let i = 0; i < GAIN; i++) {
        rpio.write(clkPin, rpio.HIGH);
        rpio.write(clkPin, rpio.LOW);
      }

      // Replicate the most significant bit to pad out a 32-bit signed integer
      if (value & 0x800000) {
        value |= ~0xffffff;
      }

      console.log(value);

      ave.addSample(value);
      _this.average = ave.ave;

      if (tracker < ave.getBinSize()) tracker++;
      else if (!_this.initValue) _this.initValue = _this.average;

      if (cb) cb(value);
    };

    var wait = false;

    _this.read = (cb)=> {
      if (_this.isReady()) _this.readBase(cb);
      else wait = true;
    };

    rpio.poll(dataPin, ()=> {
      if (wait) {
        _this.readBase();
        wait = false;
      }
    });

    _this.getValue = ()=> {
      return _this.average - _this.offset;
    };

    _this.getUnits = ()=> {
      return _this.getValue() / _this.scale;
    };

    _this.tare = ()=> {
      _this.offset = _this.average;
    };

  };

  provide(exports);
});
