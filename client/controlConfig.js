{
  tracks: ['http://tulsa-swing-sensor.net/audio/chimes.mp3'],
  setupFunc: (el, ind, arr)=> {
    el.loop = true;
    el.play();
  },
  ctrlFunc: (x, y, audio)=> {
    let dist = clamp(Math.sqrt(x * x + y * y) * 2, 0, 1);
    audio[0].volume = Math.pow(dist, 2);
  },
}
