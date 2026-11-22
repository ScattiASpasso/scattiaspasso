(function () {
    const RULLINO_SIZE = 50;
    const isEn = document.documentElement.lang === 'en' ||
        (document.getElementById('rullini-bar-root')?.dataset.lang === 'en');

    const i18n = isEn
        ? {
            toggle: 'Rolls',
            close: 'Close',
            rollPrefix: 'Roll',
            countSuffix: 'photos',
            prevRoll: 'Previous roll',
            nextRoll: 'Next roll'
        }
        : {
            toggle: 'Rullini',
            close: 'Chiudi',
            rollPrefix: 'Rullino',
            countSuffix: 'foto',
            prevRoll: 'Rullino precedente',
            nextRoll: 'Rullino successivo'
        };

    function injectStyles() {
        if (document.getElementById('rullini-styles')) return;
        const style = document.createElement('style');
        style.id = 'rullini-styles';
        style.textContent = `
            #rullini-bar-root {
                position: relative;
                width: 100%;
                height: 0;
                z-index: 940;
            }
            #rullini-dock {
                position: absolute;
                left: 16px;
                top: -88px;
                z-index: 940;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
                pointer-events: none;
            }
            #rullini-dock > * {
                pointer-events: auto;
            }
            @keyframes rulliniBoomFlash {
                0% {
                    opacity: 0;
                    transform: scale(0.84);
                    background: #fff5ea;
                    color: #281911;
                    border-color: #ffffff;
                    box-shadow:
                        0 0 0 0 rgba(255, 226, 194, 0.95),
                        0 0 45px 14px rgba(255, 210, 166, 0.95),
                        0 0 90px 26px rgba(232, 168, 124, 0.65);
                    filter: brightness(2.4);
                }
                16% {
                    opacity: 1;
                    transform: scale(1.1);
                    background: linear-gradient(135deg, #ffd8b5, #e8a87c);
                    color: #180e08;
                    border-color: #ffffff;
                    box-shadow:
                        0 0 0 10px rgba(255, 226, 194, 0.45),
                        0 0 55px 18px rgba(255, 214, 173, 1),
                        0 0 110px 34px rgba(232, 168, 124, 0.8);
                    filter: brightness(2.1);
                }
                48% {
                    opacity: 1;
                    transform: scale(1.04);
                    background: linear-gradient(135deg, #5a341f, #281911);
                    color: #fff3e6;
                    border-color: #ffe4c9;
                    box-shadow:
                        0 0 0 18px rgba(232, 168, 124, 0),
                        0 0 36px 8px rgba(232, 168, 124, 0.75);
                    filter: brightness(1.38);
                }
                78% {
                    opacity: 1;
                    transform: scale(1.01);
                    background: linear-gradient(135deg, #382216, #1d130e);
                    color: #f8d4b7;
                    border-color: rgba(232, 168, 124, 0.95);
                    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.8), 0 0 22px rgba(232, 168, 124, 0.45);
                    filter: brightness(1.12);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                    background: linear-gradient(135deg, #281911, #150e0a);
                    color: #f3c4a2;
                    border-color: rgba(232, 168, 124, 0.9);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(224, 154, 108, 0.28);
                    filter: brightness(1);
                }
            }
            .rullini-toggle-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 9px 15px;
                border-radius: 999px;
                background: linear-gradient(135deg, #281911, #150e0a);
                border: 1.5px solid rgba(232, 168, 124, 0.9);
                color: #f3c4a2;
                font-family: 'Cinzel', serif;
                font-size: 0.76rem;
                font-weight: 700;
                letter-spacing: 1.8px;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(224, 154, 108, 0.28);
                backdrop-filter: blur(8px);
                transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, background 0.25s ease;
            }
            .rullini-toggle-btn.is-flash-pending {
                opacity: 0;
            }
            .rullini-toggle-btn.is-flashing {
                animation: rulliniBoomFlash 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .rullini-toggle-btn:hover {
                transform: translateY(-1px);
                background: linear-gradient(135deg, #382216, #1d130e);
                border-color: #ffe0c8;
                color: #ffffff;
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.85), 0 0 22px rgba(232, 168, 124, 0.48);
            }
            .rullini-toggle-chevron {
                transition: transform 0.36s cubic-bezier(0.16, 1, 0.3, 1);
                display: inline-flex;
            }
            .rullini-toggle-btn.is-open .rullini-toggle-chevron {
                transform: rotate(180deg);
            }

            /* Pannello a srotolamento dall'alto (effetto papiro / pellicola) */
            .rullini-drawer {
                position: absolute;
                top: 46px;
                left: 0;
                width: 224px;
                max-height: min(62vh, 460px);
                opacity: 0;
                pointer-events: none;
                overflow: hidden;
                clip-path: inset(0% 0% 100% 0% round 14px);
                transform: translateY(-12px);
                transform-origin: top center;
                border-radius: 14px;
                background: linear-gradient(180deg, rgba(24, 17, 12, 0.98) 0%, rgba(15, 15, 15, 0.97) 100%);
                border: 1px solid rgba(232, 168, 124, 0.5);
                box-shadow: 0 18px 42px rgba(0, 0, 0, 0.86);
                backdrop-filter: blur(10px);
                will-change: clip-path, transform, opacity;
                transition:
                    clip-path 0.48s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.48s cubic-bezier(0.16, 1, 0.3, 1),
                    opacity 0.24s ease;
            }
            .rullini-drawer.is-open {
                opacity: 1;
                pointer-events: auto;
                clip-path: inset(0% 0% 0% 0% round 14px);
                transform: translateY(0);
            }
            .rullini-drawer-inner {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: min(62vh, 460px);
            }
            .rullini-drawer-header {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(232, 168, 124, 0.16);
            }
            .rullini-close-btn {
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.04);
                color: #ccc;
                font-size: 1rem;
                line-height: 1;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            .rullini-close-btn:hover {
                border-color: #e8a87c;
                color: #ffffff;
                background: rgba(232, 168, 124, 0.16);
            }

            /* Lista interna a scorrimento per tanti rullini */
            .rullini-list {
                display: flex;
                flex-direction: column;
                gap: 5px;
                overflow-y: auto;
                padding-right: 4px;
                scrollbar-width: thin;
                scrollbar-color: rgba(232, 168, 124, 0.4) transparent;
            }
            .rullini-list::-webkit-scrollbar {
                width: 5px;
            }
            .rullini-list::-webkit-scrollbar-thumb {
                background: rgba(232, 168, 124, 0.4);
                border-radius: 999px;
            }
            .rullini-item-btn {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid transparent;
                background: rgba(255, 255, 255, 0.02);
                color: #c8c8c8;
                font-size: 0.8rem;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .rullini-item-btn:hover {
                background: rgba(232, 168, 124, 0.1);
                border-color: rgba(232, 168, 124, 0.35);
                color: #ffffff;
            }
            .rullini-item-btn.is-active {
                background: rgba(232, 168, 124, 0.16);
                border-color: rgba(232, 168, 124, 0.72);
                color: #f3c4a2;
                font-weight: 600;
            }
            .rullini-item-meta {
                font-size: 0.7rem;
                color: #888;
                white-space: nowrap;
            }
            .rullini-item-btn.is-active .rullini-item-meta {
                color: #e8a87c;
            }

            /* Barra di navigazione rapida tra un rullino e l'altro quando è selezionato */
            .rullini-step-bar {
                display: none;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                width: 100%;
                max-width: 800px;
                margin: 0 auto 14px auto;
                padding: 10px 14px;
                border-radius: 12px;
                background: #141414;
                border: 1px solid rgba(232, 168, 124, 0.38);
            }
            .rullini-step-bar--bottom {
                position: relative;
                z-index: 2;
                margin: 36px auto 44px auto;
            }
            .rullini-step-bar.is-visible {
                display: flex;
            }
            .rullini-step-label {
                font-family: 'Cinzel', serif;
                font-size: 0.8rem;
                letter-spacing: 1.4px;
                color: #f3c4a2;
                text-align: center;
            }
            .rullini-step-btn {
                padding: 6px 12px;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: #0d0d0d;
                color: #dcdcdc;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .rullini-step-btn:hover:not(:disabled) {
                border-color: #e8a87c;
                color: #f3c4a2;
            }
            .rullini-step-btn:disabled {
                opacity: 0.35;
                cursor: not-allowed;
            }

            /* Su schermi stretti / smartphone */
            @media (max-width: 768px) {
                #rullini-dock {
                    left: 10px;
                    top: -76px;
                }
                .rullini-toggle-btn {
                    padding: 8px 12px;
                    font-size: 0.7rem;
                }
                .rullini-drawer {
                    width: min(250px, calc(100vw - 24px));
                }
                .rullini-drawer.is-open {
                    max-height: 46vh;
                }
                .rullini-drawer-inner {
                    max-height: 46vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    let selectedRoll = null;
    let isOpen = false;
    let cachedPhotos = [];
    let fetchPromise = null;
    let flashTimer = null;
    const hiddenElementsState = new Map();

    function getJsonFilename() {
        return isEn ? 'foto_inglese.json' : 'foto.json';
    }

    function findHomeBlocksToHide() {
        const targets = new Set();

        const selectorCandidates = [
            '#featured-photo',
            '#featured-container',
            '#featured-section',
            '#hero-section',
            '#hero-container',
            '#hero-photo',
            '#intro-section',
            '#intro-container',
            '#intro-text',
            '.featured-photo',
            '.featured-section',
            '.hero-section',
            '.hero-container',
            '.intro-section',
            '.intro-container',
            '.intro-text',
            '.site-intro'
        ];

        selectorCandidates.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (!el.closest('#rullini-dock') && !el.closest('#rullini-bar-root')) {
                    targets.add(el);
                }
            });
        });

        const markers = [
            'fermare il tempo durante le uscite',
            'nessun cookie',
            'no cookies',
            'stop time during outdoor'
        ];

        document.querySelectorAll('section, div, p, header, article').forEach(el => {
            if (
                el === document.body ||
                el === document.documentElement ||
                el.id === 'rullini-bar-root' ||
                el.id === 'rullini-dock' ||
                el.id === 'rullini-step-bar' ||
                el.id === 'rullini-step-bar-bottom' ||
                el.id === 'gallery-container' ||
                el.closest('#rullini-dock') ||
                el.closest('#gallery-container')
            ) {
                return;
            }
            if (
                el.querySelector('#gallery-container') ||
                el.querySelector('#rullini-step-bar') ||
                el.querySelector('#rullini-step-bar-bottom')
            ) {
                return;
            }
            const txt = (el.textContent || '').toLowerCase();
            if (markers.some(m => txt.includes(m)) && txt.length < 700) {
                targets.add(el);
            }
        });

        const arr = Array.from(targets);
        return arr.filter(el => !arr.some(other => other !== el && other.contains(el)));
    }

    function syncHomeVisibility() {
        const shouldHide = selectedRoll !== null;

        if (shouldHide) {
            const blocks = findHomeBlocksToHide();
            blocks.forEach(el => {
                if (!hiddenElementsState.has(el)) {
                    hiddenElementsState.set(el, el.style.display || '');
                }
                if (el.style.display !== 'none') {
                    el.style.display = 'none';
                }
            });
        } else {
            hiddenElementsState.forEach((prevDisplay, el) => {
                if (el && el.isConnected) {
                    el.style.display = prevDisplay;
                }
            });
            hiddenElementsState.clear();
        }
    }

    function ensurePhotosLoaded() {
        if (Array.isArray(window.allPhotosData) && window.allPhotosData.length > cachedPhotos.length) {
            cachedPhotos = window.allPhotosData;
        }
        if (!fetchPromise) {
            fetchPromise = fetch(getJsonFilename() + '?v=' + Date.now())
                .then(r => r.ok ? r.json() : fetch('foto.json?v=' + Date.now()).then(r2 => r2.json()))
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        cachedPhotos = data;
                        renderRollsList();
                        if (selectedRoll !== null) {
                            applyRollFilterNow();
                        }
                    }
                    return cachedPhotos;
                })
                .catch(() => cachedPhotos);
        }
        return fetchPromise;
    }

    function getPhotosList() {
        if (Array.isArray(window.allPhotosData) && window.allPhotosData.length > cachedPhotos.length) {
            cachedPhotos = window.allPhotosData;
        }
        return cachedPhotos;
    }

    function getTotalRolls() {
        const list = getPhotosList();
        return Math.max(1, Math.ceil(list.length / RULLINO_SIZE));
    }

    function formatRollName(rollIdx) {
        return `${i18n.rollPrefix} ${String(rollIdx + 1).padStart(2, '0')}`;
    }

    function findGalleryContainer() {
        return document.getElementById('gallery-container') ||
            document.querySelector('.gallery-container') ||
            document.querySelector('.gallery') ||
            document.getElementById('gallery');
    }

    function applyRollFilterNow() {
        syncHomeVisibility();

        const list = getPhotosList();
        if (selectedRoll === null) {
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
            return;
        }

        const start = selectedRoll * RULLINO_SIZE;
        const end = start + RULLINO_SIZE;
        const rollPhotos = list.slice(start, end);

        const searchEl = document.getElementById('search-input');
        const query = searchEl ? searchEl.value.toLowerCase().trim() : '';

        const filteredRoll = rollPhotos.filter(photo => {
            const matchesCategory = (!window.currentCategory || window.currentCategory === 'all' || photo.categoria === window.currentCategory);
            const matchesSearch = typeof window.photoMatchesQuery === 'function'
                ? window.photoMatchesQuery(photo, query)
                : true;
            return matchesCategory && matchesSearch;
        });

        if (typeof window.renderVisiblePhotos === 'function') {
            const prevLimit = window.visibleLimit;
            window.visibleLimit = Math.max(filteredRoll.length, RULLINO_SIZE);
            window.renderVisiblePhotos(filteredRoll);
            window.visibleLimit = prevLimit;
        }

        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }

    function setDrawerOpen(nextState) {
        isOpen = nextState;
        if (isOpen) {
            ensurePhotosLoaded().then(() => renderRollsList());
            renderRollsList();
        }
        const toggleBtn = document.getElementById('rullini-toggle-btn');
        const drawer = document.getElementById('rullini-drawer');
        if (toggleBtn) {
            toggleBtn.classList.toggle('is-open', isOpen);
            toggleBtn.setAttribute('aria-expanded', String(isOpen));
        }
        if (drawer) {
            drawer.classList.toggle('is-open', isOpen);
            drawer.setAttribute('aria-hidden', String(!isOpen));
        }
    }

    function renderRollsList() {
        const listEl = document.getElementById('rullini-list');
        const totalPhotos = getPhotosList().length;
        const totalRolls = getTotalRolls();
        if (!listEl) return;

        let html = '';
        for (let i = 0; i < totalRolls; i++) {
            const start = i * RULLINO_SIZE;
            const count = Math.max(0, Math.min(RULLINO_SIZE, totalPhotos - start));
            html += `
                <button type="button" class="rullini-item-btn ${selectedRoll === i ? 'is-active' : ''}" data-roll="${i}">
                    <span>${formatRollName(i)}</span>
                    <span class="rullini-item-meta">${count} ${i18n.countSuffix}</span>
                </button>
            `;
        }

        listEl.innerHTML = html;

        listEl.querySelectorAll('.rullini-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectRoll(Number(btn.dataset.roll));
                setDrawerOpen(false);
            });
        });

        updateStepBar();
    }

    function updateStepBar() {
        const bars = [
            document.getElementById('rullini-step-bar'),
            document.getElementById('rullini-step-bar-bottom')
        ].filter(Boolean);
        const totalRolls = getTotalRolls();

        if (bars.length === 0) return;

        if (selectedRoll === null) {
            bars.forEach(b => b.classList.remove('is-visible'));
            return;
        }

        const text = `${formatRollName(selectedRoll)} (${selectedRoll + 1} / ${totalRolls})`;
        bars.forEach(b => {
            b.classList.add('is-visible');
            const lbl = b.querySelector('.rullini-step-label');
            const prev = b.querySelector('.rullini-prev-btn');
            const next = b.querySelector('.rullini-next-btn');
            if (lbl) lbl.textContent = text;
            if (prev) prev.disabled = selectedRoll <= 0;
            if (next) next.disabled = selectedRoll >= totalRolls - 1;
        });
    }

    function selectRoll(rollIdx, scrollTopOnStep = false) {
        selectedRoll = rollIdx;
        syncHomeVisibility();
        ensurePhotosLoaded().then(() => {
            applyRollFilterNow();
            renderRollsList();
        });
        applyRollFilterNow();
        renderRollsList();
        if (scrollTopOnStep) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function hookCategoryClicks() {
        document.addEventListener('click', (e) => {
            if (selectedRoll === null) return;
            const target = e.target.closest(
                '[data-category], [data-cat], .category-btn, .cat-btn, .filter-btn, .categories button, .category-nav button, .category-nav a, nav button, nav a'
            );
            if (!target) return;
            if (target.closest('#rullini-dock') || target.closest('.rullini-step-bar')) return;

            selectedRoll = null;
            syncHomeVisibility();
            renderRollsList();

            setTimeout(() => {
                if (selectedRoll === null && typeof window.applyFilters === 'function') {
                    window.applyFilters();
                }
            }, 0);
        }, true);
    }

    function hookGalleryPipeline() {
        const origApplyFilters = window.applyFilters;
        const origRenderVisiblePhotos = window.renderVisiblePhotos;
        if (typeof origApplyFilters !== 'function' || typeof origRenderVisiblePhotos !== 'function') return false;

        window.renderVisiblePhotos = function (matchingPhotos) {
            const searchEl = document.getElementById('search-input');
            const hasSearch = searchEl && searchEl.value.trim() !== '';
            if (!hasSearch && Array.isArray(matchingPhotos) && matchingPhotos.length > cachedPhotos.length) {
                cachedPhotos = matchingPhotos;
                renderRollsList();
            }
            return origRenderVisiblePhotos.apply(this, arguments);
        };

        window.applyFilters = function () {
            if (selectedRoll === null) {
                syncHomeVisibility();
                return origApplyFilters.apply(this, arguments);
            }
            applyRollFilterNow();
        };

        const origLoadMore = window.loadMorePhotos;
        if (typeof origLoadMore === 'function') {
            window.loadMorePhotos = function () {
                selectedRoll = null;
                syncHomeVisibility();
                renderRollsList();
                return origLoadMore.apply(this, arguments);
            };
        }

        const origGoToHome = window.goToHome;
        if (typeof origGoToHome === 'function') {
            window.goToHome = function () {
                selectedRoll = null;
                syncHomeVisibility();
                const res = origGoToHome.apply(this, arguments);
                renderRollsList();
                return res;
            };
        }

        return true;
    }

    function createStepBarElement(id, extraClass) {
        const bar = document.createElement('div');
        bar.id = id;
        bar.className = `rullini-step-bar ${extraClass || ''}`.trim();
        bar.innerHTML = `
            <button type="button" class="rullini-step-btn rullini-prev-btn">&lsaquo; ${i18n.prevRoll}</button>
            <span class="rullini-step-label"></span>
            <button type="button" class="rullini-step-btn rullini-next-btn">${i18n.nextRoll} &rsaquo;</button>
        `;
        const scrollTop = id === 'rullini-step-bar-bottom';
        bar.querySelector('.rullini-prev-btn').addEventListener('click', () => {
            if (selectedRoll !== null && selectedRoll > 0) selectRoll(selectedRoll - 1, scrollTop);
        });
        bar.querySelector('.rullini-next-btn').addEventListener('click', () => {
            if (selectedRoll !== null && selectedRoll < getTotalRolls() - 1) selectRoll(selectedRoll + 1, scrollTop);
        });
        return bar;
    }

    function triggerIntroFlash() {
        const btn = document.getElementById('rullini-toggle-btn');
        if (!btn) return;
        if (flashTimer) clearTimeout(flashTimer);
        btn.classList.remove('is-flashing');
        btn.classList.add('is-flash-pending');

        flashTimer = setTimeout(() => {
            btn.classList.remove('is-flash-pending');
            void btn.offsetWidth;
            btn.classList.add('is-flashing');
            btn.addEventListener('animationend', () => {
                btn.classList.remove('is-flashing');
            }, { once: true });
        }, 420);
    }

    function mountUI() {
        const root = document.getElementById('rullini-bar-root');
        if (!root) return;

        injectStyles();

        root.innerHTML = `
            <div id="rullini-dock">
                <button type="button" id="rullini-toggle-btn" class="rullini-toggle-btn" aria-expanded="false" aria-controls="rullini-drawer">
                    <span>${i18n.toggle}</span>
                    <span class="rullini-toggle-chevron" aria-hidden="true">▾</span>
                </button>
                <aside id="rullini-drawer" class="rullini-drawer" aria-hidden="true">
                    <div class="rullini-drawer-inner">
                        <div class="rullini-drawer-header">
                            <button type="button" id="rullini-close-btn" class="rullini-close-btn" title="${i18n.close}" aria-label="${i18n.close}">&times;</button>
                        </div>
                        <div id="rullini-list" class="rullini-list"></div>
                    </div>
                </aside>
            </div>
        `;

        const gallery = findGalleryContainer();
        if (gallery && gallery.parentNode) {
            if (!document.getElementById('rullini-step-bar')) {
                gallery.parentNode.insertBefore(createStepBarElement('rullini-step-bar', ''), gallery);
            }
            if (!document.getElementById('rullini-step-bar-bottom')) {
                const footer = document.querySelector('footer');
                if (footer && footer.parentNode === gallery.parentNode) {
                    gallery.parentNode.insertBefore(createStepBarElement('rullini-step-bar-bottom', 'rullini-step-bar--bottom'), footer);
                } else {
                    gallery.parentNode.insertBefore(createStepBarElement('rullini-step-bar-bottom', 'rullini-step-bar--bottom'), gallery.nextSibling);
                }
            }
        }

        document.getElementById('rullini-toggle-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            setDrawerOpen(!isOpen);
        });

        document.getElementById('rullini-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            setDrawerOpen(false);
        });

        document.addEventListener('click', (e) => {
            if (!isOpen) return;
            const dock = document.getElementById('rullini-dock');
            if (dock && !dock.contains(e.target)) {
                setDrawerOpen(false);
            }
        });

        window.addEventListener('scroll', () => {
            if (isOpen) {
                setDrawerOpen(false);
            }
        }, { passive: true });

        hookCategoryClicks();
        ensurePhotosLoaded().then(() => renderRollsList());
        renderRollsList();
        triggerIntroFlash();
    }

    window.addEventListener('pageshow', () => {
        if (!document.getElementById('rullini-toggle-btn')) {
            mountUI();
        } else {
            triggerIntroFlash();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        mountUI();
        let tries = 0;
        const timer = setInterval(() => {
            tries++;
            ensurePhotosLoaded();
            if (hookGalleryPipeline() || getPhotosList().length > 0) {
                renderRollsList();
                if (tries > 15) clearInterval(timer);
            } else if (tries > 100) {
                clearInterval(timer);
            }
        }, 100);
    });
})();
