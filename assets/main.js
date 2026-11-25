/* Language switch (Arabic default, English via data-en), hero contour lines, scroll reveal,
   count-up numbers, the weekly series status, and an image lightbox. No external code. */
(function(){
  const KEY = "lamis-site-lang";
  const store = { get(){ try { return localStorage.getItem(KEY); } catch (e) { return null; } }, set(v){ try { localStorage.setItem(KEY, v); } catch (e) {} } };
  const tx = () => document.querySelectorAll("[data-en]");
  tx().forEach(el => { el.dataset.ar = el.innerHTML; });
  const titleEl = document.querySelector("[data-title-en]"); if (titleEl) titleEl.dataset.titleAr = document.title;

  function setLang(lang){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    tx().forEach(el => { el.innerHTML = lang === "ar" ? el.dataset.ar : el.dataset.en; });
    if (titleEl) document.title = lang === "ar" ? titleEl.dataset.titleAr : titleEl.dataset.titleEn;
    const b = document.getElementById("langBtn"); if (b){ b.textContent = lang === "ar" ? "EN" : "ع"; b.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية"); }
    store.set(lang); series(); counts(true);
  }

  /* weekly series: a post shows as published once its date has passed */
  function series(){
    const ar = document.documentElement.lang === "ar", now = new Date();
    document.querySelectorAll(".post[data-date]").forEach(p => {
      const d = new Date(p.dataset.date + "T09:00:00+03:00"), live = now >= d;
      p.classList.toggle("live", live); p.classList.toggle("soon", !live);
      const when = p.querySelector(".when"), pill = p.querySelector(".pill");
      if (when) when.textContent = d.toLocaleDateString(ar ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { day:"numeric", month:"long", year:"numeric" });
      if (pill) pill.textContent = live ? (ar ? "نُشر · اقرأ على لينكدإن" : "Published · read on LinkedIn") : (ar ? "قريبًا" : "Coming soon");
      if (live) p.setAttribute("href", p.dataset.href); else p.removeAttribute("href");
    });
  }

  /* count-up for numbers like 23, 81/81, 0/59 */
  let counted = false;
  function counts(instant){
    const els = document.querySelectorAll("[data-count]");
    els.forEach(el => {
      const [a, b] = el.dataset.count.split("/"), end = +a;
      const render = v => el.textContent = b !== undefined ? `${v}/${b}` : `${v}`;
      if (instant || counted || matchMedia("(prefers-reduced-motion: reduce)").matches){ render(end); return; }
      const t0 = performance.now(), dur = 1200;
      const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); render(Math.round(end * e)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  const statBox = document.querySelector(".stats");
  if (statBox && "IntersectionObserver" in window){
    const so = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ counts(false); counted = true; so.disconnect(); } }, { threshold:.4 });
    so.observe(statBox);
  }

  const q = new URLSearchParams(location.search).get("lang");
  setLang(q === "en" || q === "ar" ? q : store.get() || "ar");
  const btn = document.getElementById("langBtn");
  if (btn) btn.addEventListener("click", () => setLang(document.documentElement.lang === "ar" ? "en" : "ar"));

  /* hero: slow drifting contour lines, like the banner */
  const cv = document.getElementById("lines");
  if (cv){
    const x = cv.getContext("2d"), still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, visible = true;
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); };
    const draw = t => {
      x.clearRect(0, 0, W, H); x.lineWidth = 1;
      for (let k = 0; k < 14; k++){
        x.strokeStyle = `rgba(232,190,170,${0.11 - k * 0.006})`; x.beginPath();
        for (let px = 0; px <= W; px += 10){
          const y = H * 0.72 - k * 18 + Math.sin(px / 260 + k * 0.35 + t * 0.00012) * 34 + Math.sin(px / 90 + t * 0.0002 + k) * 5;
          px ? x.lineTo(px, y) : x.moveTo(px, y);
        }
        x.stroke();
      }
    };
    const loop = t => { draw(t); if (visible) raf = requestAnimationFrame(loop); };
    size(); addEventListener("resize", () => { size(); if (still) draw(0); });
    if (still) draw(0); else {
      raf = requestAnimationFrame(loop);
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible){ cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } }).observe(cv);
    }
  }

  /* reveal */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold:.12, rootMargin:"0px 0px -40px 0px" }) : null;
  document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io ? io.observe(el) : el.classList.add("in"); });

  /* lightbox */
  const lb = document.querySelector(".lightbox");
  if (lb){
    const img = lb.querySelector("img");
    document.querySelectorAll("[data-full]").forEach(b => b.addEventListener("click", () => { img.src = b.dataset.full; img.alt = b.querySelector("img").alt; lb.classList.add("open"); }));
    lb.addEventListener("click", () => lb.classList.remove("open"));
    document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("open"); });
  }
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
