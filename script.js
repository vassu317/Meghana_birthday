/* =========================
   CINEMATIC INTRO
========================= */
const intro = document.getElementById("intro");
const birthday = document.getElementById("birthday");
const introLines = document.querySelectorAll(".introLine");
let currentLine = 0;

function showLine(index) {
    introLines.forEach(line => {
        line.style.opacity = "0";
        line.style.transform = "translateY(20px)";
    });
    if (index < introLines.length) {
        introLines[index].style.opacity = "1";
        introLines[index].style.transform = "translateY(0)";
        setTimeout(() => showLine(index + 1), 2500);
    } else {
        setTimeout(() => {
            intro.style.opacity = "0";
            intro.style.pointerEvents = "none";
            birthday.style.opacity = "1";
            birthday.style.transform = "scale(1)";
        }, 1200);
    }
}
setTimeout(() => showLine(0), 1000);

/* =========================
   BIRTHDAY MUSIC
========================= */
const songs = [
    document.getElementById("song1"),
    document.getElementById("song2"),
    document.getElementById("song3"),
    document.getElementById("song4")
];
const musicButton = document.getElementById("musicButton");
const musicStatus = document.getElementById("musicStatus");
let currentSong = 0;
let musicStarted = false;
let switching = false;

songs.forEach(song => song.volume = 0.42);

function fadeVolume(audio, target, duration = 700) {
    const start = audio.volume;
    const difference = target - start;
    const steps = 18;
    let step = 0;
    return new Promise(resolve => {
        const timer = setInterval(() => {
            step++;
            audio.volume = Math.max(0, Math.min(1, start + difference * (step / steps)));
            if (step >= steps) {
                clearInterval(timer);
                audio.volume = target;
                resolve();
            }
        }, duration / steps);
    });
}

async function playSong(index, restart = false) {
    if (!songs[index]) return;
    const song = songs[index];
    if (restart) song.currentTime = 0;
    try {
        await song.play();
        song.volume = 0.42;
        currentSong = index;
        musicStarted = true;
        musicButton.textContent = "♫";
        musicStatus.textContent = "MUSIC ON";
    } catch (error) {
        console.log("Music needs a user interaction.");
    }
}

async function switchSong(index) {
    if (!musicStarted || switching || index === currentSong) return;
    switching = true;
    const oldSong = songs[currentSong];
    const newSong = songs[index];
    try {
        newSong.currentTime = 0;
        newSong.volume = 0;
        await newSong.play();
        await fadeVolume(oldSong, 0, 650);
        await fadeVolume(newSong, 0.42, 650);
        oldSong.pause();
        oldSong.currentTime = 0;
        currentSong = index;
    } catch (error) {
        console.log("Song switch failed:", error);
    }
    switching = false;
}

function startStory() {
    document.getElementById("story").scrollIntoView({ behavior: "smooth" });
    if (!musicStarted) playSong(0);
}

musicButton.addEventListener("click", () => {
    if (!musicStarted) {
        playSong(0);
        return;
    }
    const song = songs[currentSong];
    if (song.paused) {
        song.play();
        musicButton.textContent = "♫";
        musicStatus.textContent = "MUSIC ON";
    } else {
        song.pause();
        musicButton.textContent = "▶";
        musicStatus.textContent = "MUSIC OFF";
    }
});

/* Song 1: beginning/memories → Song 2: letter/photos → Song 3: personal story/final */
const song2Trigger = document.getElementById("letter");
const song3Trigger = document.getElementById("thePart");
const song4Trigger = document.getElementById("cakeMoment");

const musicObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting || !musicStarted) return;
        if (entry.target === song2Trigger) switchSong(1);
        if (entry.target === song3Trigger) switchSong(2);
        if (entry.target === song4Trigger) switchSong(3);
    });
}, { threshold: 0.35 });

if (song2Trigger) musicObserver.observe(song2Trigger);
if (song3Trigger) musicObserver.observe(song3Trigger);
if (song4Trigger) musicObserver.observe(song4Trigger);

/* Never loop. Each track advances once; after Song 3, music ends. */
songs.forEach((song, index) => {
    song.addEventListener("ended", () => {
        if (index < songs.length - 1 && musicStarted) {
            playSong(index + 1, true);
        } else {
            musicStatus.textContent = "MUSIC OFF";
            musicButton.textContent = "▶";
        }
    });
});


/* =========================
   CINEMATIC PHOTO REVEALS + PARTICLES
========================= */

// Add ambient cinematic layers without changing the existing page structure.
const particleLayer = document.createElement("div");
particleLayer.id = "cinematicParticles";
document.body.appendChild(particleLayer);

const glowLayer = document.createElement("div");
glowLayer.id = "cinematicGlow";
document.body.appendChild(glowLayer);

// Small number of particles keeps the effect elegant instead of distracting.
for (let i = 0; i < 24; i++) {
    const particle = document.createElement("span");
    particle.className = "cinematicParticle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${7 + Math.random() * 9}s`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
    particle.style.opacity = `${0.25 + Math.random() * 0.5}`;
    particleLayer.appendChild(particle);
}

// Reveal photo groups when they actually enter the viewport.
const cinematicTargets = document.querySelectorAll(
    ".memoryCard, .bestCard, .thing, .letterPhoto, .lastPhotos img, .storyPhoto"
);

cinematicTargets.forEach((element, index) => {
    element.classList.add("cinematic-photo");
    element.style.transitionDelay = `${(index % 3) * 90}ms`;
});

const photoRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
});

cinematicTargets.forEach(element => photoRevealObserver.observe(element));


/* =========================
   BIG SURPRISE INTERACTION
========================= */

const surpriseButton = document.getElementById("surpriseButton");
const surpriseOverlay = document.getElementById("surpriseOverlay");
const surpriseClose = document.getElementById("surpriseClose");

function openSurprise() {
    if (!surpriseOverlay) return;

    surpriseOverlay.classList.add("open");
    surpriseOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("surprise-open");

    if (surpriseButton) {
        surpriseButton.textContent = "YOU FOUND IT ❤️";
        surpriseButton.classList.add("clicked");
    }

    // Cinematic spark burst
    for (let i = 0; i < 34; i++) {
        const spark = document.createElement("span");
        spark.className = "surpriseSpark";
        spark.style.setProperty("--x", `${(Math.random() - 0.5) * 80}vw`);
        spark.style.setProperty("--y", `${(Math.random() - 0.5) * 70}vh`);
        spark.style.setProperty("--delay", `${Math.random() * 220}ms`);
        surpriseOverlay.appendChild(spark);
        setTimeout(() => spark.remove(), 1700);
    }
}

function closeSurprise() {
    if (!surpriseOverlay) return;
    surpriseOverlay.classList.remove("open");
    surpriseOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("surprise-open");
}

if (surpriseButton) {
    surpriseButton.addEventListener("click", openSurprise);
}

if (surpriseClose) {
    surpriseClose.addEventListener("click", closeSurprise);
}

if (surpriseOverlay) {
    surpriseOverlay.addEventListener("click", (event) => {
        if (event.target === surpriseOverlay) closeSurprise();
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSurprise();
});



/* =========================
   LETTER CINEMATIC REVEAL
========================= */
const cinematicLetter = document.querySelector('.letterCinematic');
if (cinematicLetter && 'IntersectionObserver' in window) {
    const letterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                cinematicLetter.classList.add('letterSeen');
                letterObserver.unobserve(cinematicLetter);
            }
        });
    }, { threshold: 0.18 });
    letterObserver.observe(cinematicLetter);
}


/* =========================
   FINAL SCREEN REVEAL
========================= */
const finalSection = document.getElementById("final");
if (finalSection && "IntersectionObserver" in window) {
    const finalObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                finalSection.classList.add("finalSeen");
                finalObserver.unobserve(finalSection);
            }
        });
    }, { threshold: 0.22 });
    finalObserver.observe(finalSection);
}


/* =========================
   FINAL POLISH — PROGRESS + CHAPTER HUD
========================= */
const progressBar = document.getElementById("scrollProgress");
const chapterHUD = document.getElementById("chapterHUD");
const chapterNumber = document.getElementById("chapterNumber");
const chapterLabel = document.getElementById("chapterLabel");
const backTop = document.getElementById("backTop");

const chapters = [
  ["birthday", "OPENING"], ["story", "THE BEGINNING"], ["memories", "LITTLE MOMENTS"],
  ["bestMoments", "THE BEST MOMENTS"], ["littleThings", "LITTLE THINGS"], ["letter", "A LITTLE LETTER"],
  ["photoStory", "IF THESE PHOTOS COULD TALK"], ["thePart", "THE PART WE NEVER PLANNED"],
  ["oneLastThing", "ONE LAST THING"], ["surprise", "THE SURPRISE"], ["final", "THE LAST PAGE"]
];

function updateCinematicHUD() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (backTop) backTop.classList.toggle("visible", window.scrollY > window.innerHeight * .8);

    let active = 0;
    let bestDistance = Infinity;
    chapters.forEach(([id], i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const distance = Math.abs(el.getBoundingClientRect().top - window.innerHeight * .35);
        if (distance < bestDistance) { bestDistance = distance; active = i; }
    });
    if (chapterNumber) chapterNumber.textContent = String(active + 1).padStart(2, "0");
    if (chapterLabel) chapterLabel.textContent = chapters[active][1];
}

let hudTick = false;
window.addEventListener("scroll", () => {
    if (hudTick) return;
    hudTick = true;
    requestAnimationFrame(() => { updateCinematicHUD(); hudTick = false; });
}, { passive: true });
window.addEventListener("resize", updateCinematicHUD);
if (backTop) backTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));
updateCinematicHUD();


/* =========================
   BIRTHDAY CAKE INTERACTION
========================= */
const cakeMoment = document.getElementById("cakeMoment");
const blowCandles = document.getElementById("blowCandles");
const cutCake = document.getElementById("cutCake");
if (cakeMoment && blowCandles && cutCake) {
  blowCandles.addEventListener("click", () => {
    cakeMoment.classList.add("candlesOut", "wishMade");
    blowCandles.textContent = "WISH MADE ✨";
    blowCandles.disabled = true;
    cutCake.disabled = false;
  });
  cutCake.addEventListener("click", () => {
    cakeMoment.classList.add("cakeCut");
    cutCake.textContent = "CAKE CUT! 🎂❤️";
    cutCake.disabled = true;
    setTimeout(() => {
      document.getElementById("final")?.scrollIntoView({behavior:"smooth"});
    }, 1400);
  });
}