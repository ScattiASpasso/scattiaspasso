(function () {
    const MOBILE_BREAKPOINT = 768;
    const rootEl = document.getElementById('scopri-bar-root');
    const isEn = document.documentElement.lang === 'en' ||
        (rootEl && rootEl.dataset && rootEl.dataset.lang === 'en');

    const i18n = isEn
        ? {
            toggle: 'Discover',
            close: 'Close',
            empty: 'No stories available yet.'
        }
        : {
            toggle: 'Scopri',
            close: 'Chiudi',
            empty: 'Nessuna storia disponibile al momento.'
        };

    let isOpen = false;

    function isMobileViewport() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function getBookIconSvg(sizeClass) {
        return `
            <svg class="scopri-book-svg ${sizeClass || ''}" viewBox="0 0 28 24" width="22" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M14 5.2C11.3 3.4 7.3 3 3.5 3.6C2.9 3.7 2.5 4.2 2.5 4.8V18.8C2.5 19.5 3.1 20 3.8 19.9C7.4 19.3 11.3 19.8 14 21.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 5.2C16.7 3.4 20.7 3 24.5 3.6C25.1 3.7 25.5 4.2 25.5 4.8V18.8C25.5 19.5 24.9 20 24.2 19.9C20.6 19.3 16.7 19.8 14 21.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 5.2V21.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M6.2 8.2C8.4 7.9 10.6 8.1 12 8.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
                <path d="M6.2 11.6C8.4 11.3 10.6 11.5 12 12.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
                <path d="M16 8.7C17.4 8.1 19.6 7.9 21.8 8.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
                <path d="M16 12.1C17.4 11.5 19.6 11.3 21.8 11.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
            </svg>
        `;
    }

    function injectStyles() {
        if (document.getElementById('scopri-styles')) return;
        const style = document.createElement('style');
        style.id = 'scopri-styles';
        style.textContent = `
            #scopri-bar-root {
                position: relative;
                width: 100%;
                height: 0;
                z-index: 940;
            }
            #scopri-dock {
                position: absolute;
                left: -100px;
                top: 6px;
                z-index: 940;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
                pointer-events: none;
            }
            #scopri-dock > * {
                pointer-events: auto;
            }
            .scopri-toggle-btn {
                position: relative;
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 8px 14px;
                border-radius: 999px;
                background: linear-gradient(135deg, #11241c, #0d1612);
                border: 1.5px solid rgba(52, 211, 153, 0.78);
                color: #6ee7b7;
                font-family: 'Cinzel', serif;
                font-size: 0.76rem;
                font-weight: 700;
                letter-spacing: 1.8px;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(52, 211, 153, 0.24);
                backdrop-filter: blur(8px);
                transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, background 0.25s ease;
            }
            .scopri-toggle-btn:hover {
                transform: translateY(-1px);
                background: linear-gradient(135deg, #173327, #111f19);
                border-color: #d1fae5;
                color: #ffffff;
                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.85), 0 0 22px rgba(52, 211, 153, 0.45);
            }
            .scopri-book-svg--desktop {
                width: 19px;
                height: 17px;
                flex-shrink: 0;
            }
            .scopri-toggle-chevron {
                transition: transform 0.36s cubic-bezier(0.16, 1, 0.3, 1);
                display: inline-flex;
            }
            .scopri-toggle-btn.is-open .scopri-toggle-chevron {
                transform: rotate(180deg);
            }

            .scopri-mobile-icon-btn {
                display: none;
                position: fixed;
                top: 12px;
                right: 12px;
                z-index: 1050;
                align-items: center;
                justify-content: center;
                width: 38px;
                height: 40px;
                border-radius: 11px;
                background: linear-gradient(135deg, #11241c, #0d1612);
                border: 1.5px solid rgba(52, 211, 153, 0.82);
                color: #6ee7b7;
                cursor: pointer;
                padding: 0;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.78), 0 0 14px rgba(52, 211, 153, 0.28);
                backdrop-filter: blur(8px);
                transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
                -webkit-tap-highlight-color: transparent;
            }
            .scopri-mobile-icon-btn:active {
                transform: scale(0.95);
            }
            .scopri-mobile-icon-btn.is-open {
                border-color: #d1fae5;
                color: #ffffff;
                background: linear-gradient(135deg, #173327, #111f19);
            }
            .scopri-book-svg--mobile {
                width: 22px;
                height: 20px;
            }

            .scopri-drawer {
                position: absolute;
                top: 46px;
                left: 0;
                width: 248px;
                max-height: min(62vh, 460px);
                opacity: 0;
                pointer-events: none;
                overflow: hidden;
                clip-path: inset(0% 0% 100% 0% round 14px);
                transform: translateY(-12px);
                transform-origin: top center;
                border-radius: 14px;
                background: linear-gradient(180deg, rgba(17, 29, 23, 0.98) 0%, rgba(12, 16, 14, 0.98) 100%);
                border: 1px solid rgba(52, 211, 153, 0.48);
                box-shadow: 0 18px 42px rgba(0, 0, 0, 0.86);
                backdrop-filter: blur(10px);
                will-change: clip-path, transform, opacity;
                transition:
                    clip-path 0.48s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.48s cubic-bezier(0.16, 1, 0.3, 1),
                    opacity 0.24s ease;
            }
            .scopri-drawer.is-open {
                opacity: 1;
                pointer-events: auto;
                clip-path: inset(0% 0% 0% 0% round 14px);
                transform: translateY(0);
            }
            .scopri-drawer-inner {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: min(62vh, 460px);
            }
            .scopri-drawer-header {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(52, 211, 153, 0.16);
            }
            .scopri-close-btn {
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
            .scopri-close-btn:hover {
                border-color: #6ee7b7;
                color: #ffffff;
                background: rgba(52, 211, 153, 0.16);
            }

            .scopri-list {
                display: flex;
                flex-direction: column;
                gap: 5px;
                overflow-y: auto;
                padding-right: 4px;
                scrollbar-width: thin;
                scrollbar-color: rgba(52, 211, 153, 0.4) transparent;
            }
            .scopri-list::-webkit-scrollbar {
                width: 5px;
            }
            .scopri-list::-webkit-scrollbar-thumb {
                background: rgba(52, 211, 153, 0.4);
                border-radius: 999px;
            }
            .scopri-item-link {
                width: 100%;
                display: block;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid transparent;
                background: rgba(255, 255, 255, 0.02);
                color: #6ee7b7;
                text-decoration: none;
                font-family: 'Cinzel', serif;
                font-size: 0.8rem;
                font-weight: 700;
                transition: all 0.2s ease;
            }
            .scopri-item-link:hover {
                background: rgba(52, 211, 153, 0.12);
                border-color: rgba(52, 211, 153, 0.42);
                color: #ffffff;
            }
            .scopri-empty {
                padding: 10px;
                font-size: 0.8rem;
                color: #88a095;
                text-align: center;
            }

            @media (max-width: 768px) {
                #scopri-dock .scopri-toggle-btn {
                    display: none;
                }
                .scopri-mobile-icon-btn {
                    display: inline-flex;
                }
                #scopri-dock.scopri-dock--mobile-drawer {
                    position: fixed;
                    right: 12px;
                    left: auto;
                    top: 58px;
                    z-index: 1050;
                    align-items: flex-end;
                }
                #scopri-dock.scopri-dock--mobile-drawer .scopri-drawer {
                    position: relative;
                    top: 0;
                    left: auto;
                    right: 0;
                    width: min(250px, calc(100vw - 24px));
                }
                .scopri-drawer.is-open {
                    max-height: 46vh;
                }
                .scopri-drawer-inner {
                    max-height: 46vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function syncDrawerPlacement() {
        const dock = document.getElementById('scopri-dock');
        const drawer = document.getElementById('scopri-drawer');
        if (!dock || !drawer) return;

        const mobile = isMobileViewport();
        dock.classList.toggle('scopri-dock--mobile-drawer', mobile);

        if (mobile && isOpen) {
            if (dock.parentElement !== document.body) {
                document.body.appendChild(dock);
            }
        } else {
            const root = document.getElementById('scopri-bar-root');
            if (root && dock.parentElement !== root) {
                root.appendChild(dock);
            }
        }
    }

    function renderStoriesIndex() {
        const listEl = document.getElementById('scopri-list');
        if (!listEl) return;

        let items = [];
        if (Array.isArray(window.storiesData) && window.storiesData.length > 0) {
            items = window.storiesData
                .map(s => ({
                    href: s.href || '#',
                    title: (s.title || '').trim()
                }))
                .filter(s => s.title);
        } else {
            document.querySelectorAll('#stories-container .story-card').forEach(card => {
                const title = (card.querySelector('.story-title')?.textContent || '').trim();
                const href = card.getAttribute('href') || '#';
                if (title) {
                    items.push({ href, title });
                }
            });
        }

        if (!items.length) {
            listEl.innerHTML = `<div class="scopri-empty">${i18n.empty}</div>`;
            return;
        }

        listEl.innerHTML = items.map(item => `
            <a href="${item.href}" class="scopri-item-link">${item.title}</a>
        `).join('');
    }
    window.renderScopriStoriesIndex = renderStoriesIndex;

    function setDrawerOpen(nextState) {
        isOpen = nextState;
        if (isOpen) {
            renderStoriesIndex();
        }
        syncDrawerPlacement();

        const toggleBtn = document.getElementById('scopri-toggle-btn');
        const mobileBtn = document.getElementById('scopri-mobile-icon-btn');
        const drawer = document.getElementById('scopri-drawer');

        if (toggleBtn) {
            toggleBtn.classList.toggle('is-open', isOpen);
            toggleBtn.setAttribute('aria-expanded', String(isOpen));
        }
        if (mobileBtn) {
            mobileBtn.classList.toggle('is-open', isOpen);
            mobileBtn.setAttribute('aria-expanded', String(isOpen));
        }
        if (drawer) {
            drawer.classList.toggle('is-open', isOpen);
            drawer.setAttribute('aria-hidden', String(!isOpen));
        }
    }

    function mountUI() {
        const root = document.getElementById('scopri-bar-root');
        if (!root) return;

        injectStyles();

        root.innerHTML = `
            <div id="scopri-dock">
                <button type="button" id="scopri-toggle-btn" class="scopri-toggle-btn" aria-expanded="false" aria-controls="scopri-drawer">
                    ${getBookIconSvg('scopri-book-svg--desktop')}
                    <span>${i18n.toggle}</span>
                    <span class="scopri-toggle-chevron" aria-hidden="true">▾</span>
                </button>
                <aside id="scopri-drawer" class="scopri-drawer" aria-hidden="true">
                    <div class="scopri-drawer-inner">
                        <div class="scopri-drawer-header">
                            <button type="button" id="scopri-close-btn" class="scopri-close-btn" title="${i18n.close}" aria-label="${i18n.close}">&times;</button>
                        </div>
                        <div id="scopri-list" class="scopri-list"></div>
                    </div>
                </aside>
            </div>
        `;

        let mobileBtn = document.getElementById('scopri-mobile-icon-btn');
        if (!mobileBtn) {
            mobileBtn = document.createElement('button');
            mobileBtn.type = 'button';
            mobileBtn.id = 'scopri-mobile-icon-btn';
            mobileBtn.className = 'scopri-mobile-icon-btn';
            mobileBtn.title = i18n.toggle;
            mobileBtn.setAttribute('aria-label', i18n.toggle);
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileBtn.setAttribute('aria-controls', 'scopri-drawer');
            mobileBtn.innerHTML = getBookIconSvg('scopri-book-svg--mobile');
            mobileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setDrawerOpen(!isOpen);
            });
            document.body.appendChild(mobileBtn);
        }

        document.getElementById('scopri-toggle-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            setDrawerOpen(!isOpen);
        });

        document.getElementById('scopri-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            setDrawerOpen(false);
        });

        document.addEventListener('click', (e) => {
            if (!isOpen) return;
            const dock = document.getElementById('scopri-dock');
            const mBtn = document.getElementById('scopri-mobile-icon-btn');
            const insideDock = dock && dock.contains(e.target);
            const insideMobileBtn = mBtn && mBtn.contains(e.target);
            if (!insideDock && !insideMobileBtn) {
                setDrawerOpen(false);
            }
        });

        window.addEventListener('resize', () => {
            if (isOpen) {
                syncDrawerPlacement();
            }
        }, { passive: true });

        window.addEventListener('scroll', () => {
            if (isOpen) {
                setDrawerOpen(false);
            }
        }, { passive: true });

        renderStoriesIndex();
    }

    document.addEventListener('DOMContentLoaded', () => {
        mountUI();
        setTimeout(renderStoriesIndex, 0);
    });
})();
