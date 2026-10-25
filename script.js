const ticks = document.querySelector('.ticks');
const numerals = document.querySelector('.numerals');
const hourHand = document.querySelector('#hour-hand');
const minuteHand = document.querySelector('#minute-hand');
const secondHand = document.querySelector('#second-hand');
const dateWindow = document.querySelector('#date-window');
const digitalTime = document.querySelector('#digital-time');
const soundToggle = document.querySelector('#sound-toggle');
const formatSelect = document.querySelector('#format-select');
const timezoneSelect = document.querySelector('#timezone-select');
const themeToggle = document.querySelector('#theme-toggle');
const locationLabel = document.querySelector('#location-label');

// Generate Ticks
for (let index = 0; index < 60; index += 1) {
  const tick = document.createElement('span');
  const angle = index * Math.PI / 30;
  const radius = index % 5 === 0 ? 46.5 : 47.5;
  tick.className = `tick${index % 5 === 0 ? ' major' : ''}`;
  tick.style.left = `${50 + Math.sin(angle) * radius}%`;
  tick.style.top = `${50 - Math.cos(angle) * radius}%`;
  tick.style.transform = `translate(-50%, -50%) rotate(${index * 6}deg)`;
  ticks.append(tick);
}

const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const arabicNumerals = ['', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢'];
const defaultNumerals = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function renderNumerals() {
  numerals.innerHTML = '';
  const format = formatSelect.value;
  let numeralSet = defaultNumerals;
  if (format === 'roman') numeralSet = romanNumerals;
  if (format === 'arabic') numeralSet = arabicNumerals;

  for (let number = 1; number <= 12; number += 1) {
    const angle = number * Math.PI / 6;

    // Minutes placed near outer tick ring (~41% radius)
    const minuteEl = document.createElement('span');
    minuteEl.className = 'clock-minute';
    minuteEl.style.left = `${50 + Math.sin(angle) * 41}%`;
    minuteEl.style.top = `${50 - Math.cos(angle) * 41}%`;
    const minutes = number * 5;
    minuteEl.textContent = minutes === 60 ? '00' : String(minutes).padStart(2, '0');
    numerals.append(minuteEl);

    // Hour numerals placed tighter underneath (~36.5% radius)
    const hourEl = document.createElement('span');
    hourEl.className = 'clock-hour-numeral';
    hourEl.style.left = `${50 + Math.sin(angle) * 36.5}%`;
    hourEl.style.top = `${50 - Math.cos(angle) * 36.5}%`;
    hourEl.textContent = numeralSet[number];
    numerals.append(hourEl);
  }
}

formatSelect.addEventListener('change', renderNumerals);
renderNumerals();

// Timezone Labels Mapping
const timezoneLabels = {
  'Africa/Algiers': 'ALGERIA STANDARD TIME',
  'Asia/Kolkata': 'INDIA STANDARD TIME',
  'UTC': 'COORDINATED UNIVERSAL TIME',
  'America/New_York': 'EASTERN STANDARD TIME',
  'Europe/London': 'GREENWICH MEAN TIME',
  'America/Los_Angeles': 'PACIFIC STANDARD TIME',
  'Asia/Tokyo': 'JAPAN STANDARD TIME',
  'Australia/Sydney': 'AUSTRALIAN EASTERN TIME'
};

function updateClock() {
  const timeZone = timezoneSelect.value;
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  );

  const hours = Number(parts.hour);
  const minutes = Number(parts.minute);
  const seconds = Number(parts.second);

  hourHand.style.transform = `translateX(-50%) rotate(${(hours % 12) * 30 + minutes * 0.5 + seconds / 120}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minutes * 6 + seconds * 0.1}deg)`;
  secondHand.style.transform = `translateX(-50%) rotate(${seconds * 6}deg)`;

  dateWindow.textContent = `${parts.weekday.toUpperCase()} ${parts.day}`;
  
  const tzAbbr = timeZone.split('/').pop().replace('_', ' ');
  digitalTime.textContent = `${parts.hour}:${parts.minute}:${parts.second} ${tzAbbr.toUpperCase()}`;
  locationLabel.textContent = timezoneLabels[timeZone] || timeZone.replace('_', ' ').toUpperCase();

  window.setTimeout(updateClock, 1000 - (Date.now() % 1000));
}

timezoneSelect.addEventListener('change', updateClock);

// Theme Toggle
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggle.setAttribute('aria-label', `Switch to ${currentTheme} mode`);
});

// Sound Toggle
let soundOn = false;
let audioContext;
function playTick() {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 1000;
    gain.gain.setValueAtTime(.028, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .035);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + .04);
  } catch { /* Audio may be unavailable until user interaction. */ }
}

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  soundToggle.title = `Tick sound ${soundOn ? 'on' : 'off'}`;
  if (soundOn) playTick();
});

window.setInterval(playTick, 1000);
updateClock();
