obtain(['wiring-pi', 'µ/utilities.js'], (wpi, { averager: Averager })=> {

  if (!window.wpiSetup) {
    wpi.setup('wpi');
    wpi.piFaceSetup(200);
    window.wpiSetup = true;
  }

  exports.hx711 = function(clk, data) {
    var _this = this;

    var GAIN = 128;

    var ave = new Averager();

    wpi.pinMode(clk, wpi.OUTPUT);
    wpi.pinMode(data, wpi.INPUT);
    wpi.pullUpDnControl(data, wpi.PUD_DOWN);

    _this.average = 0;

    _this.offset = 0;

    _this.scale = 1;

    _this.initValue = 0;

    _this.isReady = ()=> {
      return wpi.digitalRead(data) == wpi.LOW;
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

      wpi.digitalWrite(clk);
      _this.read();
    };

    var tracker = 0;

    var shiftIn = ()=> {
      let dat = 0;
      for (var i = 24; i--;) {
        wpi.digitalWrite(clk, wpi.HIGH);
        wpi.digitalRead(data);
        dat |= (wpi.digitalRead(data) << i);

        wpi.digitalWrite(clk, wpi.LOW);
      }

      return dat;
    };

    _this.readBase = (cb)=> {
      var value = 0;
      var dat = [0, 0, 0];
      var filler = 0x00;

      // pulse the clock pin 24 times to read the data
      //dat[2] = wpi.shiftIn(data, clk, wpi.MSBFIRST);
      //dat[1] = wpi.shiftIn(data, clk, wpi.MSBFIRST);
      //dat[0] = wpi.shiftIn(data, clk, wpi.MSBFIRST);
      console.log('read');
      value = shiftIn();

      //console.log('Data ' + ' ' + dat[2] + ' ' + dat[1] + ' ' + dat[0]);

      // set the channel and the gain factor for the next reading using the clock pin
      for (let i = 0; i < GAIN; i++) {
        wpi.digitalWrite(clk, wpi.HIGH);
        wpi.digitalWrite(clk, wpi.LOW);
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

    _this.read = (cb)=> {
      console.log('try read');
      if (_this.isReady()) _this.readBase(cb);
      else console.log('wait'),wpi.wiringPiISR(data, wpi.INT_EDGE_RISING, function(delta) {
        _this.readBase(cb);
        wpi.wiringPiISRCancel(data);
      });
    };

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
