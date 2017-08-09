obtain(['hx711', 'µ/utilities.js', 'fs'], (HX711, { averager }, fs)=> {
  var threeCells = function() {
    var _this = this;
    var numCells = 3;
    _this.cells = [];
    _this.cells[0] = new HX711(0, 1);
    _this.cells[1] = new HX711(2,3, true);
    _this.cells[2] = new HX711(4,5, true);

    _this.point = { x: 0, y:0 };

    var aves = [];
    for (var i = 0; i < numCells; i++) {
      aves = new averager();
    }

    var initReads = [0, 0, 0];

    var confDir = './sensorCalibrations.json';
    var calib = { scaleFactors: [] };
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      calib = JSON.parse(data);
    }

    for (var i = 0; i < _this.cells.length; i++) {
      if (calib.scaleFactors[i])  _this.cells[i].setScale(calib.scaleFactors[i]);
      initReads[i] = _this.cells[i].read();
      _this.cells[i].tare();
    }

    _this.calibrate = ()=> {
      for (let i = 0; i < _this.cells.length; i++) {
        let newVal = _this.cells[i].read();
        calib.scaleFactors[i] = 3 * (newVal - initReads[i]) / 25;
        _this.cells[i].setScale(calib.scaleFactors[i]);
        fs.writeFileSync(confDir, JSON.stringify(calib));
      }
    };

    //_this.onNewPoint = ()=> {};

    _this.idle = ()=> {
      let tot = 0;
      for (let i = 0; i < _this.cells.length; i++) {
        aves[i].addSample(_this.cells[i].getUnits(1));
        tot += aves[i].ave;
      }

      _this.point.x = ((-.866 * aves[0].ave) + (0.866 * aves[1].ave) + (0 * aves[2].ave)) / tot;
      _this.point.y = ((.5 * aves[0].ave) + (.5 * aves[1].ave) + (-1 * aves[2].ave)) / tot;
    };
  };

  exports.swing = new threeCells();

  provide(exports);
});
