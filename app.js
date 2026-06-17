/* ==========================================================================
   HESTALOGIX - CORE INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Header
    const initStickyHeader = () => {
        const header = document.querySelector('.site-header') || document.querySelector('.elementor-location-header');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    };
    initStickyHeader();

    // 2. Mobile Menu Toggle Fallback
    const initMobileMenu = () => {
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('.e-n-menu-toggle');
            if (!toggle) return;
            
            e.preventDefault();
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
            
            // Toggle open/close icons visibility
            const openIcon = toggle.querySelector('.e-open');
            const closeIcon = toggle.querySelector('.e-close');
            if (openIcon && closeIcon) {
                if (!expanded) {
                    openIcon.style.opacity = '0';
                    closeIcon.style.opacity = '1';
                } else {
                    openIcon.style.opacity = '1';
                    closeIcon.style.opacity = '0';
                }
            }

            // Find GutenKit/Elementor menu containers to toggle
            const menuWrapper = toggle.closest('.elementor-widget-n-menu');
            if (menuWrapper) {
                const wrappers = menuWrapper.querySelectorAll('.e-n-menu-wrapper, .e-n-menu-heading, .e-n-menu');
                wrappers.forEach(w => {
                    w.classList.toggle('e-active');
                    if (w.classList.contains('e-active')) {
                        w.style.display = 'flex';
                    } else {
                        w.style.display = '';
                    }
                });
            }
        });

        // Toggle submenus inside mobile menu
        document.addEventListener('click', (e) => {
            const titleLink = e.target.closest('.e-n-menu-title');
            if (!titleLink) return;
            
            // Apply only on mobile size
            if (window.innerWidth <= 1024) {
                const parentItem = titleLink.closest('.e-n-menu-item');
                if (parentItem) {
                    const content = parentItem.querySelector('.e-n-menu-content');
                    if (content) {
                        e.preventDefault();
                        content.classList.toggle('e-active');
                        if (content.classList.contains('e-active')) {
                            content.style.display = 'flex';
                            content.style.position = 'relative';
                            content.style.width = '100%';
                            
                            // Make child elements visible
                            const childCon = content.querySelector('.e-con');
                            if (childCon) {
                                childCon.style.display = 'flex';
                                childCon.classList.add('e-active');
                            }
                        } else {
                            content.style.display = 'none';
                        }
                    }
                }
            }
        });
    };
    initMobileMenu();

    // 3. FAQ Accordion Click Fallback
    const initAccordion = () => {
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.eael-accordion-header');
            if (!header) return;
            
            e.preventDefault();
            const listWrapper = header.closest('.eael-accordion-list');
            if (!listWrapper) return;
            
            const content = listWrapper.querySelector('.eael-accordion-content');
            const parentAccordion = header.closest('.eael-adv-accordion');
            
            const isOpen = header.classList.contains('active') || header.classList.contains('active-default');
            
            // Close all items in this accordion first
            if (parentAccordion) {
                parentAccordion.querySelectorAll('.eael-accordion-header').forEach(h => {
                    h.classList.remove('active', 'active-default');
                });
                parentAccordion.querySelectorAll('.eael-accordion-content').forEach(c => {
                    c.classList.remove('active', 'active-default');
                    c.style.display = 'none';
                });
            }
            
            // Toggle clicked item
            if (!isOpen) {
                header.classList.add('active');
                if (content) {
                    content.classList.add('active');
                    content.style.display = 'block';
                }
            }
        });
    };
    initAccordion();

    // 4. Off-Canvas Drawer Fallback
    const initOffCanvas = () => {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;
            
            const href = a.getAttribute('href');
            if (href && href.includes('off_canvas')) {
                e.preventDefault();
                
                // Extract base64 parameters from Elementor action links
                const match = href.match(/settings%3D([^&]+)/) || href.match(/settings=([^&]+)/);
                if (match) {
                    try {
                        const b64 = decodeURIComponent(match[1]);
                        const jsonStr = atob(b64);
                        const settings = JSON.parse(jsonStr);
                        let id = settings.id;
                        if (id === '29912dc') {
                            id = '8c11d01';
                        }
                        const action = settings.displayMode || (href.includes('close') ? 'close' : 'open');
                        
                        const targetDrawer = document.getElementById('off-canvas-' + id);
                        if (targetDrawer) {
                            const isOpen = (action === 'open') || (href.includes('open') && !href.includes('close'));
                            if (isOpen) {
                                // Close all other drawers first
                                document.querySelectorAll('.e-off-canvas').forEach(d => {
                                    if (d !== targetDrawer) {
                                        d.setAttribute('aria-hidden', 'true');
                                        d.setAttribute('inert', '');
                                    }
                                });
                                targetDrawer.setAttribute('aria-hidden', 'false');
                                targetDrawer.removeAttribute('inert');
                                document.body.style.overflow = 'hidden'; // Lock scrolling
                            } else {
                                targetDrawer.setAttribute('aria-hidden', 'true');
                                targetDrawer.setAttribute('inert', '');
                                document.body.style.overflow = ''; // Unlock scrolling
                            }
                        }
                    } catch (err) {
                        console.error('Error handling off-canvas base64 settings', err);
                    }
                }
            }
        });

        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('e-off-canvas__overlay')) {
                const drawer = e.target.closest('.e-off-canvas');
                if (drawer) {
                    drawer.setAttribute('aria-hidden', 'true');
                    drawer.setAttribute('inert', '');
                    document.body.style.overflow = '';
                }
            }
        });
    };
    initOffCanvas();

    // 5. Stats Counter Animation using IntersectionObserver
    const initCounters = () => {
        const counters = document.querySelectorAll('.elementor-counter-number, .counter-value');
        if (counters.length === 0) return;
        
        const duration = 2000; // 2 seconds animation time

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const valAttr = counter.getAttribute('data-to-value') || counter.getAttribute('data-target') || '0';
                    const target = parseInt(valAttr, 10);
                    const startTime = performance.now();

                    const updateCounter = (now) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Ease-out quadratic calculation
                        const easeProgress = progress * (2 - progress);
                        const currentValue = Math.floor(easeProgress * target);
                        
                        counter.textContent = currentValue.toLocaleString('en-US');

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target.toLocaleString('en-US');
                        }
                    };

                    requestAnimationFrame(updateCounter);
                    obs.unobserve(counter); // Trigger once
                }
            });
        }, { threshold: 0.1 });

        counters.forEach(counter => observer.observe(counter));
    };
    initCounters();

    // 6. Form Submission (Callback Form & Newsletter)
    const initForms = () => {
        // Find and handle Toast notifications
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            
            // Add style for toast dynamically to avoid breaking layouts
            const style = document.createElement('style');
            style.textContent = `
                .toast-container {
                    position: fixed;
                    bottom: 30px;
                    left: 30px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                }
                .toast-msg {
                    background-color: #2e7d32;
                    color: white;
                    padding: 15px 25px;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-size: 0.95rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    pointer-events: auto;
                }
                .toast-msg.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .toast-msg i {
                    font-size: 1.15rem;
                }
            `;
            document.head.appendChild(style);
        }

        const showToast = (message) => {
            const toast = document.createElement('div');
            toast.className = 'toast-msg';
            toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 50);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 500);
            }, 4000);
        };

        // Handle all submit actions for wpforms forms
        document.addEventListener('submit', (e) => {
            const form = e.target.closest('form');
            if (!form) return;
            
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent || submitBtn.value : 'Submit';
            const spinner = form.querySelector('.wpforms-submit-spinner');
            
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                if (submitBtn.tagName === 'INPUT') submitBtn.value = 'Sending...';
                submitBtn.disabled = true;
            }
            if (spinner) {
                spinner.style.display = 'inline-block';
            }

            // Simulate form processing delay
            setTimeout(() => {
                // Reset form inputs
                form.reset();
                
                // Hide spinner
                if (spinner) spinner.style.display = 'none';
                
                // Restore button
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    if (submitBtn.tagName === 'INPUT') submitBtn.value = originalBtnText;
                    submitBtn.disabled = false;
                }

                // Check form type (subscription or contact)
                const emailInput = form.querySelector('input[type="email"]');
                const nameInput = form.querySelector('input[placeholder*="name"]');
                
                // Close any open drawers
                const openDrawer = document.querySelector('.e-off-canvas[aria-hidden="false"]');
                if (openDrawer) {
                    openDrawer.setAttribute('aria-hidden', 'true');
                    openDrawer.setAttribute('inert', '');
                    document.body.style.overflow = '';
                }

                if (nameInput) {
                    showToast(`Thank you, ${nameInput.value || 'there'}! Your callback request has been received.`);
                } else if (emailInput) {
                    showToast(`Thank you! You have successfully subscribed with ${emailInput.value}.`);
                } else {
                    showToast(`Thank you! Your submission has been processed.`);
                }
            }, 1200);
        });
    };
    initForms();

    // 7. Hero Banner Slide Rotation (Fallback)
    const initHeroSlider = () => {
        // Elementor uses Swiper. If Swiper doesn't load or is stuck, we can auto-rotate slides.
        // On the original homepage, the sliders are nested inside swiper-wrapper.
        const swiperWrappers = document.querySelectorAll('.swiper-wrapper');
        swiperWrappers.forEach(wrapper => {
            // Check if swiper is initialized by checking classes
            const isSwiperInit = wrapper.parentElement.classList.contains('swiper-initialized');
            if (isSwiperInit) return; // Let original Swiper handle it
            
            const slides = wrapper.querySelectorAll('.swiper-slide');
            if (slides.length <= 1) return;
            
            let current = 0;
            setInterval(() => {
                slides[current].classList.remove('swiper-slide-active');
                slides[current].style.display = 'none';
                current = (current + 1) % slides.length;
                slides[current].classList.add('swiper-slide-active');
                slides[current].style.display = 'block';
            }, 4000);
        });
    };
    initHeroSlider();

    // 8. Back to Top Button
    const initBackToTop = () => {
        // Check if back-to-top button exists or create it
        let btn = document.getElementById('back-to-top-btn') || document.querySelector('.back-to-top');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'back-to-top-btn';
            btn.className = 'back-to-top';
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 19 25" fill="none">
                    <path d="M9.5 23.018L9.5 2.46777" stroke="white" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"></path>
                    <path d="M17 9.22007L9.5 1L2 9.22007" stroke="white" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"></path>
                </svg>
            `;
            document.body.appendChild(btn);
            
            const style = document.createElement('style');
            style.textContent = `
                .back-to-top {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 48px;
                    height: 48px;
                    background-color: #2f9ed6;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                    cursor: pointer;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    z-index: 999;
                    border: none;
                    outline: none;
                }
                .back-to-top.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .back-to-top:hover {
                    background-color: #f36f00;
                    transform: translateY(-3px);
                }
            `;
            document.head.appendChild(style);
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        });

        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };
    initBackToTop();
});
