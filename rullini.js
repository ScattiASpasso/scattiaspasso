(function () {
    const RULLINO_SIZE = 100;
    const isEn = document.documentElement.lang === 'en' ||
        (document.getElementById('rullini-bar-root')?.dataset.lang === 'en');

    const i18n = isEn
        ? {
            toggle: 'Rolls',
            title: 'Rolls index',
            close: 'Close',
            all: 'All rolls',
            rollPrefix: 'Roll',
            countSuffix: 'photos',
            prevRoll: 'Previous roll',
            nextRoll: 'Next roll'
        }
        : {
            toggle: 'Rullini',
            title: 'Indice rullini',
            close: 'Chiudi',
            all: 'Tutti i rullini',
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
            #rullini-dock {
                position: fixed;
                left: 16px;
                top: 165px;
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
            .rullini-toggle-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 9px 14px;
                border-radius: 999px;
                background: linear-gradient(135deg, rgba(20, 20, 20, 0.94), rgba(34, 25, 13, 0.94));
                border: 1px solid rgba(243, 213, 141, 0.45);
                color: #f3d58d;
                font-family: 'Cinzel', serif;
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 1.6px;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(8px);
                transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
            }
            .rullini-toggle-btn:hover {
                transform: translateY(-1px);
                border-color: #f3d58d;
                color: #ffffff;
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.8), 0 0 16px rgba(243, 213, 141, 0.28);
            }
            .rullini-toggle-chevron {
                transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
                display: inline-flex;
            }
            .rullini-toggle-btn.is-open .rullini-toggle-chevron {
                transform: rotate(180deg);
            }

            /* Pannello a srotolamento morbido */
            .rullini-drawer {
                width: 224px;
                max-height: 0;
                opacity: 0;
                overflow: hidden;
                transform: translateY(-8px) scaleY(0.96);
                transform-origin: top center;
                border-radius: 14px;
                background: rgba(16, 16, 16, 0.96);
                border: 1px solid rgba(184, 124, 36, 0.38);
                box-shadow: 0 16px 38px rgba(0, 0, 0, 0.82);
                backdrop-filter: blur(10px);
                transition:
                    max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 0.26s ease,
                    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .rullini-drawer.is-open {
                max-height: min(62vh, 460px);
                opacity: 1;
                transform: translateY(0) scaleY(1);
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
                justify-content: space-between;
                gap: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .rullini-drawer-title {
                font-family: 'Cinzel', serif;
                font-size: 0.72rem;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: #f3d58d;
                font-weight: 700;
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
                border-color: #f3d58d;
                color: #ffffff;
                background: rgba(243, 213, 141, 0.14);
            }

            /* Lista interna a scorrimento per tanti rullini */
            .rullini-list {
                display: flex;
                flex-direction: column;
                gap: 5px;
                overflow-y: auto;
                padding-right: 4px;
                scrollbar-width: thin;
                scrollbar-color: rgba(243, 213, 141, 0.35) transparent;
            }
            .rullini-list::-webkit-scrollbar {
                width: 5px;
            }
            .rullini-list::-webkit-scrollbar-thumb {
                background: rgba(243, 213, 141, 0.35);
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
                background: rgba(243, 213, 141, 0.08);
                border-color: rgba(243, 213, 141, 0.28);
                color: #ffffff;
            }
            .rullini-item-btn.is-active {
                background: rgba(243, 213, 141, 0.14);
                border-color: rgba(243, 213, 141, 0.65);
                color: #f3d58d;
                font-weight: 600;
            }
            .rullini-item-meta {
                font-size: 0.7rem;
                color: #888;
                white-space: nowrap;
            }
            .rullini-item-btn.is-active .rullini-item-meta {
                color: #e6c473;
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
                border: 1px solid rgba(184, 124, 36, 0.32);
            }
            .rullini-step-bar.is-visible {
                display: flex;
            }
            .rullini-step-label {
                font-family: 'Cinzel', serif;
                font-size: 0.8rem;
                letter-spacing: 1.4px;
                color: #f3d58d;
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
                border-color: #f3d58d;
                color: #f3d58d;
            }
            .rullini-step-btn:disabled {
                opacity: 0.35;
                cursor: not-allowed;
            }

            /* Su schermi stretti / smartphone */
            @media (max-width: 768px) {
                #rullini-dock {
                    left: 10px;
                    top: auto;
                    bottom: 58px;
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

    let selectedRoll = null; // null = tutti (con normale paginazione a 50), numero = indice 0-based del rullino (solo quelle 100 foto)
    let isOpen = false;

    function getTotalRolls() {
        const list = Array.isArray(window.allPhotosData) ? window.allPhotosData : [];
        return Math.max(1, Math.ceil(list.length / RULLINO_SIZE));
    }

    function formatRollName(rollIdx) {
        return `${i18n.rollPrefix} ${String(rollIdx + 1).padStart(2, '0')}`;
    }

    function setDrawerOpen(nextState) {
        isOpen = nextState;
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
        const totalPhotos = Array.isArray(window.allPhotosData) ? window.allPhotosData.length : 0;
        const totalRolls = getTotalRolls();
        if (!listEl) return;

        let html = `
            <button type="button" class="rullini-item-btn ${selectedRoll === null ? 'is-active' : ''}" data-roll="all">
                <span>${i18n.all}</span>
                <span class="rullini-item-meta">${totalPhotos} ${i18n.countSuffix}</span>
            </button>
        `;

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
                const raw = btn.dataset.roll;
                selectRoll(raw === 'all' ? null : Number(raw));
            });
        });

        updateStepBar();
    }

    function updateStepBar() {
        const stepBar = document.getElementById('rullini-step-bar');
        const stepLabel = document.getElementById('rullini-step-label');
        const prevBtn = document.getElementById('rullini-prev-btn');
        const nextBtn = document.getElementById('rullini-next-btn');
        const totalRolls = getTotalRolls();

        if (!stepBar) return;
        if (selectedRoll === null) {
            stepBar.classList.remove('is-visible');
            return;
        }

        stepBar.classList.add('is-visible');
        if (stepLabel) {
            stepLabel.textContent = `${formatRollName(selectedRoll)} (${selectedRoll + 1} / ${totalRolls})`;
        }
        if (prevBtn) prevBtn.disabled = selectedRoll <= 0;
        if (nextBtn) nextBtn.disabled = selectedRoll >= totalRolls - 1;
    }

    function selectRoll(rollIdx) {
        selectedRoll = rollIdx;
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
        renderRollsList();

        const gallery = document.getElementById('gallery-container');
        if (gallery) {
            const top = gallery.getBoundingClientRect().top + window.scrollY - 110;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    }

    function hookGalleryPipeline() {
        const origApplyFilters = window.applyFilters;
        const origRenderVisiblePhotos = window.renderVisiblePhotos;
        if (typeof origApplyFilters !== 'function' || typeof origRenderVisiblePhotos !== 'function') return false;

        window.applyFilters = function () {
            const list = Array.isArray(window.allPhotosData) ? window.allPhotosData : [];
            if (selectedRoll === null) {
                return origApplyFilters.apply(this, arguments);
            }

            const start = selectedRoll * RULLINO_SIZE;
            const end = start + RULLINO_SIZE;
            const rollPhotos = list.slice(start, end);

            const searchEl = document.getElementById('search-input');
            const query = searchEl ? searchEl.value.toLowerCase().trim() : '';

            const filteredRoll = rollPhotos.filter(photo => {
                const matchesCategory = (window.currentCategory === 'all' || photo.categoria === window.currentCategory);
                const matchesSearch = typeof window.photoMatchesQuery === 'function'
                    ? window.photoMatchesQuery(photo, query)
                    : true;
                return matchesCategory && matchesSearch;
            });

            const prevLimit = window.visibleLimit;
            window.visibleLimit = Math.max(filteredRoll.length, RULLINO_SIZE);
            origRenderVisiblePhotos.call(this, filteredRoll);
            window.visibleLimit = prevLimit;

            const loadMoreContainer = document.getElementById('load-more-container');
            if (loadMoreContainer) {
                loadMoreContainer.style.display = 'none';
            }
        };

        // Se l'utente clicca "Carica altri contenuti" o una categoria/home, torna alla vista normale
        const origLoadMore = window.loadMorePhotos;
        if (typeof origLoadMore === 'function') {
            window.loadMorePhotos = function () {
                selectedRoll = null;
                renderRollsList();
                return origLoadMore.apply(this, arguments);
            };
        }

        const origGoToHome = window.goToHome;
        if (typeof origGoToHome === 'function') {
            window.goToHome = function () {
                selectedRoll = null;
                const res = origGoToHome.apply(this, arguments);
                renderRollsList();
                return res;
            };
        }

        return true;
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
                            <span class="rullini-drawer-title">${i18n.title}</span>
                            <button type="button" id="rullini-close-btn" class="rullini-close-btn" title="${i18n.close}" aria-label="${i18n.close}">&times;</button>
                        </div>
                        <div id="rullini-list" class="rullini-list"></div>
                    </div>
                </aside>
            </div>
        `;

        const gallery = document.getElementById('gallery-container');
        if (gallery && !document.getElementById('rullini-step-bar')) {
            const stepBar = document.createElement('div');
            stepBar.id = 'rullini-step-bar';
            stepBar.className = 'rullini-step-bar';
            stepBar.innerHTML = `
                <button type="button" id="rullini-prev-btn" class="rullini-step-btn">&lsaquo; ${i18n.prevRoll}</button>
                <span id="rullini-step-label" class="rullini-step-label"></span>
                <button type="button" id="rullini-next-btn" class="rullini-step-btn">${i18n.nextRoll} &rsaquo;</button>
            `;
            gallery.parentNode.insertBefore(stepBar, gallery);

            document.getElementById('rullini-prev-btn').addEventListener('click', () => {
                if (selectedRoll !== null && selectedRoll > 0) selectRoll(selectedRoll - 1);
            });
            document.getElementById('rullini-next-btn').addEventListener('click', () => {
                if (selectedRoll !== null && selectedRoll < getTotalRolls() - 1) selectRoll(selectedRoll + 1);
            });
        }

        document.getElementById('rullini-toggle-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            setDrawerOpen(!isOpen);
        });

        document.getElementById('rullini-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            setDrawerOpen(false);
        });

        // Su PC / fuori dal dock: cliccando altrove si richiude con animazione
        document.addEventListener('click', (e) => {
            if (!isOpen) return;
            const dock = document.getElementById('rullini-dock');
            if (dock && !dock.contains(e.target)) {
                setDrawerOpen(false);
            }
        });

        renderRollsList();
    }

    document.addEventListener('DOMContentLoaded', () => {
        mountUI();
        let tries = 0;
        const timer = setInterval(() => {
            tries++;
            if (hookGalleryPipeline()) {
                renderRollsList();
                clearInterval(timer);
            } else if (tries > 60) {
                clearInterval(timer);
            }
        }, 100);
    });
})();
