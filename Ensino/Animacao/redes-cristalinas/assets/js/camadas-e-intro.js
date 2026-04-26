
(function(){
  try {
    
    var candidates = [];
    for (var k in window) {
      try {
        var v = window[k];
        if (!v) continue;
        if (v && typeof v === 'object') {
          if ('enableRotate' in v || 'noRotate' in v) candidates.push(v);
        }
      } catch(e){}
    }
    candidates.forEach(function(c){
      try {
        if ('enableRotate' in c) c.enableRotate = true;
        if ('noRotate' in c) c.noRotate = false;
      } catch(e){}
    });
  } catch(e){ console.warn('rotation patch err', e); }
})();
