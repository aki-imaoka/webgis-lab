/* 地図座標: WGS84相当の緯度経度 / タイル投影: EPSG:3857 */
'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  if (!window.L) { $('tile-status').hidden = false; $('tile-status').textContent = '地図ライブラリを読み込めませんでした。ファイルの配置を確認してください。'; return; }
  const definitions = {
    std: { name: '標準地図', tile: 'std', ext: 'png' },
    pale: { name: '淡色地図', tile: 'pale', ext: 'png' },
    photo: { name: '航空写真', tile: 'seamlessphoto', ext: 'jpg' }
  };
  const home = [35.6812, 139.7671];
  const places = { tokyo: home, fuji: [35.3606, 138.7274], kyoto: [35.0116, 135.7681], sapporo: [43.0618, 141.3545] };
  const map = L.map('map', { zoomControl: false, minZoom: 5, maxZoom: 18, maxBounds: [[18, 120], [48, 156]], maxBoundsViscosity: 1 }).setView(home, 12);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
  const attribution = '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院</a>';
  let layer, layerKey, measuring = false, points = [], selectedMarker, locationMarker, accuracyCircle, toastTimer;
  const measurementGroup = L.layerGroup().addTo(map);
  const line = L.polyline([], { color: '#184e45', weight: 3, dashArray: '7 6' }).addTo(measurementGroup);
  const pointGroup = L.layerGroup().addTo(measurementGroup);
  const icon = L.divIcon({ className: 'point-icon', iconSize: [16, 16], iconAnchor: [8, 8] });
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500); }
  function closePanel() { $('sidebar').classList.remove('open'); }
  function validPosition(lat, lng) { return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 18 && lat <= 48 && lng >= 120 && lng <= 156; }
  function updateAttribution() {
    // 追加出典は長いため、常時表示の「データの出典・詳細」リンクから開ける別欄に掲載。
    if (layer && layer.options.attributionExtra) map.attributionControl.removeAttribution(layer.options.attributionExtra);
    const summary = '<a href="sources.html" target="_blank" rel="noopener noreferrer">追加出典・データ情報</a>';
    if (summary) map.attributionControl.addAttribution(summary);
    if (layer) layer.options.attributionExtra = summary;
  }
  function updateView() {
    const c = map.getCenter();
    $('center-coordinate').textContent = `${c.lat.toFixed(5)}° N, ${c.lng.toFixed(5)}° E`;
    $('zoom-level').textContent = map.getZoom();
    $('zoom-in').disabled = map.getZoom() >= 18;
    $('zoom-out').disabled = map.getZoom() <= 5;
    const hash = `#${map.getZoom()}/${c.lat.toFixed(5)}/${c.lng.toFixed(5)}/${layerKey}`;
    history.replaceState(null, '', hash);
    updateAttribution();
  }
  function switchLayer(key) {
    if (layerKey === key) return;
    if (layer) { if (layer.options.attributionExtra) map.attributionControl.removeAttribution(layer.options.attributionExtra); map.removeLayer(layer); }
    layerKey = key;
    const def = definitions[key];
    let failed = false;
    layer = L.tileLayer(`https://cyberjapandata.gsi.go.jp/xyz/${def.tile}/{z}/{x}/{y}.${def.ext}`, { attribution, maxZoom: 18, minZoom: 5, crossOrigin: true }).addTo(map);
    layer.on('loading', () => { failed = false; $('tile-status').textContent = '地図を読み込み中…'; $('tile-status').hidden = false; });
    layer.on('tileerror', () => { failed = true; $('tile-status').textContent = '一部の地図を取得できません。通信状況や背景地図を確認してください。'; $('tile-status').hidden = false; });
    layer.on('load', () => { if (!failed) $('tile-status').hidden = true; });
    document.querySelectorAll('[data-layer]').forEach(button => { const active = button.dataset.layer === key; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
    $('layer-label').textContent = def.name;
    updateView();
  }
  function showPosition(latlng) {
    if (selectedMarker) map.removeLayer(selectedMarker);
    const content = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = '選択した地点'; content.append(title, document.createElement('br'));
    const coordinate = document.createElement('code'); coordinate.textContent = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`; content.append(coordinate, document.createElement('br'));
    const button = document.createElement('button'); button.textContent = '座標を入力欄にセット'; button.onclick = () => { $('coordinates').value = coordinate.textContent; toast('座標を入力欄にセットしました'); }; content.append(button);
    selectedMarker = L.marker(latlng, { icon }).addTo(map).bindPopup(content).openPopup();
  }
  function updateMeasurement() {
    line.setLatLngs(points); pointGroup.clearLayers();
    let meters = 0;
    points.forEach((point, index) => { L.circleMarker(point, { radius: 5, color: '#fff', weight: 2, fillColor: '#184e45', fillOpacity: 1 }).addTo(pointGroup); if (index) meters += points[index - 1].distanceTo(point); });
    $('distance').textContent = meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${meters.toFixed(1)} m`;
    $('map-distance').textContent = $('distance').textContent;
    $('undo-point').disabled = points.length === 0; $('clear-measure').disabled = points.length === 0;
    $('map-undo').disabled = points.length === 0; $('map-clear').disabled = points.length === 0;
  }
  document.querySelectorAll('[data-layer]').forEach(button => button.onclick = () => switchLayer(button.dataset.layer));
  document.querySelectorAll('[data-place]').forEach(button => button.onclick = () => { map.setView(places[button.dataset.place], 13); closePanel(); });
  $('coordinate-form').onsubmit = event => {
    event.preventDefault();
    const values = $('coordinates').value.trim().replace(/，/g, ',').split(/[,\s]+/);
    const [lat, lng] = values.map(Number);
    if (values.length !== 2 || !validPosition(lat, lng)) { $('coordinate-error').textContent = '日本周辺の緯度（18〜48）、経度（120〜156）を順に入力してください。'; $('coordinates').setAttribute('aria-invalid', 'true'); return; }
    $('coordinate-error').textContent = ''; $('coordinates').removeAttribute('aria-invalid'); map.setView([lat, lng], 15); showPosition(L.latLng(lat, lng)); closePanel();
  };
  $('zoom-in').onclick = () => map.zoomIn(); $('zoom-out').onclick = () => map.zoomOut(); $('home').onclick = () => map.setView(home, 12);
  $('measure').onclick = () => { measuring = !measuring; $('measure').setAttribute('aria-pressed', measuring); $('measurement').hidden = !measuring; $('measure-overlay').hidden = !measuring; $('map').classList.toggle('measuring', measuring); if (measuring) { map.closePopup(); measurementGroup.addTo(map); toast('地図上を順にクリックすると距離を計測できます'); closePanel(); } else map.removeLayer(measurementGroup); };
  $('undo-point').onclick = () => { points.pop(); updateMeasurement(); }; $('clear-measure').onclick = () => { points = []; updateMeasurement(); };
  $('map-undo').onclick = () => $('undo-point').click(); $('map-clear').onclick = () => $('clear-measure').click(); $('map-finish').onclick = () => $('measure').click();
  map.on('click', event => { if (measuring) { points.push(event.latlng); updateMeasurement(); } else showPosition(event.latlng); });
  $('locate').onclick = () => {
    if (!navigator.geolocation) { toast('このブラウザは現在地に対応していません'); return; }
    $('locate').disabled = true; toast('現在地を取得しています…');
    navigator.geolocation.getCurrentPosition(position => {
      $('locate').disabled = false;
      const { latitude, longitude, accuracy } = position.coords;
      if (!validPosition(latitude, longitude)) { toast('現在地は地図の表示範囲（日本周辺）の外です'); return; }
      if (locationMarker) map.removeLayer(locationMarker); if (accuracyCircle) map.removeLayer(accuracyCircle);
      accuracyCircle = L.circle([latitude, longitude], { radius: accuracy, color: '#3f83b0', weight: 1, fillOpacity: .08 }).addTo(map);
      locationMarker = L.circleMarker([latitude, longitude], { radius: 7, color: '#fff', weight: 3, fillColor: '#3f83b0', fillOpacity: 1 }).addTo(map).bindPopup(`現在地（精度の目安 ±${Math.round(accuracy)} m）`);
      map.setView([latitude, longitude], 15); toast('現在地を表示しました'); closePanel();
    }, error => { $('locate').disabled = false; toast(error.code === 1 ? '現在地の利用が許可されていません。ブラウザの位置情報設定を確認してください。' : '現在地を取得できませんでした。座標指定をご利用ください。'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  };
  $('fullscreen').onclick = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { toast('このブラウザでは全画面表示を利用できません'); } };
  $('share').onclick = async () => { try { await navigator.clipboard.writeText(location.href); toast('表示位置のURLをコピーしました'); } catch { $('share-url').value = location.href; $('share-dialog').showModal(); $('share-url').select(); } };
  $('share-close').onclick = () => $('share-dialog').close();
  $('panel-open').onclick = () => $('sidebar').classList.add('open'); $('panel-close').onclick = closePanel;
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closePanel(); if (measuring) $('measure').click(); } });
  new ResizeObserver(() => map.invalidateSize()).observe($('map'));
  function restoreHash() {
    const parts = location.hash.slice(1).split('/');
    const [zoom, lat, lng] = parts.slice(0, 3).map(Number);
    if (parts.length === 4 && Number.isInteger(zoom) && zoom >= 5 && zoom <= 18 && validPosition(lat, lng) && Object.hasOwn(definitions, parts[3])) { map.setView([lat, lng], zoom); switchLayer(parts[3]); }
    else if (!layer) switchLayer('std');
    updateView();
  }
  restoreHash(); map.on('moveend', updateView); window.addEventListener('hashchange', restoreHash); updateMeasurement();
})();
