// FormaliZESE - JavaScript Ultra Optimizado con Performance Manager
// Version 2.0 - Con Animation Budget, Smart Loading y Memory Management

(function() {
    'use strict';
    
    // ====================================
    // PERFORMANCE CONFIGURATION
    // ====================================
    const CONFIG = {
        MAX_CONCURRENT_ANIMATIONS: 3,
        ANIMATION_THROTTLE_MS: 16, // 60fps
        LAZY_LOAD_MARGIN: '50px',
        NETWORK_CHECK_INTERVAL: 5000,
        FORM_LOAD_TIMEOUT: 10000,
        SKELETON_MIN_DISPLAY: 800,
        DEBOUNCE_DELAY: 150,
        THROTTLE_DELAY: 100
    };
    
    // ====================================
    // PERFORMANCE MONITOR
    // ====================================
    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                fps: 60,
                animationsRunning: 0,
                memoryUsage: 0,
                networkSpeed: 'high'
            };
            this.frameCount = 0;
            this.lastFrameTime = performance.now();
            this.animationRegistry = new Map();
            this.observers = new Map();
            this.intervals = new Map();
            this.rafId = null;
        }
        
        start() {
            this.measureFPS();
            this.detectNetworkSpeed();
            this.monitorMemory();
        }
        
        measureFPS() {
            const now = performance.now();
            this.frameCount++;
            
            if (now >= this.lastFrameTime + 1000) {
                this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
                this.frameCount = 0;
                this.lastFrameTime = now;
                
                // Adjust quality based on FPS
                if (this.metrics.fps < 30) {
                    this.reduceQuality();
                } else if (this.metrics.fps > 50) {
                    this.restoreQuality();
                }
            }
            
            requestAnimationFrame(() => this.measureFPS());
        }
        
        detectNetworkSpeed() {
            if ('connection' in navigator) {
                const connection = navigator.connection;
                const effectiveType = connection.effectiveType;
                
                this.metrics.networkSpeed = 
                    effectiveType === '4g' ? 'high' :
                    effectiveType === '3g' ? 'medium' : 'low';
                
                connection.addEventListener('change', () => {
                    this.detectNetworkSpeed();
                });
            }
        }
        
        monitorMemory() {
            if (performance.memory) {
                setInterval(() => {
                    const used = performance.memory.usedJSHeapSize;
                    const total = performance.memory.totalJSHeapSize;
                    this.metrics.memoryUsage = (used / total) * 100;
                    
                    if (this.metrics.memoryUsage > 90) {
                        this.cleanupMemory();
                    }
                }, 10000);
            }
        }
        
        reduceQuality() {
            document.body.classList.add('reduce-animations');
            console.log('Performance: Reducing animation quality');
        }
        
        restoreQuality() {
            document.body.classList.remove('reduce-animations');
        }
        
        cleanupMemory() {
            // Clear unused observers
            this.observers.forEach((observer, key) => {
                if (!document.querySelector(key)) {
                    observer.disconnect();
                    this.observers.delete(key);
                }
            });
            
            // Force garbage collection hint
            if (window.gc) window.gc();
        }
        
        registerAnimation(id, animation) {
            if (this.animationRegistry.size >= CONFIG.MAX_CONCURRENT_ANIMATIONS) {
                // Pause oldest animation
                const oldest = this.animationRegistry.keys().next().value;
                this.pauseAnimation(oldest);
            }
            this.animationRegistry.set(id, animation);
            this.metrics.animationsRunning = this.animationRegistry.size;
        }
        
        pauseAnimation(id) {
            const animation = this.animationRegistry.get(id);
            if (animation && animation.pause) {
                animation.pause();
            }
            this.animationRegistry.delete(id);
        }
        
        cleanup() {
            // Clear all intervals
            this.intervals.forEach(interval => clearInterval(interval));
            this.intervals.clear();
            
            // Disconnect all observers
            this.observers.forEach(observer => observer.disconnect());
            this.observers.clear();
            
            // Cancel RAF
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
        }
    }
    
    const performanceMonitor = new PerformanceMonitor();
    
    // ====================================
    // SMART IFRAME LOADER
    // ====================================
    class SmartFormLoader {
        constructor() {
            this.formContainer = null;
            this.iframe = null;
            this.loadAttempts = 0;
            this.maxAttempts = 3;
            this.isLoaded = false;
        }
        
        init() {
            this.formContainer = document.querySelector('.form-container');
            if (!this.formContainer) return;
            
            this.createSkeletonLoader();
            this.loadForm();
        }
        
        createSkeletonLoader() {
            const skeleton = document.createElement('div');
            skeleton.className = 'form-skeleton-loader';
            skeleton.innerHTML = `
                <div class="skeleton-header">
                    <div class="skeleton-pulse skeleton-title"></div>
                    <div class="skeleton-pulse skeleton-subtitle"></div>
                </div>
                <div class="skeleton-form">
                    <div class="skeleton-field">
                        <div class="skeleton-pulse skeleton-label"></div>
                        <div class="skeleton-pulse skeleton-input"></div>
                    </div>
                    <div class="skeleton-field">
                        <div class="skeleton-pulse skeleton-label"></div>
                        <div class="skeleton-pulse skeleton-input"></div>
                    </div>
                    <div class="skeleton-field">
                        <div class="skeleton-pulse skeleton-label"></div>
                        <div class="skeleton-pulse skeleton-textarea"></div>
                    </div>
                    <div class="skeleton-pulse skeleton-button"></div>
                </div>
                <div class="skeleton-loading-text">
                    <span class="loading-dots">Cargando formulario<span>.</span><span>.</span><span>.</span></span>
                </div>
            `;
            
            // Add skeleton styles
            this.injectSkeletonStyles();
            
            // Insert skeleton before iframe
            this.iframe = this.formContainer.querySelector('iframe');
            if (this.iframe) {
                this.iframe.style.opacity = '0';
                this.iframe.style.transition = 'opacity 0.5s ease';
                this.formContainer.insertBefore(skeleton, this.iframe);
            }
        }
        
        injectSkeletonStyles() {
            if (document.getElementById('skeleton-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'skeleton-styles';
            styles.textContent = `
                .form-skeleton-loader {
                    padding: 2rem;
                    min-height: 450px;
                    animation: fadeIn 0.3s ease;
                }
                
                .skeleton-pulse {
                    background: linear-gradient(90deg, 
                        rgba(99, 102, 241, 0.1) 0%, 
                        rgba(99, 102, 241, 0.2) 50%, 
                        rgba(99, 102, 241, 0.1) 100%);
                    background-size: 200% 100%;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                    border-radius: 4px;
                }
                
                @keyframes skeleton-pulse {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                .skeleton-header { margin-bottom: 2rem; }
                .skeleton-title { height: 32px; width: 70%; margin-bottom: 0.5rem; }
                .skeleton-subtitle { height: 20px; width: 90%; }
                .skeleton-field { margin-bottom: 1.5rem; }
                .skeleton-label { height: 16px; width: 120px; margin-bottom: 0.5rem; }
                .skeleton-input { height: 40px; width: 100%; }
                .skeleton-textarea { height: 100px; width: 100%; }
                .skeleton-button { height: 48px; width: 200px; margin: 2rem auto 0; }
                
                .skeleton-loading-text {
                    text-align: center;
                    margin-top: 2rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .loading-dots span {
                    animation: dot-pulse 1.4s infinite ease-in-out both;
                }
                .loading-dots span:nth-child(2) { animation-delay: 0.16s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.32s; }
                .loading-dots span:nth-child(4) { animation-delay: 0.48s; }
                
                @keyframes dot-pulse {
                    0%, 80%, 100% { opacity: 0; }
                    40% { opacity: 1; }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .form-loaded {
                    opacity: 1 !important;
                }
                
                .reduce-animations .skeleton-pulse {
                    animation: none !important;
                    background: rgba(99, 102, 241, 0.1);
                }
            `;
            document.head.appendChild(styles);
        }
        
        loadForm() {
            if (!this.iframe) return;
            
            const startTime = Date.now();
            let skeletonRemoved = false;
            
            // Handle iframe load
            const handleLoad = () => {
                const loadTime = Date.now() - startTime;
                const minDisplayTime = Math.max(0, CONFIG.SKELETON_MIN_DISPLAY - loadTime);
                
                setTimeout(() => {
                    if (!skeletonRemoved) {
                        this.removeSkeletonAndShowForm();
                        skeletonRemoved = true;
                    }
                }, minDisplayTime);
                
                this.isLoaded = true;
                this.formContainer.classList.add('form-loaded');
            };
            
            // Handle errors
            const handleError = () => {
                this.loadAttempts++;
                if (this.loadAttempts < this.maxAttempts) {
                    setTimeout(() => this.retryLoad(), 2000);
                } else {
                    this.showErrorState();
                }
            };
            
            // Set loading timeout
            const loadTimeout = setTimeout(() => {
                if (!this.isLoaded) {
                    handleError();
                }
            }, CONFIG.FORM_LOAD_TIMEOUT);
            
            // Add event listeners
            this.iframe.addEventListener('load', () => {
                clearTimeout(loadTimeout);
                handleLoad();
            });
            
            this.iframe.addEventListener('error', handleError);
            
            // Force reload if lazy loading
            if (this.iframe.loading === 'lazy') {
                this.iframe.loading = 'eager';
                this.iframe.src = this.iframe.src;
            }
        }
        
        removeSkeletonAndShowForm() {
            const skeleton = this.formContainer.querySelector('.form-skeleton-loader');
            if (skeleton) {
                skeleton.style.opacity = '0';
                skeleton.style.transform = 'translateY(-10px)';
                skeleton.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    skeleton.remove();
                    if (this.iframe) {
                        this.iframe.style.opacity = '1';
                    }
                }, 300);
            }
        }
        
        retryLoad() {
            const skeleton = this.formContainer.querySelector('.skeleton-loading-text');
            if (skeleton) {
                skeleton.innerHTML = `
                    <span style="color: var(--warning);">Reintentando conexión...</span>
                `;
            }
            
            if (this.iframe) {
                this.iframe.src = this.iframe.src;
            }
        }
        
        showErrorState() {
            const skeleton = this.formContainer.querySelector('.form-skeleton-loader');
            if (skeleton) {
                skeleton.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" style="margin-bottom: 1rem;">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Error al cargar el formulario</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Por favor, intenta de nuevo o contacta por WhatsApp</p>
                        <button onclick="location.reload()" style="
                            background: var(--accent);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Reintentar</button>
                    </div>
                `;
            }
        }
    }
    
    // ====================================
    // ANIMATION MANAGER (VIEWPORT-BASED)
    // ====================================
    class AnimationManager {
        constructor() {
            this.animatedElements = new Map();
            this.rafId = null;
            this.isRunning = false;
            this.visibilityObserver = null;
        }
        
        init() {
            this.setupVisibilityObserver();
            this.optimizeExistingAnimations();
            this.startAnimationLoop();
        }
        
        setupVisibilityObserver() {
            this.visibilityObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        const element = entry.target;
                        const animationId = element.dataset.animationId;
                        
                        if (entry.isIntersecting) {
                            this.resumeAnimation(element, animationId);
                        } else {
                            this.pauseAnimation(element, animationId);
                        }
                    });
                },
                {
                    rootMargin: '50px',
                    threshold: 0
                }
            );
            
            // Observe all animated elements
            document.querySelectorAll('[data-animation]').forEach(element => {
                this.visibilityObserver.observe(element);
            });
        }
        
        optimizeExistingAnimations() {
            // Add data attributes to animated elements
            document.querySelectorAll('.urgency-badge.critical').forEach((el, i) => {
                el.dataset.animation = 'pulse';
                el.dataset.animationId = `pulse-${i}`;
            });
            
            document.querySelectorAll('.ticker-content').forEach((el, i) => {
                el.dataset.animation = 'scroll';
                el.dataset.animationId = `scroll-${i}`;
            });
            
            document.querySelectorAll('.orb').forEach((el, i) => {
                el.dataset.animation = 'float';
                el.dataset.animationId = `float-${i}`;
            });
            
            document.querySelectorAll('.gradient-text').forEach((el, i) => {
                el.dataset.animation = 'gradient';
                el.dataset.animationId = `gradient-${i}`;
            });
        }
        
        pauseAnimation(element, animationId) {
            if (element && element.style) {
                element.style.animationPlayState = 'paused';
                performanceMonitor.pauseAnimation(animationId);
            }
        }
        
        resumeAnimation(element, animationId) {
            if (element && element.style) {
                // Check if we're under the animation budget
                if (performanceMonitor.metrics.animationsRunning < CONFIG.MAX_CONCURRENT_ANIMATIONS) {
                    element.style.animationPlayState = 'running';
                    performanceMonitor.registerAnimation(animationId, element);
                }
            }
        }
        
        startAnimationLoop() {
            if (this.isRunning) return;
            this.isRunning = true;
            
            const animate = (timestamp) => {
                // Process animations in a single RAF
                this.updateAnimations(timestamp);
                
                if (this.isRunning) {
                    this.rafId = requestAnimationFrame(animate);
                }
            };
            
            this.rafId = requestAnimationFrame(animate);
        }
        
        updateAnimations(timestamp) {
            // Update counter animation
            this.updateCounter(timestamp);
            
            // Update other dynamic elements
            this.updateLiveElements(timestamp);
        }
        
        updateCounter(timestamp) {
            if (!this.lastCounterUpdate || timestamp - this.lastCounterUpdate > 5000) {
                const activeClients = document.getElementById('activeClients');
                if (activeClients && this.isElementInViewport(activeClients)) {
                    const current = parseInt(activeClients.textContent) || 47;
                    const change = Math.floor(Math.random() * 5) - 2;
                    const newValue = Math.max(42, Math.min(52, current + change));
                    activeClients.textContent = newValue;
                }
                this.lastCounterUpdate = timestamp;
            }
        }
        
        updateLiveElements(timestamp) {
            if (!this.lastLiveUpdate || timestamp - this.lastLiveUpdate > 10000) {
                // Update any live badges or indicators
                document.querySelectorAll('.status-dot').forEach(dot => {
                    if (this.isElementInViewport(dot)) {
                        dot.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            dot.style.transform = 'scale(1)';
                        }, 300);
                    }
                });
                this.lastLiveUpdate = timestamp;
            }
        }
        
        isElementInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        
        cleanup() {
            this.isRunning = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            if (this.visibilityObserver) {
                this.visibilityObserver.disconnect();
            }
        }
    }
    
    // ====================================
    // SMOOTH SCROLL WITH PERFORMANCE
    // ====================================
    function initSmoothScroll() {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    // Pause animations during scroll
                    document.body.classList.add('scrolling');
                    
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Resume animations after scroll
                    setTimeout(() => {
                        document.body.classList.remove('scrolling');
                    }, 1000);
                }
            });
        });
    }
    
    // ====================================
    // PROGRESSIVE IMAGE LOADING
    // ====================================
    class ProgressiveImageLoader {
        constructor() {
            this.images = [];
            this.observer = null;
        }
        
        init() {
            this.images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('loading' in HTMLImageElement.prototype) {
                // Browser supports native lazy loading
                this.enhanceNativeLazyLoad();
            } else {
                // Fallback for older browsers
                this.setupIntersectionObserver();
            }
        }
        
        enhanceNativeLazyLoad() {
            this.images.forEach(img => {
                // Add loading placeholder
                img.classList.add('loading');
                
                img.addEventListener('load', () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                });
                
                img.addEventListener('error', () => {
                    img.classList.remove('loading');
                    img.classList.add('error');
                    this.handleImageError(img);
                });
            });
        }
        
        setupIntersectionObserver() {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: CONFIG.LAZY_LOAD_MARGIN
                }
            );
            
            this.images.forEach(img => this.observer.observe(img));
        }
        
        loadImage(img) {
            img.classList.add('loading');
            
            const tempImg = new Image();
            tempImg.onload = () => {
                img.src = tempImg.src;
                img.classList.remove('loading');
                img.classList.add('loaded');
            };
            tempImg.onerror = () => {
                this.handleImageError(img);
            };
            tempImg.src = img.dataset.src || img.src;
        }
        
        handleImageError(img) {
            // Set fallback image
            if (img.alt && img.alt.includes('Daniel')) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EDaniel B.%3C/text%3E%3C/svg%3E';
            }
        }
    }
    
    // ====================================
    // SCROLL ANIMATIONS WITH STAGGER
    // ====================================
    class ScrollAnimations {
        constructor() {
            this.observer = null;
            this.animatedElements = new Set();
        }
        
        init() {
            this.setupObserver();
            this.observeElements();
        }
        
        setupObserver() {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                            // Stagger animations
                            setTimeout(() => {
                                entry.target.classList.add('visible');
                                this.animatedElements.add(entry.target);
                            }, index * 50);
                            
                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );
        }
        
        observeElements() {
            // Add fade-in to sections
            document.querySelectorAll('.section').forEach(section => {
                if (!section.classList.contains('fade-in')) {
                    section.classList.add('fade-in');
                    this.observer.observe(section);
                }
            });
            
            // Observe cards with stagger
            document.querySelectorAll('.problem-card, .solution-card, .benefit-item, .story-card').forEach(card => {
                card.classList.add('fade-in-card');
                this.observer.observe(card);
            });
        }
    }
    
    // ====================================
    // ENHANCED CARD EFFECTS
    // ====================================
    function initCardEffects() {
        const cards = document.querySelectorAll(
            '.problem-card, .solution-card, .benefit-item, .story-card'
        );
        
        // Use passive listeners for better scroll performance
        const options = { passive: true };
        
        cards.forEach(card => {
            let isAnimating = false;
            
            const animateCard = (direction) => {
                if (isAnimating) return;
                isAnimating = true;
                
                requestAnimationFrame(() => {
                    card.style.transform = direction === 'up' ? 'translateY(-8px)' : 'translateY(0)';
                    isAnimating = false;
                });
            };
            
            card.addEventListener('mouseenter', () => animateCard('up'), options);
            card.addEventListener('mouseleave', () => animateCard('down'), options);
            card.addEventListener('touchstart', () => animateCard('up'), options);
            card.addEventListener('touchend', () => animateCard('down'), options);
        });
    }
    
    // ====================================
    // ENHANCED FORM HANDLING
    // ====================================
    function initFormHandling() {
        window.addEventListener('message', handleFormMessage);
    }
    
    function handleFormMessage(event) {
        if (!event.origin.includes('leadconnectorhq.com')) return;
        
        if (event.data && event.data.type === 'form-submitted') {
            showNotification(
                '¡Información recibida! Te contactaremos en menos de 24 horas.',
                'success'
            );
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'engagement',
                    'event_label': 'consultation_form'
                });
            }
        }
    }
    
    // ====================================
    // NOTIFICATION SYSTEM (OPTIMIZED)
    // ====================================
    function showNotification(message, type = 'info') {
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) {
            existingNotif.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #6366f1, #4f46e5)'
        };
        
        const icons = {
            success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
            warning: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
            info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="12"/>'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 90vw;
            font-size: 14px;
            will-change: transform;
        `;
        
        notification.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${icons[type]}
            </svg>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        const removeTimeout = setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
        
        // Allow manual dismiss
        notification.addEventListener('click', () => {
            clearTimeout(removeTimeout);
            notification.remove();
        });
    }
    
    // ====================================
    // TICKER OPTIMIZATION
    // ====================================
    function initTicker() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) return;
        
        // Only animate when visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        tickerContent.style.animationPlayState = 'running';
                    } else {
                        tickerContent.style.animationPlayState = 'paused';
                    }
                });
            },
            { threshold: 0 }
        );
        
        observer.observe(tickerContent);
        
        // Pause on hover for better UX
        tickerContent.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        tickerContent.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
    
    // ====================================
    // WHATSAPP OPTIMIZATION
    // ====================================
    function initWhatsAppTooltip() {
        const whatsappFloat = document.querySelector('.whatsapp-float');
        if (!whatsappFloat) return;
        
        const tooltip = whatsappFloat.querySelector('.whatsapp-tooltip');
        const badge = whatsappFloat.querySelector('.whatsapp-badge');
        
        // Delayed tooltip show (only once)
        let tooltipShown = sessionStorage.getItem('tooltipShown');
        
        if (!tooltipShown && tooltip) {
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(-5px)';
                
                setTimeout(() => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateY(0)';
                    sessionStorage.setItem('tooltipShown', 'true');
                }, 5000);
            }, 3000);
        }
        
        // Optimized badge pulse
        if (badge) {
            let pulseInterval = setInterval(() => {
                if (document.hidden) return; // Don't animate if tab is hidden
                
                requestAnimationFrame(() => {
                    badge.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        badge.style.transform = 'scale(1)';
                    }, 300);
                });
            }, 5000);
            
            // Store interval for cleanup
            performanceMonitor.intervals.set('whatsapp-pulse', pulseInterval);
        }
    }
    
    // ====================================
    // UTILITY FUNCTIONS
    // ====================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ====================================
    // MOBILE OPTIMIZATIONS
    // ====================================
    function initMobileOptimizations() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        
        if (isMobile) {
            document.body.classList.add('touch-device');
            
            // Reduce animation complexity on mobile
            document.querySelectorAll('[class*="animate"]').forEach(el => {
                el.style.animationDuration = '0.3s';
            });
            
            // Disable heavy effects on mobile
            document.body.classList.add('reduce-effects');
        }
        
        // Handle viewport height
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setViewportHeight();
        window.addEventListener('resize', debounce(setViewportHeight, CONFIG.DEBOUNCE_DELAY));
        window.addEventListener('orientationchange', setViewportHeight);
    }
    
    // ====================================
    // ANIMATION STYLES INJECTION
    // ====================================
    function injectAnimationStyles() {
        if (document.getElementById('dynamic-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'dynamic-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .fade-in {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .fade-in.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .fade-in-card {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            
            .fade-in-card.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Performance optimizations */
            .reduce-animations * {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
            
            .scrolling * {
                pointer-events: none !important;
            }
            
            .reduce-effects .orb,
            .reduce-effects [class*="backdrop"] {
                display: none !important;
            }
            
            /* Image loading states */
            img.loading {
                filter: blur(5px);
                opacity: 0.5;
            }
            
            img.loaded {
                filter: blur(0);
                opacity: 1;
                transition: filter 0.3s ease, opacity 0.3s ease;
            }
            
            img.error {
                opacity: 0.3;
            }
            
            /* Optimized animations */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ====================================
    // SCROLL PERFORMANCE HANDLER
    // ====================================
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }
    
    function updateOnScroll() {
        ticking = false;
        
        const scrolled = window.pageYOffset;
        const whatsapp = document.querySelector('.whatsapp-float');
        
        if (whatsapp) {
            if (scrolled > 500) {
                whatsapp.style.opacity = '1';
                whatsapp.style.transform = 'scale(1)';
            } else {
                whatsapp.style.opacity = '0.7';
                whatsapp.style.transform = 'scale(0.9)';
            }
        }
        
        // Parallax effect (optimized)
        if (!document.body.classList.contains('reduce-effects')) {
            const orbs = document.querySelectorAll('.orb');
            orbs.forEach((orb, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                orb.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }
    }
    
    // ====================================
    // ERROR HANDLING
    // ====================================
    window.addEventListener('error', function(e) {
        if (e.filename && e.filename.includes('formalizese')) {
            console.error('FormaliZESE Error:', e.message);
            
            // Log to monitoring service if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    'description': e.message,
                    'fatal': false
                });
            }
        }
    });
    
    // ====================================
    // INITIALIZATION CONTROLLER
    // ====================================
    class InitController {
        constructor() {
            this.modules = {
                performance: performanceMonitor,
                formLoader: new SmartFormLoader(),
                animationManager: new AnimationManager(),
                imageLoader: new ProgressiveImageLoader(),
                scrollAnimations: new ScrollAnimations()
            };
        }
        
        init() {
            // Start performance monitoring first
            this.modules.performance.start();
            
            // Critical path
            this.initCritical();
            
            // Deferred path
            requestIdleCallback(() => this.initDeferred());
        }
        
        initCritical() {
            // Critical functionality that affects initial render
            injectAnimationStyles();
            this.modules.formLoader.init();
            initSmoothScroll();
            initMobileOptimizations();
        }
        
        initDeferred() {
            // Non-critical functionality
            this.modules.animationManager.init();
            this.modules.imageLoader.init();
            this.modules.scrollAnimations.init();
            initCardEffects();
            initFormHandling();
            initTicker();
            initWhatsAppTooltip();
            
            // Add scroll listener with throttling
            window.addEventListener('scroll', throttle(requestTick, CONFIG.THROTTLE_DELAY), { passive: true });
            
            // Mark as fully loaded
            document.body.classList.add('loaded');
            
            // Log performance metrics
            this.logPerformance();
        }
        
        logPerformance() {
            if (window.performance && performance.getEntriesByType) {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Page Load Metrics:', {
                        'DOM Interactive': Math.round(perfData.domInteractive) + 'ms',
                        'DOM Complete': Math.round(perfData.domComplete) + 'ms',
                        'Load Complete': Math.round(perfData.loadEventEnd) + 'ms',
                        'FPS': performanceMonitor.metrics.fps,
                        'Network': performanceMonitor.metrics.networkSpeed
                    });
                }
            }
        }
        
        cleanup() {
            // Cleanup all modules on page unload
            Object.values(this.modules).forEach(module => {
                if (module.cleanup) module.cleanup();
            });
        }
    }
    
    // ====================================
    // INITIALIZATION
    // ====================================
    const controller = new InitController();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => controller.init());
    } else {
        controller.init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => controller.cleanup());
    
    // Expose API for debugging
    window.FormaliZESE = {
        performance: performanceMonitor,
        controller: controller,
        version: '2.0.0'
    };
    
})();
