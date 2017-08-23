obtain(['./src/hx711.js', 'fs'], ({ hx711: HX711 }, fs)=> {
  var threeCells = function() {
    var _this = this;
    var numCells = 3;
    _this.cells = [];
    _this.cells.push(new HX711(17, 18));
    _this.cells.push(new HX711(27, 22));
    _this.cells.push(new HX711(23, 24));

    for (var i = 0; i < _this.cells.length; i++) {
      _this.cells[i].begin(100);
    };

    var confDir = './sensorCalibrations.json';
    var calib = { scaleFactors: [], offset: [] };
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      calib = JSON.parse(data);
    }

    setTimeout(()=> {
      for (var i = 0; i < _this.cells.length; i++) {
        if (calib.scaleFactors[i]) {
          console.log('recalled scale factor of ' + calib.scaleFactors[i]);
          _this.cells[i].scale = calib.scaleFactors[i];
        } else _this.cells[i].scale = 8800.;
        if (calib.offset[i]) {
          console.log('recalled offset of ' + calib.offset[i]);
          _this.cells[i].offset = calib.offset[i];
        } else _this.cells[i].tare();

      }
    }, 1000);

    _this.calibrate = ()=> {
      console.log('Calibrating...');
      for (let i = 0; i < _this.cells.length; i++) {
        let newVal = _this.cells[i].average;
        console.log('Current read is ' + _this.cells[i].average);
        console.log('Initial read was ' + _this.cells[i].initValue);
        calib.scaleFactors[i] = 3 * (newVal - _this.cells[i].initValue) / 25;
        calib.offset[i] = _this.cells[i].initValue;
        console.log('New scale is ' + calib.scaleFactors[i]);
        _this.cells[i].scale = calib.scaleFactors[i];
        fs.writeFileSync(confDir, JSON.stringify(calib));
      }
    };

    _this.weights = ()=> _this.cells.map((cell)=>cell.getUnits());

    _this.totalWeight = ()=>_this.weights().reduce((acc, cur)=>acc + cur, 0);

    _this.point = {
      get x() {
        var w = _this.weights();

        //console.log(_this.cells[0].average + ' ' + _this.cells[1].average + ' ' + _this.cells[2].average);
        console.log(_this.totalWeight());
        console.log(w[0] + ' is weight 1');
        console.log(w[1] + ' is weight 2');
        console.log(w[2] + ' is weight 3');

        return ((-.866 * w[0]) + (0.866 * w[1])) / (_this.totalWeight());
      },

      get y() {
        var w = _this.weights();
        return ((.5 * w[0]) + (.5 * w[1]) + (-1 * w[2])) / (_this.totalWeight());
      },
    };
  };

  exports.swing = new threeCells();

  provide(exports);
});
