const searchBtn = document.getElementById('searchBtn');
const locBtn = document.getElementById('locBtn');
const cityInput = document.getElementById('cityInput');
const statusEl = document.getElementById('status');
const weatherEl = document.getElementById('weather');
const placeEl = document.getElementById('place');
const emojiEl = document.getElementById('emoji');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const humEl = document.getElementById('hum');
const windEl = document.getElementById('wind');
const timeEl = document.getElementById('time');

searchBtn.addEventListener('click', () => searchCity());
cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchCity(); });
locBtn.addEventListener('click', () => useLocation());

function weatherCodeInfo(code){
  const map = {
    0: ['Clear sky','☀️'],
    1: ['Mainly clear','🌤️'],
    2: ['Partly cloudy','⛅'],
    3: ['Overcast','☁️'],
    45: ['Fog','🌫️'],
    48: ['Depositing rime fog','🌫️'],
    51: ['Light drizzle','🌦️'],
    53: ['Moderate drizzle','🌦️'],
    55: ['Dense drizzle','🌧️'],
    61: ['Slight rain','🌧️'],
    63: ['Moderate rain','🌧️'],
    65: ['Heavy rain','⛈️'],
    71: ['Slight snow','🌨️'],
    73: ['Moderate snow','❄️'],
    75: ['Heavy snow','❄️'],
    80: ['Rain showers','🌦️'],
    81: ['Moderate rain showers','🌧️'],
    82: ['Violent rain showers','⛈️'],
    95: ['Thunderstorm','⛈️'],
    96: ['Thunderstorm with hail','⛈️'],
    99: ['Severe hail thunderstorm','⛈️']
  };
  return map[code] || ['Unknown', '🔍'];
}

function setStatus(text, isError=false){
  statusEl.textContent = text;
  statusEl.style.color = isError ? '#ff7a7a' : '';
}

async function searchCity(){
  const q = cityInput.value.trim();
  if(!q){ setStatus('Please type a city name.', true); return; }
  setStatus('Searching city...');
  weatherEl.classList.add('hide');
  try{
    const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`)
      .then(r => r.json());

    const place = geo.results && geo.results[0];
    if(!place){ setStatus('City not found.', true); return; }

    const name = `${place.name}${place.admin1? ', '+place.admin1: ''}, ${place.country}`;
    setStatus(`Found: ${name}. Loading weather...`);
    await fetchAndDisplay(place.latitude, place.longitude, name);
  }catch(err){
    console.error(err);
    setStatus('Error during geocoding.', true);
  }
}

async function useLocation(){
  if(!navigator.geolocation){ setStatus('Geolocation not supported by browser.', true); return; }
  setStatus('Getting your location...');
  weatherEl.classList.add('hide');
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    try{
      const rev = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`)
        .then(r => r.json());
      const p = rev.results && rev.results[0];
      const name = p ? `${p.name}${p.admin1? ', '+p.admin1: ''}, ${p.country}` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      setStatus(`Location detected: ${name}. Loading weather...`);
      await fetchAndDisplay(lat, lon, name);
    }catch(err){
      console.error(err);
      setStatus('Could not reverse geocode location.', true);
      
      await fetchAndDisplay(lat, lon, `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
    }
  }, err => {
    console.warn(err);
    setStatus('Location access denied.', true);
  });
}

async function fetchAndDisplay(lat, lon, placeName){
  try{
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
    const data = await fetch(url).then(r => r.json());

    if(!data || !data.current_weather){ setStatus('Weather data unavailable.', true); return; }

    const cur = data.current_weather;
   
    let humidity = 'N/A';
    if(data.hourly && data.hourly.time && data.hourly.relativehumidity_2m){
      const idx = data.hourly.time.indexOf(cur.time);
      if(idx !== -1) humidity = data.hourly.relativehumidity_2m[idx] + '%';
    }

    const [desc, emoji] = weatherCodeInfo(cur.weathercode);
    placeEl.textContent = placeName || 'Unknown place';
    emojiEl.textContent = emoji;
    tempEl.textContent = `${cur.temperature.toFixed(1)}°C`;
    descEl.textContent = desc;
    humEl.textContent = humidity;
    windEl.textContent = `${cur.windspeed} m/s`;
    timeEl.textContent = cur.time;

    setStatus(''); 
    weatherEl.classList.remove('hide');
  }catch(err){
    console.error(err);
    setStatus('Failed to fetch weather.', true);
  }
}
