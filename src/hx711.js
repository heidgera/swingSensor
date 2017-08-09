obtain(['wiring-pi', 'µ/utilities.js'], (wpi, { averager: Averager })=> {

  if (!window.wpiSetup) {
    wpi.setup('wpi');
    window.wpiSetup = true;
  }

  exports.hx711 = function(clk, data) {
    var _this = this;

    var GAIN = 128;

    var ave = new Averager();

    wpi.pinMode(clk, wpi.OUTPUT);
    wpi.pinMode(data, wpi.INPUT);

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

    _this.readBase = (cb)=> {
      var value = 0;
      var data = [0, 0, 0];
      var filler = 0x00;

      // pulse the clock pin 24 times to read the data
      data[2] = wpi.shiftIn(data, clk, wpi.MSBFIRST);
      data[1] = wpi.shiftIn(data, clk, wpi.MSBFIRST);
      data[0] = wpi.shiftIn(data, clk, wpi.MSBFIRST);

      // set the channel and the gain factor for the next reading using the clock pin
      for (let i = 0; i < GAIN; i++) {
        wpi.digitalWrite(clk, HIGH);
        wpi.digitalWrite(clk, LOW);
      }

      // Replicate the most significant bit to pad out a 32-bit signed integer
      if (data[2] & 0x80) {
        filler = 0xFF;
      } else {
        filler = 0x00;
      }

      // Construct a 32-bit signed integer
      value = (filler << 24 | data[2] << 16 | data[1] << 8 | data[0]);

      ave.addSample(value);
      _this.average = ave.ave;

      if (tracker < ave.getBinSize()) tracker++;
      else if (!_this.initValue) _this.initValue = _this.average;

      if (cb) cb(value);
    };

    _this.read = (cb)=> {
      if (_this.isReady()) readBase(cb);
      else wpi.wiringPiISR(data, wpi.INT_EDGE_RISING, function(delta) {
        readBase(cb);
        wiringPiISRCancel(data);
      });
    };

    _this.getValue = ()=> {
      return _this.average - _this.offset;
    };

    _this.getUnits = ()=> {
      _this.getValue() / _this.scale;
    };

    _this.tare = ()=> {
      _this.offset = _this.average;
    };

  };

  provide(exports);
});
