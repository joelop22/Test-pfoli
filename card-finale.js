/* ==========================================================================
   CARD FINALE — Cinematic closing interaction
   Self-contained module. Only reads existing DOM (#glow-cursor, nav),
   never overwrites existing script.js behaviour.
   ========================================================================== */

(function () {
    "use strict";

    // ---- Config: edit these to update the card's contact details ----------
    const CARD_DATA = {
        name: "Joel Shajan Varghese",
        title: "Graphic Designer",
        mark: "JV",
        email: "joelshajan2004@gmail.com",
        phone: "+919400144956",
        phoneDisplay: "9400144956",
        instagram: "https://www.instagram.com/_joe.el?igsh=ZTkzYnZmMDRlMXZ6",
        instagramHandle: "@_joe.el",
        behance: "https://www.behance.net/joelshajanv",
        behanceHandle: "behance.net/joelshajanv"
        // NOTE: no public "Website" or "LinkedIn" URL was found in the existing
        // site content, so those rows are omitted rather than invented.
        // Add them here (and in renderBack()) once you have real links.
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vcfString = () => {
        const [first, ...rest] = CARD_DATA.name.split(" ");
        const last = rest.pop() || "";
        const middle = rest.join(" ");
        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${last};${first};${middle};;`,
            `FN:${CARD_DATA.name}`,
            `TITLE:${CARD_DATA.title}`,
            `EMAIL;TYPE=INTERNET:${CARD_DATA.email}`,
            `TEL;TYPE=CELL:${CARD_DATA.phone}`,
            `URL:${CARD_DATA.behance}`,
            "END:VCARD"
        ].join("\n");
    };

    // ---- Build the section's inner markup ----------------------------------
    function renderFront() {
        return `
            <div class="card-face card-front">
                <span class="card-mark">${CARD_DATA.mark}</span>
                <div class="card-brand">JOEL</div>
                <h3 class="card-name">${CARD_DATA.name}</h3>
                <p class="card-title">${CARD_DATA.title}</p>
            </div>`;
    }

    function renderBack(qrUrl) {
        return `
            <div class="card-face card-back">
                <div class="card-back-inner">
                    <div class="card-qr"><img src="${qrUrl}" alt="Scan to save contact" loading="lazy"></div>
                    <div class="card-details">
                        <div class="card-detail-row"><i class="fas fa-envelope"></i><a href="mailto:${CARD_DATA.email}">${CARD_DATA.email}</a></div>
                        <div class="card-detail-row"><i class="fab fa-whatsapp"></i><a href="https://wa.me/${CARD_DATA.phone.replace('+', '')}" target="_blank">${CARD_DATA.phoneDisplay}</a></div>
                        <div class="card-detail-row"><i class="fab fa-instagram"></i><a href="${CARD_DATA.instagram}" target="_blank">${CARD_DATA.instagramHandle}</a></div>
                        <div class="card-detail-row"><i class="fab fa-behance"></i><a href="${CARD_DATA.behance}" target="_blank">${CARD_DATA.behanceHandle}</a></div>
                    </div>
                </div>
            </div>`;
    }

    function buildSection() {
        const section = document.createElement("section");
        section.id = "card-finale";
        section.className = "card-finale";
        section.setAttribute("aria-label", "Digital business card");

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(vcfString())}`;

        section.innerHTML = `
            <div class="finale-bg">
                <div class="finale-vignette"></div>
                <div class="finale-spotlight"></div>
                <div class="dust-particles" id="dust-particles"></div>
            </div>

            <div class="card-scene">
                <div class="card-3d" id="business-card">
                    <div class="card-tilt" id="card-tilt">
                        <div class="card-flip" id="card-flip">
                            ${renderFront()}
                            ${renderBack(qrUrl)}
                        </div>
                    </div>
                </div>
            </div>

            <p class="card-hint">Tap the card to flip &middot; move to tilt</p>

            <button class="save-contact-btn" id="save-contact-btn" type="button">
                <span class="btn-label">Save Contact</span>
                <span class="btn-success"><i class="fas fa-check"></i> Saved</span>
            </button>

            <div class="finale-outro" id="finale-outro">
                <h2>Thank You For Visiting</h2>
                <p>Let's create something amazing together.</p>
                <div class="finale-logo">JOEL</div>
            </div>
        `;
        return section;
    }

    // ---- Dust particles -----------------------------------------------------
    function spawnDust(container, count) {
        if (prefersReducedMotion) return;
        for (let i = 0; i < count; i++) {
            const d = document.createElement("span");
            d.className = "dust-particle";
            const size = (Math.random() * 2.5 + 1.5).toFixed(1);
            const duration = (Math.random() * 10 + 10).toFixed(1);
            const delay = (Math.random() * -20).toFixed(1);
            const drift = (Math.random() * 60 - 30).toFixed(0);
            const opacity = (Math.random() * 0.35 + 0.15).toFixed(2);
            d.style.setProperty("--size", `${size}px`);
            d.style.setProperty("--duration", `${duration}s`);
            d.style.setProperty("--delay", `${delay}s`);
            d.style.setProperty("--drift", `${drift}px`);
            d.style.setProperty("--opacity", opacity);
            d.style.left = `${Math.random() * 100}%`;
            container.appendChild(d);
        }
    }

    // ---- Save Contact download + success animation ---------------------------
    function setupSaveContact(button, cardEl) {
        button.addEventListener("click", () => {
            // Trigger .vcf download
            const blob = new Blob([vcfString()], { type: "text/vcard" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${CARD_DATA.name.replace(/\s+/g, "_")}.vcf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);

            // Visual feedback: glow + compress + success swap
            button.classList.add("is-glowing");
            if (window.gsap && !prefersReducedMotion) {
                gsap.to(cardEl, {
                    scale: 0.97,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
            setTimeout(() => {
                button.classList.add("is-saved");
            }, 150);
            setTimeout(() => {
                button.classList.remove("is-glowing", "is-saved");
            }, 2600);
        });
    }

    // ---- Flip interaction -----------------------------------------------------
    function setupFlip(flipEl, sectionEl) {
        flipEl.addEventListener("click", () => {
            flipEl.classList.toggle("is-flipped");
            sectionEl.classList.add("card-flipped-once");
        });
    }

    // ---- Pointer / gyro tilt ----------------------------------------------------
    function setupTilt(sceneEl, tiltEl, cardFace) {
        if (prefersReducedMotion) return;

        const maxTilt = 8; // degrees, per spec
        let rotX = 0, rotY = 0;

        const hasGsap = !!window.gsap;
        const quickX = hasGsap ? gsap.quickTo(tiltEl, "rotationX", { duration: 0.6, ease: "power3.out" }) : null;
        const quickY = hasGsap ? gsap.quickTo(tiltEl, "rotationY", { duration: 0.6, ease: "power3.out" }) : null;

        const applyTilt = (px, py) => {
            // px, py are -1..1 relative to card center
            rotY = px * maxTilt;
            rotX = -py * maxTilt;
            if (quickX && quickY) {
                quickX(rotX);
                quickY(rotY);
            } else {
                tiltEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }
            // Move the reflective sheen across the card faces
            const sheenX = 50 + px * 40;
            const sheenY = 50 + py * 40;
            document.querySelectorAll("#card-flip .card-face").forEach((f) => {
                f.style.setProperty("--sheen-x", `${sheenX}%`);
                f.style.setProperty("--sheen-y", `${sheenY}%`);
            });
        };

        const resetTilt = () => applyTilt(0, 0);

        // Desktop: mouse movement anywhere near the card
        window.addEventListener("mousemove", (e) => {
            const rect = sceneEl.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (window.innerWidth / 2);
            const dy = (e.clientY - cy) / (window.innerHeight / 2);
            applyTilt(Math.max(-1, Math.min(1, dx * 2)), Math.max(-1, Math.min(1, dy * 2)));
        });

        window.addEventListener("mouseleave", resetTilt);

        // Mobile: try device orientation first, fall back to touch drag
        let gyroActive = false;

        const onOrientation = (e) => {
            if (e.beta === null || e.gamma === null) return;
            gyroActive = true;
            const px = Math.max(-1, Math.min(1, e.gamma / 30));
            const py = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
            applyTilt(px, py);
        };

        const requestGyro = () => {
            if (typeof DeviceOrientationEvent !== "undefined" &&
                typeof DeviceOrientationEvent.requestPermission === "function") {
                DeviceOrientationEvent.requestPermission()
                    .then((state) => {
                        if (state === "granted") {
                            window.addEventListener("deviceorientation", onOrientation);
                        }
                    })
                    .catch(() => { /* silently fall back to touch tilt */ });
            } else if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", onOrientation);
            }
        };

        sceneEl.addEventListener("touchstart", requestGyro, { once: true, passive: true });

        // Touch drag fallback (also works alongside gyro if gyro never fires)
        sceneEl.addEventListener("touchmove", (e) => {
            if (gyroActive) return;
            const touch = e.touches[0];
            const rect = sceneEl.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (touch.clientX - cx) / (rect.width / 2);
            const dy = (touch.clientY - cy) / (rect.height / 2);
            applyTilt(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
        }, { passive: true });

        sceneEl.addEventListener("touchend", resetTilt);
    }

    // ---- Ambient floating / breathing ------------------------------------------
    function setupAmbientFloat(cardEl) {
        if (prefersReducedMotion || !window.gsap) return;
        gsap.to(cardEl, {
            y: "-=14",
            duration: 3.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
        gsap.to(cardEl, {
            scale: 1.015,
            duration: 4.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }

    // ---- Page-level darkening / nav fade / cursor-glow shrink -------------------
    function setupPageDarkening(sectionEl) {
        const overlay = document.createElement("div");
        overlay.id = "page-darken-overlay";
        overlay.style.cssText = `
            position: fixed; inset: 0; background: #000; opacity: 0;
            pointer-events: none; z-index: 40; transition: opacity 0.6s ease;
        `;
        document.body.appendChild(overlay);

        const nav = document.querySelector("nav");
        const glowCursor = document.getElementById("glow-cursor");

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const ratio = entry.intersectionRatio;
                overlay.style.opacity = String(Math.min(ratio * 1.4, 0.85));

                if (entry.isIntersecting && ratio > 0.35) {
                    sectionEl.classList.add("in-view");
                    if (nav) nav.style.opacity = "0";
                    if (nav) nav.style.pointerEvents = "none";
                    if (glowCursor) glowCursor.classList.add("glow-shrink");
                } else {
                    sectionEl.classList.remove("in-view");
                    if (nav) nav.style.opacity = "";
                    if (nav) nav.style.pointerEvents = "";
                    if (glowCursor) glowCursor.classList.remove("glow-shrink");
                }

                if (ratio > 0.6) {
                    sectionEl.classList.add("card-visible");
                } else {
                    sectionEl.classList.remove("card-visible");
                }
            });
        }, { threshold: [0, 0.15, 0.35, 0.6, 0.8, 1] });

        observer.observe(sectionEl);

        if (nav) nav.style.transition = "opacity 0.6s ease";
    }

    // ---- Scroll-driven rise / hold / lower / outro (GSAP ScrollTrigger) --------
    function setupScrollSequence(sectionEl, cardEl, outroEl) {
        if (!window.gsap || !window.ScrollTrigger) {
            // Fallback without GSAP: simple reveal via CSS class only.
            cardEl.style.transform = "translateY(0)";
            cardEl.style.opacity = "1";
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        if (prefersReducedMotion) {
            // Simple non-pinned fade-in for reduced motion users.
            gsap.set(cardEl, { y: 0, opacity: 1 });
            gsap.to(outroEl, {
                opacity: 1,
                y: 0,
                scrollTrigger: { trigger: sectionEl, start: "top 40%" }
            });
            return;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionEl,
                start: "top top",
                end: "+=220%",
                scrub: 0.6,
                pin: true,
                anticipatePin: 1
            }
        });

        tl.fromTo(cardEl, { y: 160, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" })
          .to({}, { duration: 1 }) // hold — free time for mouse interaction, flip, save
          .to(cardEl, { y: -120, opacity: 0, duration: 0.8, ease: "power2.in" })
          .to(outroEl, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2")
          .to(outroEl.querySelector(".finale-logo"), { opacity: 1, duration: 0.6 }, "+=0.3");
    }

    // ---- Init ---------------------------------------------------------------
    function init() {
        const footer = document.querySelector("footer");
        if (!footer || document.getElementById("card-finale")) return;

        const section = buildSection();
        footer.parentNode.insertBefore(section, footer);

        const dustContainer = section.querySelector("#dust-particles");
        const cardEl = section.querySelector("#business-card");
        const tiltEl = section.querySelector("#card-tilt");
        const flipEl = section.querySelector("#card-flip");
        const sceneEl = section.querySelector(".card-scene");
        const saveBtn = section.querySelector("#save-contact-btn");
        const outroEl = section.querySelector("#finale-outro");

        spawnDust(dustContainer, 26);
        setupFlip(flipEl, section);
        setupTilt(sceneEl, tiltEl, flipEl);
        setupAmbientFloat(cardEl);
        setupSaveContact(saveBtn, cardEl);
        setupPageDarkening(section);
        setupScrollSequence(section, cardEl, outroEl);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
