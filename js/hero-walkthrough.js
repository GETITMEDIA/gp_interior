/**
 * GP Interior - Pure Architectural Walkthrough Engine
 * - Desktop (>= 992px): Fixed Fullscreen 100vh Canvas Scroll-Scrubbing (240 WebP frames, zero text overlays)
 * - Mobile & Tablet (< 992px): Pure Fullscreen Autoplay Looping Video
 */

(function () {
    'use strict';

    const TOTAL_FRAMES = 240;
    const FRAME_DIR = 'hero_bg/frames/';
    const BREAKPOINT = 992;

    // Elements
    const desktopSection = document.getElementById('hero-desktop-section');
    const stickyPin = document.getElementById('hero-sticky-pin');
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
    const progressFill = document.getElementById('hero-progress-fill');
    const mobileVideo = document.getElementById('hero-mobile-video');

    // State
    const images = new Array(TOTAL_FRAMES);
    const loadedIndices = new Set();
    let currentRenderedIndex = -1;
    let isTicking = false;
    let isDesktop = window.innerWidth >= BREAKPOINT;

    // Helper: generate frame path (frame_0001.webp - frame_0240.webp)
    function getFrameSrc(index) {
        const frameNum = String(index + 1).padStart(4, '0');
        return FRAME_DIR + 'frame_' + frameNum + '.webp';
    }

    // Load individual frame
    function loadFrame(index, callback) {
        if (images[index] && images[index].complete) {
            if (callback) callback(images[index]);
            return;
        }

        const img = new Image();
        img.src = getFrameSrc(index);
        img.onload = function () {
            images[index] = img;
            loadedIndices.add(index);
            if (callback) callback(img);
        };
        img.onerror = function () {
            // Silently recover
        };
    }

    // Get closest loaded frame to prevent any blank frames
    function getClosestLoadedImage(targetIndex) {
        if (loadedIndices.has(targetIndex)) {
            return images[targetIndex];
        }
        if (loadedIndices.size === 0) {
            return null;
        }

        let closestIndex = -1;
        let minDiff = Infinity;
        for (const idx of loadedIndices) {
            const diff = Math.abs(idx - targetIndex);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = idx;
            }
        }
        return closestIndex !== -1 ? images[closestIndex] : null;
    }

    // Render image to canvas with cover fit (aspect ratio preserved)
    function renderFrame(targetIndex) {
        if (!ctx || !canvas) return;

        const imgToDraw = getClosestLoadedImage(targetIndex);
        if (!imgToDraw) return;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const imgRatio = imgToDraw.width / imgToDraw.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let renderWidth, renderHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            renderWidth = canvasWidth;
            renderHeight = canvasWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvasHeight - renderHeight) / 2;
        } else {
            renderWidth = canvasHeight * imgRatio;
            renderHeight = canvasHeight;
            offsetX = (canvasWidth - renderWidth) / 2;
            offsetY = 0;
        }

        ctx.drawImage(imgToDraw, offsetX, offsetY, renderWidth, renderHeight);
        currentRenderedIndex = targetIndex;
    }

    // Resize canvas to match window with DPR scaling
    function resizeCanvas() {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);

        if (currentRenderedIndex >= 0) {
            renderFrame(currentRenderedIndex);
        } else if (loadedIndices.has(0)) {
            renderFrame(0);
        }
    }

    // Progressive background preloader
    function startPreloading() {
        // Priority 1: First frame (immediate display)
        loadFrame(0, function () {
            if (isDesktop && currentRenderedIndex === -1) {
                renderFrame(0);
            }
        });

        // Priority 2: Keyframes across the sequence (every 5th frame)
        const step = 5;
        for (let i = step; i < TOTAL_FRAMES; i += step) {
            loadFrame(i);
        }

        // Priority 3: Remaining intermediate frames in idle batches
        setTimeout(function () {
            let i = 1;
            function loadBatch() {
                const batchSize = 12;
                let count = 0;
                while (i < TOTAL_FRAMES && count < batchSize) {
                    if (!loadedIndices.has(i)) {
                        loadFrame(i);
                        count++;
                    }
                    i++;
                }
                if (i < TOTAL_FRAMES) {
                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(loadBatch, { timeout: 200 });
                    } else {
                        setTimeout(loadBatch, 30);
                    }
                }
            }
            loadBatch();
        }, 250);
    }

    // Scroll listener: compute progress and render corresponding frame
    function onScroll() {
        if (!isDesktop || !desktopSection || !stickyPin) return;

        const rect = desktopSection.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;

        // Hide fixed pin when completely past the hero section
        if (rect.bottom <= 0) {
            stickyPin.style.visibility = 'hidden';
            return;
        } else {
            stickyPin.style.visibility = 'visible';
        }

        // Progress between 0.0 and 1.0 while hero section is in view
        const progress = Math.max(0, Math.min(1, Math.max(0, -rect.top) / totalScrollable));

        // Target frame (0 to 239)
        const targetFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

        if (targetFrameIndex !== currentRenderedIndex) {
            renderFrame(targetFrameIndex);
        }

        // Bottom progress line
        if (progressFill) {
            progressFill.style.width = (progress * 100).toFixed(1) + '%';
        }
    }

    // RequestAnimationFrame scroll throttling
    function handleScroll() {
        if (!isTicking) {
            window.requestAnimationFrame(function () {
                onScroll();
                isTicking = false;
            });
            isTicking = true;
        }
    }

    // Resize / breakpoint switcher
    function handleResize() {
        const currentlyDesktop = window.innerWidth >= BREAKPOINT;

        if (currentlyDesktop !== isDesktop) {
            isDesktop = currentlyDesktop;

            if (isDesktop) {
                if (mobileVideo) {
                    mobileVideo.pause();
                }
                resizeCanvas();
                onScroll();
            } else {
                if (mobileVideo) {
                    mobileVideo.play().catch(function () {});
                }
            }
        } else if (isDesktop) {
            resizeCanvas();
            onScroll();
        }
    }

    // Initialize engine
    function init() {
        if (isDesktop) {
            resizeCanvas();
            startPreloading();
            onScroll();
            if (mobileVideo) {
                mobileVideo.pause();
            }
        } else {
            if (mobileVideo) {
                mobileVideo.play().catch(function () {});
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
