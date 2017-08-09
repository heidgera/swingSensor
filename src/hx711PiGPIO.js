obtain(['pigpio', 'µ/utilities.js'], ({ Gpio }, { averager: Averager })=> {
  exports.hx711 = function(clk, data) {
    var _this = this;

    var GAIN = 128;

    var ave = new Averager();

    var Clk = new Gpio(clk, {
      mode: Gpio.OUTPUT,
      alert: true,
    });
    var Data = new Gpio(data, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_OFF,
      edge: Gpio.EITHER_EDGE,
    });

    _this.average = 0;

    _this.offset = 0;

    _this.scale = 1;

    _this.initValue = 0;

    _this.isReady = ()=> {
      return Data.digitalRead() == 0;
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

      Clk.digitalWrite(0);
      _this.read();
    };

    var tracker = 0;

    function shiftIn() {
      var val = 0;
      for (var i = 0; i < 8; i++) {
        Clk.digitalWrite(1);
        val += (Data.digitalRead()) ? 1 : 0;
        //console.log(Data.digitalRead());
        val << 1;
        Clk.digitalWrite(0);
      }

      return val;
    }

    Clk.on('alert', function(level, tick) {
      //console.log('Clk changed to ' + level);
    });

    _this.readBase = (cb)=> {
      var value = 0;
      var dat = [0, 0, 0];
      var filler = 0x00;

      // pulse the clock pin 24 times to read the data
      dat[2] = shiftIn();
      dat[1] = shiftIn();
      dat[0] = shiftIn();

      // set the channel and the gain factor for the next reading using the clock pin
      for (let i = 0; i < GAIN; i++) {
        Clk.digitalWrite(1);
        Clk.digitalWrite(0);
      }

      // Replicate the most significant bit to pad out a 32-bit signed integer
      if (dat[2] & 0x80) {
        filler = 0xFF;
      } else {
        filler = 0x00;
      }

      // Construct a 32-bit signed integer
      value = (dat[2] << 16 | dat[1] << 8 | dat[0]);

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

    Data.on('interrupt', (level)=> {
      if (!level && wait) {
        wait = false;
        _this.readBase(cb);
      }

      console.log('Saw a change: ' + level);
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
