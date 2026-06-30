/* =========================================================
   HRK // FUTURE SYSTEMS LAB — main.js
   ========================================================= */
(function () {
  "use strict";

  /* ---------- THEME ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }

  if (stored) {
    setTheme(stored);
  } else if (matchMedia("(prefers-color-scheme: light)").matches) {
    setTheme("light");
  }

  themeBtn.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------- FOOTER YEAR ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.querySelector(".notch-nav");
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle("scrolled", scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- ROTATING HERO TEXT ---------- */
  const phrases = [
    "technology-driven systems",
    "AI agents & RAG pipelines",
    "products that compound",
    "digital systems for culture",
    "useful tools from wild ideas",
  ];
  const rotEl = document.getElementById("rotating");
  let pi = 0;
  let ri = 0;
  let phase = "typing";
  let timer;

  function typeLoop() {
    const target = phrases[ri];

    if (phase === "typing") {
      pi++;
      rotEl.textContent = target.slice(0, pi);
      if (pi >= target.length) {
        phase = "pause";
        timer = setTimeout(() => {
          phase = "deleting";
          typeLoop();
        }, 2200);
        return;
      }
      timer = setTimeout(typeLoop, 48 + Math.random() * 32);
    } else if (phase === "deleting") {
      pi--;
      rotEl.textContent = target.slice(0, pi);
      if (pi <= 0) {
        ri = (ri + 1) % phrases.length;
        phase = "typing";
        timer = setTimeout(typeLoop, 350);
        return;
      }
      timer = setTimeout(typeLoop, 28);
    }
  }

  typeLoop();

  /* ---------- CANVAS FLOW-FIELD ---------- */
  const canvas = document.getElementById("flowField");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], mouse = { x: -1000, y: -1000 };
    const COUNT = 72;

    function resize() {
      const r = devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * r;
      canvas.height = H * r;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(r, 0, 0, r, 0, 0);
    }

    function seed() {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          life: Math.random() * 500 + 200,
          age: Math.random() * 300,
          hue: Math.random() * 30 + 35,
        });
      }
    }

    function field(x, y) {
      const s = 0.0018;
      return (
        Math.sin(y * s * 1.3 + x * s * 0.4) * 2.2 +
        Math.cos(x * s * 0.9 + y * s * 1.1) * 1.6 +
        Math.sin((x + y) * s * 0.7) * 1.1
      );
    }

    function draw() {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.04)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const isDark = root.getAttribute("data-theme") === "dark";

      particles.forEach((p) => {
        const angle = field(p.x, p.y);
        const dx = Math.cos(angle) * 1.8;
        const dy = Math.sin(angle) * 1.8;

        p.vx = p.vx * 0.88 + dx * 0.12;
        p.vy = p.vy * 0.88 + dy * 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.age++;

        const fadeIn = Math.min(p.age / 60, 1);
        const fadeOut = Math.max(0, 1 - (p.age - p.life + 120) / 120);
        const alpha = fadeIn * fadeOut * (isDark ? 0.28 : 0.22);

        if (p.age > p.life || p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.vx = 0;
          p.vy = 0;
          p.age = 0;
          p.life = Math.random() * 500 + 200;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, 6.283);
        const gold = isDark ? "201,162,39" : "168,132,28";
        ctx.fillStyle = `rgba(${gold},${alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    seed();
    draw();
    addEventListener("resize", () => { resize(); seed(); }, { passive: true });

    canvas.parentElement.addEventListener("mousemove", (e) => {
      const r = canvas.parentElement.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
  }

  /* ---------- SMOOTH ANCHOR SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#") return;
      if (id === "#top") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
