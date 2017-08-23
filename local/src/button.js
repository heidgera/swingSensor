obtain(['rpio'], (rpio)=> {

  if (!window.rpioSetup) {
    rpio.init({ mapping: 'gpio' });
    window.rpioSetup = true;
  }

  exports.button = function(pin) {
    var _this = this;

    _this.debounce = 50;

    _this.onPressDown = ()=> {};

    _this.onPressUp = ()=> {};

    _this.debounceTimer = null;

    _this.state = 1;

    rpio.open(pin, rpio.INPUT, rpio.PULL_UP);

    function pollcb(cbpin) {
      var state = rpio.read(cbpin);
      clearTimeout(_this.debounceTimer);
      _this.debounceTimer = setTimeout(()=> {
        if (state == rpio.read(cbpin) && state != _this.state) {
          _this.state = state;
          if (_this.state) _this.onPressUp();
          else _this.onPressDown();
        }
      });
    }

    rpio.poll(pin, pollcb);
  };

  provide(exports);
});
