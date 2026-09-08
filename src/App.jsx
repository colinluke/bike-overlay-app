import React, { useState } from 'react';
import YouTube from 'react-youtube';
import { searchYouTube } from './youtubeService';

const SHORTCUTS = [
  { label: 'Select a quick search...', query: '' },
  { label: '🏔️ Scenic Alpine Cycling', query: '4k pov road cycling alpine alps' },
  { label: '🌲 Pacific Northwest Forest', query: '4k scenic ride forest trail bike' },
  { label: '🚴 Criterium Pro Bike Races', query: 'cycling crit race pov telemetry' },
  { label: '📺 Lo-Fi Beats Studio Feed', query: 'lofi hip hop stream chill beats' }
];

export default function App() {
  const [heartRate, setHeartRate] = useState(0);
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('hOz6M1Y8JgE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const triggerSearch = async (queryToUse) => {
    const activeQuery = queryToUse || searchQuery;
    if (!activeQuery) return;
    setIsSearching(true);
    const results = await searchYouTube(activeQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const toggleFavorite = (video, e) => {
    e.stopPropagation();
    if (favorites.some(fav => fav.id === video.id)) {
      setFavorites(favorites.filter(fav => fav.id !== video.id));
    } else {
      setFavorites([...favorites, video]);
    }
  };

  const connectHRM = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
      setBluetoothDevice(device);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const val = event.target.value;
        const flags = val.getUint8(0);
        setHeartRate(flags & 0x01 ? val.getUint16(1, true) : val.getUint8(1));
      });
      device.addEventListener('gattserverdisconnected', () => { setBluetoothDevice(null); setHeartRate(0); });
    } catch (e) { console.error(e); } finally { setIsConnecting(false); }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
        <YouTube videoId={currentVideoId} opts={{ height: '100%', width: '100%', playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 } }} containerClassName="fullscreen-video-wrapper" iframeClassName="fullscreen-video-iframe" onReady={(e) => e.target.playVideo()} />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4vw', boxSizing: 'border-box', color: '#fff', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
            <select onChange={(e) => { const val = e.target.value; console.log(`Here I am: ${val}`); if(val) { setSearchQuery(val); triggerSearch(val); setIsPanelOpen(true); } }} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: '#222', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
              {SHORTCUTS.map((sc, i) => <option key={i} value={sc.query}>{sc.label}</option>)}
            </select>
            <button onClick={() => setIsPanelOpen(!isPanelOpen)} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#2196f3', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>🔍 Search Feed</button>
            <button onClick={connectHRM} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: bluetoothDevice ? '#4caf50' : '#e91e63', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>{bluetoothDevice ? '❤️ HRM Active' : '🔗 Link HRM'}</button>
          </div>
          <div style={{ textAlign: 'right', textShadow: '2px 2px 10px rgba(0,0,0,0.9)' }}>
            <div style={{ fontSize: '9rem', fontWeight: '900', lineHeight: 0.8, fontFamily: 'monospace' }}>{heartRate > 0 ? heartRate : '--'}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>BPM</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '5vw', background: 'rgba(0, 0, 0, 0.7)', padding: '25px 45px', borderRadius: '24px', backdropFilter: 'blur(10px)', width: 'fit-content' }}>
          <div><span style={{ fontSize: '1.1rem', opacity: 0.6, fontWeight: 'bold' }}>CADENCE</span><span style={{ fontSize: '3.5rem', fontWeight: '900', fontFamily: 'monospace' }}>-- <span style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>rpm</span></span></div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '5vw' }}><span style={{ fontSize: '1.1rem', opacity: 0.6, fontWeight: 'bold' }}>POWER</span><span style={{ fontSize: '3.5rem', fontWeight: '900', fontFamily: 'monospace' }}>-- <span style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>W</span></span></div>
        </div>
      </div>

      {isPanelOpen && (
        <div style={{ position: 'absolute', top: '140px', left: '4vw', width: '440px', maxHeight: '70vh', background: 'rgba(15, 15, 15, 0.98)', borderRadius: '20px', padding: '25px', boxSizing: 'border-box', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(25px)', overflowY: 'auto', color: '#fff', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Media Explorer</h3>
            <button onClick={() => setIsPanelOpen(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); triggerSearch(); }} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Search any topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2a2a2a', color: '#fff', fontSize: '1rem' }} />
            <button type="submit" style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#2196f3', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>{isSearching ? '...' : 'Go'}</button>
          </form>

          {favorites.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.5, marginBottom: '10px' }}>⭐ SAVED RIDES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {favorites.map(fav => (
                  <div key={fav.id} onClick={() => { setCurrentVideoId(fav.id); setIsPanelOpen(false); }} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '10px', background: 'rgba(255,215,0,0.06)', cursor: 'pointer', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <img src={`https://img.youtube.com/vi/${fav.id}/mqdefault.jpg`} alt="thumb" style={{ width: '90px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 'bold', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{fav.title}</div>
                    <button onClick={(e) => toggleFavorite(fav, e)} style={{ background: 'none', border: 'none', color: '#ffd700', cursor: 'pointer', fontSize: '1.2rem' }}>★</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.5, marginBottom: '10px' }}>📡 SEARCH RESULTS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {searchResults.map(video => {
              const isFav = favorites.some(f => f.id === video.id);
              return (
                <div key={video.id} onClick={() => { setCurrentVideoId(video.id); setIsPanelOpen(false); }} style={{ display: 'flex', gap: '15px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                  <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt="thumb" style={{ width: '110px', height: '62px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: '0.9rem', fontWeight: 'bold', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</div></div>
                  <button onClick={(e) => toggleFavorite(video, e)} style={{ background: 'none', border: 'none', color: isFav ? '#ffd700' : '#666', cursor: 'pointer', fontSize: '1.3rem', alignSelf: 'center' }}>{isFav ? '★' : '☆'}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
