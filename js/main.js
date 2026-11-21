/* =========================================================================
   TIO RENATO — SCRIPT PRINCIPAL
   -------------------------------------------------------------------------
   Responsável por:
   1. Aplicar as configurações de CONFIG (config.js) na página
   2. Mostrar placeholders quando uma imagem ainda não existir
   3. Gerar os cards de ganhadores
   4. Tocar o vídeo dentro do próprio card (carregado só ao clicar)
   5. Microinteração do botão principal
   6. (removido) carrossel — vídeos agora ficam um abaixo do outro
   7. Animação de entrada ao rolar a página
   ========================================================================= */

(function () {
    "use strict";

    const cfg = window.CONFIG || (typeof CONFIG !== "undefined" ? CONFIG : {});
    const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/></svg>';

    /* ---------- Utilitário: troca para placeholder se a imagem falhar ---------- */
    function handleImageFallback(img, container) {
        if (!img || !container) return;
        const fail = () => container.classList.add("no-image");
        const ok = () => container.classList.remove("no-image");
        img.addEventListener("error", fail);
        img.addEventListener("load", ok);
        // Caso a imagem já tenha terminado de carregar antes do script
        if (img.complete) {
            img.naturalWidth === 0 ? fail() : ok();
        }
    }

    /* ======================= 1. APLICAR CONFIGURAÇÕES ======================= */
    function applyConfig() {
        // Botão principal
        const button = document.getElementById("purchase-button");
        if (button) {
            const url = cfg.purchaseUrl;
            const isSet = url && url !== "INSIRA_O_LINK_AQUI";
            button.href = isSet ? url : "#";
            if (isSet && cfg.openPurchaseInNewTab) {
                button.target = "_blank";
                button.rel = "noopener noreferrer";
            }
            if (!isSet) {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    console.warn("[Tio Renato] Configure o link em js/config.js → purchaseUrl");
                });
            }
        }

        // Banner
        const heroImg = document.getElementById("hero-image");
        if (heroImg && cfg.bannerImage && heroImg.getAttribute("src") !== cfg.bannerImage) {
            heroImg.src = cfg.bannerImage;
        }
        handleImageFallback(heroImg, heroImg && heroImg.closest(".hero-banner"));

        // Rodapé / perfil
        const avatar = document.querySelector(".profile-avatar");
        if (avatar) {
            if (cfg.profileImage && avatar.getAttribute("src") !== cfg.profileImage) {
                avatar.src = cfg.profileImage;
            }
            if (cfg.profileName) avatar.alt = cfg.profileName;
            handleImageFallback(avatar, avatar.closest(".profile-avatar-wrap"));
        }

        const nameEl = document.querySelector(".profile-name");
        if (nameEl && cfg.profileName) nameEl.textContent = cfg.profileName;

        const instaEl = document.querySelector(".instagram-handle");
        if (instaEl) {
            // O @ é apenas texto (não é link), então não aplicamos instagramUrl
            const text = instaEl.querySelector(".instagram-text");
            if (text && cfg.instagramHandle) text.textContent = cfg.instagramHandle;
        }

        const fallback = document.querySelector(".avatar-fallback");
        if (fallback && cfg.profileName) {
            fallback.textContent = cfg.profileName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
        }
    }

    /* ======================= 2. CARDS DE GANHADORES ======================= */

    /* Extrai o ID de qualquer link do YouTube (shorts, watch, youtu.be, embed) */
    function getYouTubeId(url) {
        if (!url) return null;
        const match = String(url).match(
            /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
        );
        return match ? match[1] : null;
    }

    function renderWinners() {
        const grid = document.getElementById("winners-grid");
        if (!grid) return;

        const winners = Array.isArray(cfg.winners) ? cfg.winners : [];
        grid.innerHTML = "";

        winners.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "winner-card";

            const label = item.label || `Vídeo do ganhador ${index + 1}`;
            const ytId = getYouTubeId(item.youtube);

            // Capa: a definida no config ou, se for YouTube, a capa vertical do próprio vídeo
            const thumbSrc = item.thumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/oardefault.jpg` : "");
            const fileName = (item.thumbnail || "").split("/").pop();

            card.innerHTML = `
                <div class="winner-media">
                    <button class="winner-thumbnail" type="button" aria-label="Assistir: ${label}">
                        <img src="${thumbSrc}" alt="" loading="lazy" decoding="async" width="540" height="960">
                        <span class="image-placeholder" aria-hidden="true">
                            <span>Vídeo ${index + 1}</span>
                            <small>${fileName}</small>
                        </span>
                        <span class="winner-overlay" aria-hidden="true"></span>
                        <span class="play-button" aria-hidden="true">${PLAY_ICON}</span>
                    </button>
                </div>
            `;

            const media = card.querySelector(".winner-media");
            const thumb = card.querySelector(".winner-thumbnail");
            const img = card.querySelector("img");

            // Se a capa vertical do YouTube falhar, tenta a capa padrão
            if (ytId && !item.thumbnail) {
                img.addEventListener("error", () => {
                    const fallback = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
                    if (img.src !== fallback) img.src = fallback;
                }, { once: true });
            }

            handleImageFallback(img, thumb);
            thumb.addEventListener("click", () => playInCard(card, media, ytId, item.video, label));

            grid.appendChild(card);
        });
    }

    /* ======================= 3. VÍDEO DENTRO DO CARD ======================= */
    // Guarda o card que está tocando para parar quando outro for iniciado
    let currentCard = null;

    function stopCard(card) {
        if (!card) return;
        const player = card.querySelector(".winner-player");
        if (player) {
            const video = player.querySelector("video");
            if (video) {
                video.pause();
                video.removeAttribute("src");
                video.load(); // libera memória/download
            }
            player.remove(); // remover o iframe também para o áudio do YouTube
        }
        card.classList.remove("is-playing");
    }

    function playInCard(card, media, ytId, videoSrc, label) {
        // Só um vídeo tocando por vez: o anterior volta para a capa
        if (currentCard && currentCard !== card) stopCard(currentCard);

        const player = document.createElement("div");
        player.className = "winner-player";

        if (ytId) {
            // Player do YouTube só é carregado neste momento
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
            iframe.title = label;
            iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
            iframe.allowFullscreen = true;
            iframe.setAttribute("frameborder", "0");
            player.appendChild(iframe);
        } else {
            // Vídeo próprio (.mp4) só é baixado neste momento
            const video = document.createElement("video");
            video.src = videoSrc;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");
            video.setAttribute("aria-label", label);
            video.addEventListener("error", () => {
                player.innerHTML = `
                    <div class="winner-player-error">
                        <strong>Vídeo ainda não disponível</strong>
                        <span>${videoSrc || ""}</span>
                    </div>`;
            });
            player.appendChild(video);
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
        }

        media.appendChild(player);
        card.classList.add("is-playing");
        currentCard = card;
    }

    /* ======================= 4. MICROINTERAÇÃO DO BOTÃO ======================= */
    function setupButtonRipple() {
        const button = document.getElementById("purchase-button");
        if (!button) return;

        button.addEventListener("pointerdown", (e) => {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 0.5;
            const ripple = document.createElement("span");
            ripple.className = "cta-ripple";
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            button.appendChild(ripple);
            ripple.addEventListener("animationend", () => ripple.remove());
        });
    }

    /* ======================= 5. META PIXEL + API DE CONVERSÕES =======================
       Cada evento vai pelo Pixel (navegador) e pela /api/meta-event (servidor)
       com o MESMO eventID, e a Meta conta só uma vez. No localhost a API não
       existe, então só o Pixel é usado. */
    function newEventId(prefix) {
        return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
    }

    function sendServerEvent(eventName, eventId) {
        const host = location.hostname;
        if (location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "::1") return;

        const fbclid = new URLSearchParams(location.search).get("fbclid");
        const data = JSON.stringify({
            event_name: eventName,
            event_id: eventId,
            event_source_url: location.href,
            fbc: fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined
        });
        try {
            const blob = new Blob([data], { type: "application/json" });
            if (navigator.sendBeacon && navigator.sendBeacon("/api/meta-event", blob)) return;
        } catch (e) { /* segue para o fetch */ }
        fetch("/api/meta-event", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: data, keepalive: true, credentials: "same-origin"
        }).catch(() => {});
    }

    function trackEvent(eventName) {
        const eventId = newEventId(eventName);
        if (typeof window.fbq === "function") window.fbq("track", eventName, {}, { eventID: eventId });
        sendServerEvent(eventName, eventId);
    }

    function setupTracking() {
        // PageView: o Pixel já disparou no <head>; aqui vai a cópia do servidor
        if (window.__metaPageViewId) {
            // pequena espera para o Pixel criar o cookie _fbp
            setTimeout(() => sendServerEvent("PageView", window.__metaPageViewId), 1200);
        }

        const button = document.getElementById("purchase-button");
        if (button) button.addEventListener("click", () => trackEvent("InitiateCheckout"));
    }

    /* ======================= 6. ANIMAÇÃO AO ROLAR ======================= */
    function setupReveal() {
        const items = document.querySelectorAll(".reveal");
        if (!("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("is-visible"));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        items.forEach((el) => observer.observe(el));
    }

    /* ======================= 7. NOTIFICAÇÕES ======================= */
    const BELL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';

    function setupNotifications() {
        const opts = cfg.notifications || {};
        const root = document.getElementById("notify-root");

        // Exemplos fictícios só rodam localmente (nunca no site publicado)
        const isLocal = location.protocol === "file:" ||
            ["localhost", "127.0.0.1", "::1", "[::1]"].includes(location.hostname);
        const useTest = isLocal && opts.testMode !== false &&
            Array.isArray(opts.testItems) && opts.testItems.length > 0;

        const items = useTest ? opts.testItems
            : (Array.isArray(opts.items) ? opts.items : []);
        if (!root || opts.enabled === false || !items.length) return;

        const firstDelay = opts.firstDelay || 4000;
        const duration = opts.duration || 5000;
        const interval = opts.interval || 7000;
        let index = 0;
        let timer = null;

        /* ---- Som da notificação ----
           Navegadores (Chrome, Safari, celulares) bloqueiam som antes de a
           pessoa tocar/clicar na página. Por isso o áudio é "destravado" no
           primeiro toque/clique/tecla e, a partir daí, toca a cada notificação. */
        let sound = null;
        let soundUnlocked = false;
        let unlocking = false;

        // Eventos que o navegador aceita como "interação real" para liberar som.
        // (touchstart/pointerdown de toque NÃO valem no Chrome do celular —
        //  só o fim do toque: touchend / pointerup / click)
        const UNLOCK_EVENTS = ["pointerup", "touchend", "click", "keydown", "mousedown"];

        function setSoundStatus(status) {
            root.dataset.sound = status; // "bloqueado" | "liberado" | "tocando" (útil p/ diagnóstico)
        }

        if (opts.sound) {
            sound = new Audio(opts.sound);
            sound.preload = "auto";
            sound.setAttribute("playsinline", "");
            sound.volume = typeof opts.soundVolume === "number" ? opts.soundVolume : 0.7;
            setSoundStatus("bloqueado");

            const removeUnlock = () => UNLOCK_EVENTS.forEach((ev) =>
                window.removeEventListener(ev, unlock, true));

            function unlock() {
                if (soundUnlocked || unlocking) return;
                unlocking = true;
                // toca mudo por um instante dentro do toque só para liberar o áudio
                sound.muted = true;
                let p;
                try { p = sound.play(); } catch (e) { p = null; }

                const ok = () => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.muted = false;
                    soundUnlocked = true;
                    unlocking = false;
                    setSoundStatus("liberado");
                    removeUnlock(); // só remove depois de dar certo
                };
                const fail = () => {
                    sound.muted = false;
                    unlocking = false; // tenta de novo no próximo toque
                };

                if (p && p.then) p.then(ok).catch(fail);
                else if (p === null) fail();
                else ok();
            }

            UNLOCK_EVENTS.forEach((ev) =>
                window.addEventListener(ev, unlock, { capture: true, passive: true }));
        }

        function playSound() {
            if (!sound) return;
            try {
                sound.muted = false;
                sound.pause();
                sound.currentTime = 0; // sempre do começo, a cada notificação
                const p = sound.play();
                if (p && p.then) {
                    p.then(() => setSoundStatus("tocando"))
                     .catch(() => setSoundStatus("bloqueado")); // ainda sem toque na página
                }
            } catch (e) { /* ignora */ }
        }

        function buildToast(item) {
            const toast = document.createElement("div");
            toast.className = "notify-toast";
            toast.setAttribute("role", "status");

            const icon = document.createElement("span");
            icon.className = "notify-icon";
            // Compra real: mostra a inicial do nome; aviso: mostra o sino
            if (item.name) icon.textContent = item.name.trim().charAt(0).toUpperCase();
            else icon.innerHTML = BELL_ICON;

            const body = document.createElement("div");
            body.className = "notify-body";

            const title = document.createElement("strong");
            title.className = "notify-title";
            title.textContent = item.name
                ? (item.city ? `${item.name}, de ${item.city}` : item.name)
                : (item.title || "");

            const text = document.createElement("span");
            text.className = "notify-text";
            // Compra com quantidade: "acabou de comprar pacote com 50 números"
            text.textContent = item.qty
                ? `acabou de comprar pacote com ${item.qty} números`
                : (item.text || "");

            const time = document.createElement("span");
            time.className = "notify-time";
            time.textContent = item.name ? "agora mesmo" : "Tio Renato";

            const close = document.createElement("button");
            close.className = "notify-close";
            close.type = "button";
            close.setAttribute("aria-label", "Fechar notificação");
            close.textContent = "×";

            body.append(title, text, time);
            toast.append(icon, body, close);
            return toast;
        }

        function hide(toast) {
            if (!toast || toast.classList.contains("is-out")) return;
            toast.classList.add("is-out");
            setTimeout(() => toast.remove(), 400);
        }

        function showNext() {
            // Não mostra enquanto a aba estiver em segundo plano
            if (document.hidden) { timer = setTimeout(showNext, 2000); return; }

            const toast = buildToast(items[index]);
            index = (index + 1) % items.length;
            root.innerHTML = "";
            root.appendChild(toast);
            requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("is-in")));
            playSound();

            // Clique na notificação: rola até o botão verde (fica na mesma página)
            toast.addEventListener("click", (e) => {
                if (e.target.closest(".notify-close")) { hide(toast); return; }
                const cta = document.getElementById("purchase-button");
                if (cta) cta.scrollIntoView({ behavior: "smooth", block: "center" });
                hide(toast);
            });

            setTimeout(() => hide(toast), duration);
            timer = setTimeout(showNext, duration + interval);
        }

        timer = setTimeout(showNext, firstDelay);
    }

    /* ======================= INICIALIZAÇÃO ======================= */
    function init() {
        document.documentElement.classList.add("js");
        applyConfig();
        renderWinners();
        setupButtonRipple();
        setupReveal();
        setupNotifications();
        setupTracking();

        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
