{
  tracks: [
    'http://192.168.0.1/audio/chime1.mp3',
    'http://192.168.0.1/audio/chime2.mp3',
    'http://192.168.0.1/audio/chime3.mp3',
    'http://192.168.0.1/audio/chime4.mp3'
  ],
  setupFunc: (el, ind, arr)=> {
    el.loop = false;
    el.pause();
    el.distCompare = (x, y, pt)=>{
      let dist = Math.sqrt(Math.pow(x - pt.x, 2) + Math.pow(y - pt.y, 2));
      if(dist < .15 && !el.struck){
        el.struck = true;
        el.currentTime = 0;
        el.play();
      } else if( dist > .25){
        el.struck = false;
      }
    }
  },
  ctrlFunc: (swing, audio)=> {
    if(swing.totalWeight() > 15){
      var x = swing.point.x;
      var y = swing.point.y;
      var chimeSpace = (2 * Math.PI) / audio.length;
      for (var i = 0; i < audio.length; i++) {
        audio[i].distCompare(x,y,{x: Math.cos(chimeSpace * i)/3, y: Math.sin(chimeSpace * i)/3})
      }
    }

  },
}
