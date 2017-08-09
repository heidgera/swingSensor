obtain(['./src/hx711.js', 'µ/utilities.js', 'fs'], ({ hx711: HX711 }, fs)=> {
  var threeCells = function() {
    var _this = this;
    var numCells = 3;
    _this.cells = [];
    _this.cells.push(new HX711(0, 1));
    _this.cells.push(new HX711(2, 3));
    _this.cells.push(new HX711(4, 5));

    for (var i = 0; i < _this.cells.length; i++) {
      _this.cells[i].begin(50);
    };

    var confDir = './sensorCalibrations.json';
    var calib = { scaleFactors: [] };
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      calib = JSON.parse(data);
    }

    setTimeout(()=> {
      for (var i = 0; i < _this.cells.length; i++) {
        if (calib.scaleFactors[i])  _this.cells[i].scale = calib.scaleFactors[i];
        else _this.cells[i].scale = 8800.;
        _this.cells[i].tare();
      }
    }, 1000);

    _this.calibrate = ()=> {
      console.log('Calibrating...');
      for (let i = 0; i < _this.cells.length; i++) {
        let newVal = _this.cells[i].read();
        calib.scaleFactors[i] = 3 * (newVal - initReads[i]) / 25;
        _this.cells[i].setScale(calib.scaleFactors[i]);
        fs.writeFileSync(confDir, JSON.stringify(calib));
      }
    };

    //_this.onNewPoint = ()=> {};

    /*_this.idle = ()=> {
      let tot = 0;
      for (let i = 0; i < _this.cells.length; i++) {
        aves[i].addSample(_this.cells[i].getUnits(1));
        tot += aves[i].ave;
      }

      _this.point.x = ((-.866 * aves[0].ave) + (0.866 * aves[1].ave) + (0 * aves[2].ave)) / tot;
      _this.point.y = ((.5 * aves[0].ave) + (.5 * aves[1].ave) + (-1 * aves[2].ave)) / tot;
    };*/
    _this.weights = ()=> _this.cells.map((cell)=>cell.getUnits());

    _this.point = {
      get x() {
        var w = _this.weights();
        return ((-.866 * w[0]) + (0.866 * w[1])) / (w[0] + w[1] + w[2]);
      },

      get y() {
        var w = _this.weights();
        return ((.5 * w[0]) + (.5 * w[1]) + (-1 * w[2])) / (w[0] + w[1] + w[2]);
      },
    };
  };

  exports.swing = new threeCells();

  provide(exports);
});
