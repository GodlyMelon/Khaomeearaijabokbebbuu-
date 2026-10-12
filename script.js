const scanPage = document.getElementById('scanPage');
const scanner = document.getElementById('scanner');
const hint = document.getElementById('hint');
const progressLabel = document.getElementById('progressLabel');
const transition = document.getElementById('heartTransition');
const questionPage = document.getElementById('questionPage');
const yesPage = document.getElementById('yesPage');
const questionText = document.getElementById('questionText');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const answerArea = document.getElementById('answerArea');
const tinyNote = document.getElementById('tinyNote');
const heartRain = document.getElementById('heartRain');
const screenFlash = document.getElementById('screenFlash');

let scanTimer = null;
let progress = 0;
let scanComplete = false;
let noClicks = 0;
let rainTimer = null;
let finaleTimer = null;

function beginScan() {
  if (scanComplete || scanTimer) return;

  progress = 0;
  progressLabel.textContent = '0%';
  hint.textContent = 'กำลังสแกนหัวใจของเธอ…';
  scanner.classList.add('scanning');

  scanTimer = setInterval(() => {
    progress = Math.min(100, progress + 2);
    progressLabel.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(scanTimer);
      scanTimer = null;
      scanComplete = true;
      scanner.classList.remove('scanning');
      scanPage.classList.add('hidden');
      transition.classList.remove('hidden');

      finaleTimer = setTimeout(() => {
        transition.classList.add('scanning-finale');
        runScanHearts();
      }, 900);
    }
  }, 50);
}

function stopScan() {
  if (!scanTimer) return;
  clearInterval(scanTimer);
  scanTimer = null;

  if (progress < 100) {
    progress = 0;
    scanner.classList.remove('scanning');
    progressLabel.textContent = 'แตะค้าง';
    hint.textContent = 'แตะค้างที่หัวใจเพื่อเริ่มสแกน 💓';
  }
}

function runScanHearts() {
  const burst = document.createElement('div');
  burst.className = 'love-explosion';
  transition.appendChild(burst);

  const hearts = ['💗', '💖', '💕', '💘', '💓', '🩷', '❤️', '💞', '✨', '💫'];
  const rect = transition.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const bits = [];

  for (let i = 0; i < 72; i++) {
    const item = document.createElement('span');
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    item.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    item.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:${18 + Math.random() * 22}px;transform:translate(-50%,-50%);`;
    burst.appendChild(item);
    bits.push({ item, x, y });
  }

  let complete = 0;
  let gathered = false;
  const gatherAnimations = [];

  function continueAfterGather() {
    if (gathered) return;
    gathered = true;
    gatherAnimations.forEach(animation => animation.cancel());

    bits.forEach(({ item }) => {
      item.style.left = `${centerX}px`;
      item.style.top = `${centerY}px`;
      item.style.transform = 'translate(-50%, -50%)';
      item.style.opacity = '0';
    });

    // ให้หัวใจอยู่รวมกันกลางจอ 0.5 วินาที แล้วค่อยระเบิด
    setTimeout(() => explodeHearts(burst, bits, rect, showQuestion), 500);
  }

  bits.forEach(({ item, x, y }) => {
    const animation = item.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        {
          transform: `translate(-50%,-50%) translate(${centerX - x}px,${centerY - y}px) scale(.35)`,
          opacity: 1
        }
      ],
      { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }
    );

    animation.onfinish = () => {
      complete++;
      if (complete === bits.length) continueAfterGather();
    };
    gatherAnimations.push(animation);
  });

  // สำรองไว้กรณีเบราว์เซอร์ไม่ส่งสัญญาณจบแอนิเมชัน
  setTimeout(continueAfterGather, 1500);
}

function explodeHearts(layer, bits, rect, onFinished) {
  screenFlash.classList.remove('bang');
  void screenFlash.offsetWidth;
  screenFlash.classList.add('bang');

  let completed = 0;
  let finished = false;
  const maxDistance = Math.hypot(rect.width, rect.height) * 0.85;

  function done() {
    if (finished) return;
    finished = true;
    onFinished();
  }

  bits.forEach(({ item }) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = maxDistance * (0.45 + Math.random() * 0.7);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const spin = Math.random() * 500 - 250;

    const animation = item.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.15)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.35)', opacity: 1, offset: .14 },
        {
          transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${spin}deg) scale(.55)`,
          opacity: 0
        }
      ],
      { duration: 1700 + Math.random() * 500, delay: Math.random() * 100, easing: 'cubic-bezier(.12,.7,.2,1)', fill: 'forwards' }
    );

    animation.onfinish = () => {
      completed++;
      if (completed === bits.length) done();
    };
  });

  setTimeout(done, 2500);
}

function showQuestion() {
  transition.classList.add('hidden');
  transition.classList.remove('scanning-finale');
  transition.querySelector('.love-explosion')?.remove();
  questionPage.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function moveNoButton() {
  const areaRect = answerArea.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = Math.max(0, areaRect.width - buttonRect.width);
  const maxY = Math.max(0, areaRect.height - buttonRect.height);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noButton.style.position = 'absolute';
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
}

noButton.addEventListener('click', event => {
  event.preventDefault();
  noClicks++;

  if (noClicks === 1) {
    noButton.textContent = 'คิดอีกที';
    tinyNote.textContent = 'ลองคิดดูอีกนิดน้าา 🥺';
    moveNoButton();
  } else if (noClicks === 2) {
    noButton.textContent = 'ไม่เป็นจริงหรอ';
    tinyNote.textContent = 'แน่ใจแล้วเหรอเบ้บบู้ 💞';
    moveNoButton();
  } else {
    noButton.hidden = true;
    tinyNote.textContent = 'เหลือคำตอบที่น่ารักที่สุดแล้วนะ 💗';
  }
});

yesButton.addEventListener('click', event => {
  event.preventDefault();
  questionPage.classList.add('hidden');
  yesPage.classList.remove('hidden');
  startBigHeartRain();
  launchYesExplosion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function startBigHeartRain() {
  if (rainTimer) clearInterval(rainTimer);
  heartRain.replaceChildren();

  function makeHeart() {
    if (yesPage.classList.contains('hidden')) return;
    const heart = document.createElement('span');
    heart.className = 'rain-heart';
    heart.textContent = ['💖', '💗', '💕', '💞', '❤️', '🩷', '♡'][Math.floor(Math.random() * 7)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${18 + Math.random() * 34}px`;
    heart.style.setProperty('--dur', `${3.5 + Math.random() * 3}s`);
    heartRain.appendChild(heart);
    setTimeout(() => heart.remove(), 7500);
  }

  for (let i = 0; i < 45; i++) setTimeout(makeHeart, i * 45);
  rainTimer = setInterval(makeHeart, 95);
}

function launchYesExplosion() {
  const layer = document.createElement('div');
  layer.className = 'love-explosion';
  layer.style.position = 'fixed';
  layer.style.zIndex = '100';
  document.body.appendChild(layer);

  const symbols = ['💖', '💕', '💗', '💓', '💞', '💘', '❤️', '💝', '🩷', '✨', '🌸', '🎀'];
  const maxDistance = Math.hypot(window.innerWidth, window.innerHeight) * 0.85;

  for (let i = 0; i < 190; i++) {
    const heart = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const distance = maxDistance * (0.35 + Math.random() * 0.9);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const size = 18 + Math.random() * 34;
    heart.className = 'burst-heart';
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.fontSize = `${size}px`;
    layer.appendChild(heart);
    heart.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.1)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.2)', opacity: 1, offset: .12 },
        { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${Math.random() * 500 - 250}deg) scale(.5)`, opacity: 0 }
      ],
      { duration: 1800 + Math.random() * 1000, delay: Math.random() * 450, easing: 'cubic-bezier(.12,.7,.2,1)', fill: 'forwards' }
    );
  }

  setTimeout(() => layer.remove(), 3500);
}

scanner.addEventListener('pointerdown', event => {
  event.preventDefault();
  beginScan();
  try { scanner.setPointerCapture(event.pointerId); } catch (error) { /* เริ่มสแกนต่อได้ */ }
});
scanner.addEventListener('pointerup', stopScan);
scanner.addEventListener('pointercancel', stopScan);
scanner.addEventListener('lostpointercapture', stopScan);

document.getElementById('againButton').addEventListener('click', () => {
  if (scanTimer) clearInterval(scanTimer);
  if (rainTimer) clearInterval(rainTimer);
  if (finaleTimer) clearTimeout(finaleTimer);

  scanTimer = null;
  rainTimer = null;
  finaleTimer = null;
  progress = 0;
  scanComplete = false;
  noClicks = 0;

  heartRain.replaceChildren();
  document.querySelectorAll('body > .love-explosion').forEach(layer => layer.remove());
  transition.querySelector('.love-explosion')?.remove();

  yesPage.classList.add('hidden');
  questionPage.classList.add('hidden');
  transition.classList.add('hidden');
  transition.classList.remove('scanning-finale');
  scanPage.classList.remove('hidden');
  scanner.classList.remove('scanning');

  questionText.textContent = 'เป็นแฟนกันมั้ยเบ้บบู้';
  noButton.hidden = false;
  noButton.textContent = 'ไม่เป็น';
  noButton.removeAttribute('style');
  yesButton.textContent = 'เป็น 💗';
  tinyNote.textContent = 'เลือกคำตอบจากหัวใจได้เลย ✨';
  hint.textContent = 'แตะค้างที่หัวใจเพื่อเริ่มสแกน 💓';
  progressLabel.textContent = 'แตะค้าง';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
