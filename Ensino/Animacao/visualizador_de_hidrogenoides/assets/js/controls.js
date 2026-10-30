export function bindVisualizerControls({nSelect,orbitalSelect,sceneCanvas,state,refreshOrbitalSelect,findEntryIndex,setEntry,currentEntry,syncControls,updateRangeLabels,renderLegend,drawAll}) {
  nSelect.addEventListener('change',()=>{refreshOrbitalSelect();const index=findEntryIndex(Number(nSelect.value),orbitalSelect.value);if(index>=0)setEntry(index);});
  orbitalSelect.addEventListener('change',()=>{const index=findEntryIndex(Number(nSelect.value),orbitalSelect.value);if(index>=0)setEntry(index);});
  document.getElementById('prevBtn').addEventListener('click',()=>setEntry(state.entryIndex-1));
  document.getElementById('nextBtn').addEventListener('click',()=>setEntry(state.entryIndex+1));
  const resetBtn=document.getElementById('resetBtn'); if(resetBtn) resetBtn.addEventListener('click',()=>{state.rotX=.78;state.rotY=-.62;state.zoom=.70;state.pointSize=2.80;state.quality=.50;syncControls();drawAll();});
  const exportBtn=document.getElementById('exportBtn'); if(exportBtn) exportBtn.addEventListener('click',()=>{const link=document.createElement('a');link.download=`${currentEntry().n}_${currentEntry().orbital}_3d.png`;link.href=sceneCanvas.toDataURL('image/png');link.click();});
  document.querySelectorAll('.viewBtn').forEach(btn=>btn.addEventListener('click',()=>{const view=btn.dataset.view;if(view==='front'){state.rotX=0;state.rotY=0;}if(view==='top'){state.rotX=-Math.PI/2;state.rotY=0;}if(view==='side'){state.rotX=0;state.rotY=Math.PI/2;}drawAll();}));
  document.getElementById('zoomRange').addEventListener('input',e=>{state.zoom=Number(e.target.value);updateRangeLabels();drawAll();});
  document.getElementById('pointRange').addEventListener('input',e=>{state.pointSize=Number(e.target.value);updateRangeLabels();drawAll();});
  document.getElementById('qualityRange').addEventListener('input',e=>{state.quality=Number(e.target.value);updateRangeLabels();drawAll();});
  document.getElementById('colorMode').addEventListener('change',e=>{state.colorMode=e.target.value;renderLegend();drawAll();});
  document.getElementById('axesMode').addEventListener('change',e=>{state.axesMode=e.target.value;drawAll();});
  sceneCanvas.addEventListener('pointerdown',e=>{state.dragging=true;state.lastX=e.clientX;state.lastY=e.clientY;sceneCanvas.setPointerCapture(e.pointerId);});
  sceneCanvas.addEventListener('pointermove',e=>{if(!state.dragging)return;const dx=e.clientX-state.lastX,dy=e.clientY-state.lastY;state.lastX=e.clientX;state.lastY=e.clientY;state.rotY+=dx*.008;state.rotX+=dy*.008;drawAll();});
  const endDrag=()=>{state.dragging=false;}; sceneCanvas.addEventListener('pointerup',endDrag);sceneCanvas.addEventListener('pointercancel',endDrag);
  sceneCanvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.35,Math.min(3.2,state.zoom*(e.deltaY>0?.94:1.06)));syncControls();drawAll();},{passive:false});
  window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')setEntry(state.entryIndex-1);if(e.key==='ArrowRight')setEntry(state.entryIndex+1);});
  window.addEventListener('resize',drawAll);
}
