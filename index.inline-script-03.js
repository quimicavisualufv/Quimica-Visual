(function configureVisitWidget() {
  const isLocalFile = window.location.protocol === 'file:' || window.location.origin === 'null';
  if (isLocalFile) {
    window.VisitWidgetConfig = { functionUrl: '', siteKey: 'principal', position: 'bottom-left', label: 'Visitas' };
    return;
  }
  window.VisitWidgetConfig = {
    functionUrl: 'https://uiziwrtliumlgdfrcddw.supabase.co/functions/v1/count-visit',
    anonKey: 'sb_publishable_eyD-PP9S5sdNQkonppUeGg_UnktwkTx',
    siteKey: 'principal',
    position: 'bottom-left',
    label: 'Visitas'
  };
})();
