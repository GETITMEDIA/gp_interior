/**
 * GP Interior — 2026 Premium Interactions & Enhancement Layer
 * - IntersectionObserver reveal animations (prefers-reduced-motion aware)
 * - Auto-upgraded Fancybox lightbox triggers on gallery/portfolio images
 * - Smooth animated metric counters
 * - Clean floating WhatsApp & Back-to-Top widget
 * - Non-blocking image lazy-loading for below-the-fold cards
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initScrollReveals() {
    var revealSelectors = [
      '.gp-about-intro',
      '.gp-about-visual',
      '.gp-about-card',
      '.gp-about-founder-card',
      '.services-block',
      '.services-block-two',
      '.services-block-three',
      '.services-block-four',
      '.services-block-five',
      '.story-block',
      '.story-block-two',
      '.gp-atelier-visual-card',
      '.gp-project-card',
      '.project-block',
      '.gallery-block',
      '.branded-section .image-column',
      '.gp-branded-feature-card',
      '.team-block',
      '.news-block',
      '.gp-trust-item',
      '.gp-commitment-card',
      '.gp-commitment-pill',
      '.product-tab-section .image-column',
      '.product-tab-section .tab-btn',
      '.testimonial-block-two',
      '.sponsors-section .image-box',
      '.sponsors-section-two .image-box',
      '.gp-cta-box',
      '.gp-contact-form-card',
      '.gp-contact-card',
      '.gp-showroom-hub-card'
    ];

    var textSelectors = [
      '.sec-title .title',
      '.sec-title h2',
      '.sec-title .text',
      '.sec-title-two .title',
      '.sec-title-two h2',
      '.sec-title-two .text',
      '.about-section .title-box .bold-text',
      '.about-section .title-box .text',
      '.gp-about-eyebrow',
      '.gp-about-main-title',
      '.gp-about-lead',
      '.gp-about-body',
      '.gp-about-highlights li',
      '.gp-commitment-section .sec-title h2',
      '.gp-commitment-section p',
      '.gp-cta-eyebrow',
      '.gp-cta-box h2',
      '.gp-cta-box p',
      '.gp-cta-actions',
      '.product-tab-section .content-column .sec-title',
      '.sponsors-section .title-box h2',
      '.sponsors-section .title-box .text'
    ];

    var footerSelectors = [
      'footer.main-footer .gp-footer-brand',
      'footer.main-footer .gp-footer-grid > div'
    ];

    var blockNodes = Array.prototype.slice.call(document.querySelectorAll(revealSelectors.join(',') + ',[data-gp-reveal]'))
      .filter(function (el) { return !el.closest('.owl-carousel'); });

    var textNodes = Array.prototype.slice.call(document.querySelectorAll(textSelectors.join(',') + ',[data-gp-text-reveal]'))
      .filter(function (el) { return !el.closest('.owl-carousel') && !el.closest('.gp-cta-box') && !el.closest('.gp-about-intro'); });

    // For CTA box & about intro, allow text stagger inside without hiding parent container twice
    var ctaTextNodes = Array.prototype.slice.call(document.querySelectorAll('.gp-cta-eyebrow, .gp-cta-box h2, .gp-cta-box p, .gp-cta-actions'));
    var allTextNodes = textNodes.concat(ctaTextNodes);

    var footerNodes = Array.prototype.slice.call(document.querySelectorAll(footerSelectors.join(',')));

    blockNodes.forEach(function (el, idx) {
      if (!el.hasAttribute('data-gp-reveal')) {
        el.setAttribute('data-gp-reveal', '');
        el.style.transitionDelay = Math.min((idx % 4) * 70, 210) + 'ms';
      }
    });

    allTextNodes.forEach(function (el, idx) {
      if (!el.hasAttribute('data-gp-text-reveal')) {
        el.setAttribute('data-gp-text-reveal', '');
        el.style.transitionDelay = Math.min((idx % 4) * 80, 240) + 'ms';
      }
    });

    footerNodes.forEach(function (el, idx) {
      if (!el.hasAttribute('data-gp-footer-reveal')) {
        el.setAttribute('data-gp-footer-reveal', '');
        el.style.transitionDelay = Math.min((idx % 4) * 85, 255) + 'ms';
      }
    });

    var allAnimatedNodes = blockNodes.concat(allTextNodes).concat(footerNodes);
    if (!allAnimatedNodes.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      allAnimatedNodes.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    function revealVisibleNodes() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      allAnimatedNodes.forEach(function (el) {
        if (el.classList.contains('is-revealed')) return;
        var rect = el.getBoundingClientRect();
        if (rect.top <= vh + 140) {
          el.classList.add('is-revealed');
        }
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '140px 0px 140px 0px' });

    allAnimatedNodes.forEach(function (el) { observer.observe(el); });
    window.addEventListener('scroll', revealVisibleNodes, { passive: true });
    document.addEventListener('scroll', revealVisibleNodes, { passive: true, capture: true });
    window.addEventListener('resize', revealVisibleNodes, { passive: true });
    revealVisibleNodes();
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-gp-count]');
    if (!counters.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-gp-count'), 10);
        var suffix = el.getAttribute('data-gp-suffix') || '';
        if (isNaN(target) || prefersReduced) {
          el.textContent = target + suffix;
          observer.unobserve(el);
          return;
        }
        var duration = 550;
        var start = performance.now();
        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target + suffix;
          }
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.25 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function enhanceGalleryLightboxes() {
    // Wrap unlinked gallery/portfolio images inside Fancybox zoom links
    var cardImages = document.querySelectorAll('.blog-page-section .news-block .image img, .about-section .services-block .image img, .update-post-img img');
    cardImages.forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      var parent = img.parentElement;
      if (!parent || parent.tagName === 'A') return;
      // Only add automatic lightbox inside dedicated portfolio/gallery/update pages
      if (!img.closest('.blog-page-section') && !img.closest('.update-post-img') && !img.closest('[data-gp-gallery-grid]')) {
        return;
      }
      var src = img.getAttribute('src');
      if (!src) return;
      var link = document.createElement('a');
      link.href = src;
      link.className = 'gp-lightbox-trigger lightbox-image';
      link.setAttribute('data-fancybox', 'gp-portfolio');
      link.setAttribute('aria-label', img.getAttribute('alt') || 'View full project photograph');
      parent.insertBefore(link, img);
      link.appendChild(img);

      var badge = document.createElement('span');
      badge.className = 'gp-lightbox-badge';
      badge.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';
      link.appendChild(badge);
    });
  }

  function injectFloatingControls() {
    if (document.querySelector('.gp-floating-actions')) return;

    var wrap = document.createElement('div');
    wrap.className = 'gp-floating-actions';

    var topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'gp-float-top';
    topBtn.setAttribute('aria-label', 'Scroll back to top');
    topBtn.innerHTML = '<i class="fa fa-angle-up" aria-hidden="true"></i>';
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    var waLink = document.createElement('a');
    waLink.href = 'https://wa.me/919566795017?text=' + encodeURIComponent('Hello GP Interior, I would like to request a quote for UPVC/PVC interior work.');
    waLink.target = '_blank';
    waLink.rel = 'noopener noreferrer';
    waLink.className = 'gp-float-wa';
    waLink.setAttribute('aria-label', 'Chat with GP Interior on WhatsApp');
    waLink.innerHTML = '<i class="fa fa-whatsapp" aria-hidden="true"></i>';

    wrap.appendChild(topBtn);
    wrap.appendChild(waLink);
    document.body.appendChild(wrap);

    function toggleTopButton() {
      if (window.scrollY > 420) {
        topBtn.classList.add('is-visible');
      } else {
        topBtn.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', toggleTopButton, { passive: true });
    toggleTopButton();
  }

  function syncActiveNavState() {
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var servicePages = ['services.html', 'bedser.html', 'falseser.html', 'modularser.html', 'poojaser.html', 'tvser.html', 'warser.html'];
    var projectPages = ['boxport.html', 'dressport.html', 'kitchenport.html', 'laftport.html', 'poojaport.html', 'roomport.html', 'tvport.html'];
    var targetMatch = page;
    if (servicePages.indexOf(page) !== -1) targetMatch = 'services.html';
    else if (projectPages.indexOf(page) !== -1) targetMatch = 'boxport.html';

    document.querySelectorAll('.main-header .navigation > li').forEach(function (li) {
      li.classList.remove('current');
      var link = li.querySelector('a');
      if (!link) return;
      var href = (link.getAttribute('href') || '').toLowerCase();
      if (href === targetMatch || href === page) {
        li.classList.add('current');
      }
    });
  }

  function syncStickyHeader() {
    var stickyRight = document.querySelector('.sticky-header .right-col');
    var topActions = document.querySelector('.header-upper .gp-header-actions') || document.querySelector('.header-upper .social-outer-box');
    if (stickyRight && topActions && !stickyRight.querySelector('.gp-header-actions') && !stickyRight.querySelector('.social-outer-box')) {
      stickyRight.appendChild(topActions.cloneNode(true));
    }
  }

  function initReviewsCarousel() {
    if (window.jQuery && window.jQuery.fn.owlCarousel) {
      var $carousel = window.jQuery('.gp-reviews-carousel');
      if ($carousel.length) {
        $carousel.owlCarousel({
          loop: true,
          margin: 28,
          nav: true,
          dots: true,
          autoplay: true,
          autoplayTimeout: 4000,
          autoplayHoverPause: true,
          smartSpeed: 700,
          navText: [
            '<span class="fa fa-angle-left" aria-label="Previous"></span>',
            '<span class="fa fa-angle-right" aria-label="Next"></span>'
          ],
          responsive: {
            0: {
              items: 1,
              margin: 16
            },
            768: {
              items: 1,
              margin: 20
            },
            992: {
              items: 2,
              margin: 28
            }
          }
        });
      }
    }
  }

  function initSmartNavbar() {
    var stickyHeader = document.querySelector('.sticky-header');
    var mainHeader = document.querySelector('.main-header');
    if (!stickyHeader && !mainHeader) return;

    var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var ticking = false;
    var scrollThreshold = 80;
    var scrollDelta = 6;

    function updateNavbar() {
      var currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // Don't auto-hide when mobile drawer is open
      if (document.body.classList.contains('mobile-menu-visible')) {
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      var diff = currentScrollY - lastScrollY;

      // 1. At or near top of page (scrollY <= 90px — top header is visible)
      if (currentScrollY <= 90) {
        if (stickyHeader) {
          stickyHeader.classList.remove('gp-nav-visible');
          stickyHeader.classList.add('gp-nav-hidden');
        }
        if (mainHeader) {
          mainHeader.classList.remove('gp-mobile-nav-hidden');
          mainHeader.classList.remove('gp-mobile-scrolled');
        }
      }
      // 2. Scrolling DOWN -> Hide navbar
      else if (diff > scrollDelta && currentScrollY > scrollThreshold) {
        if (stickyHeader) {
          stickyHeader.classList.remove('gp-nav-visible');
          stickyHeader.classList.add('gp-nav-hidden');
        }
        if (mainHeader) {
          mainHeader.classList.add('gp-mobile-nav-hidden');
          mainHeader.classList.add('gp-mobile-scrolled');
        }
      }
      // 3. Scrolling UP -> Reveal navbar
      else if (diff < -scrollDelta) {
        if (stickyHeader) {
          stickyHeader.classList.remove('gp-nav-hidden');
          stickyHeader.classList.add('gp-nav-visible');
        }
        if (mainHeader) {
          mainHeader.classList.remove('gp-mobile-nav-hidden');
          mainHeader.classList.add('gp-mobile-scrolled');
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNavbar();
  }

  function initContactFormValidation() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('gp-form-name');
    var emailInput = document.getElementById('gp-form-email');
    var serviceSelect = document.getElementById('gp-form-service');
    var phoneInput = document.getElementById('gp-form-phone');
    var phoneGroup = document.getElementById('gp-phone-group');
    var phoneCounter = document.getElementById('gp-phone-counter');
    var messageTextarea = document.getElementById('gp-form-message');
    var submitBtn = document.getElementById('gp-submit-btn');
    var successBanner = document.getElementById('gp-form-success');
    var directWaLink = document.getElementById('gp-direct-wa-link');

    var feedbackName = document.getElementById('feedback-name');
    var feedbackEmail = document.getElementById('feedback-email');
    var feedbackService = document.getElementById('feedback-service');
    var feedbackPhone = document.getElementById('feedback-phone');

    var hasSubmitted = false;

    // --- Phone: Strict Digits Only & +91 Prefix Handling ---
    if (phoneInput) {
      // 1. Block keydown for non-digit keys
      phoneInput.addEventListener('keydown', function(e) {
        var allowedKeys = [
          'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Home', 'End'
        ];
        if (allowedKeys.indexOf(e.key) !== -1) return;

        // Allow Ctrl / Cmd combinations (Copy, Paste, Cut, Select All)
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].indexOf(e.key.toLowerCase()) !== -1) {
          return;
        }

        // Block any character that is not a numeric digit 0-9
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      // 2. Strip any non-digit on input & update counter
      phoneInput.addEventListener('input', function() {
        var clean = this.value.replace(/\D/g, '');
        if (clean.length > 10) {
          clean = clean.slice(0, 10);
        }
        this.value = clean;
        updatePhoneCounter();

        if (hasSubmitted) {
          validatePhone();
        }
      });

      // 3. Paste sanitization (strip symbols, handle +91 / 91 prefix in pasted string)
      phoneInput.addEventListener('paste', function(e) {
        e.preventDefault();
        var clipboardData = e.clipboardData || window.clipboardData;
        var pastedText = clipboardData ? clipboardData.getData('text') : '';
        var clean = pastedText.replace(/\D/g, '');

        // If user copied 12-digit format with 91 at start (e.g. 919566795017), strip 91
        if (clean.length === 12 && clean.indexOf('91') === 0) {
          clean = clean.slice(2);
        } else if (clean.length === 11 && clean.indexOf('0') === 0) {
          // If copied with leading 0 (e.g. 09566795017), strip 0
          clean = clean.slice(1);
        }

        if (clean.length > 10) {
          clean = clean.slice(0, 10);
        }

        this.value = clean;
        updatePhoneCounter();

        if (hasSubmitted) {
          validatePhone();
        }
      });

      // 4. Focus / Blur styling on composite input group
      phoneInput.addEventListener('focus', function() {
        if (phoneGroup) phoneGroup.classList.add('is-focused');
      });

      phoneInput.addEventListener('blur', function() {
        if (phoneGroup) phoneGroup.classList.remove('is-focused');
        if (hasSubmitted) {
          validatePhone();
        }
      });
    }

    function updatePhoneCounter() {
      if (!phoneInput || !phoneCounter) return;
      var len = phoneInput.value.length;
      if (len === 10) {
        phoneCounter.textContent = '✓ 10 digits';
        phoneCounter.classList.add('is-complete');
      } else {
        phoneCounter.textContent = len + '/10 digits';
        phoneCounter.classList.remove('is-complete');
      }
    }

    // --- Quick Add Requirement Chips ---
    var tagChips = form.querySelectorAll('.gp-tag-chip');
    tagChips.forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        e.preventDefault();
        var tag = this.getAttribute('data-tag');
        if (!tag || !messageTextarea) return;

        var currentVal = messageTextarea.value.trim();
        if (currentVal.indexOf(tag) !== -1) {
          // Already added
          return;
        }

        if (currentVal.length === 0) {
          messageTextarea.value = 'Interested in: ' + tag;
        } else {
          messageTextarea.value = currentVal + ', ' + tag;
        }
        this.classList.add('active');
        messageTextarea.focus();
      });
    });

    // --- Feedback Helpers ---
    function setFeedback(feedbackEl, controlEl, isValid, message) {
      if (!feedbackEl) return;
      if (isValid) {
        feedbackEl.classList.remove('active');
        feedbackEl.innerHTML = '';
        if (controlEl) {
          controlEl.classList.remove('is-invalid');
          controlEl.classList.add('is-valid');
        }
      } else {
        feedbackEl.classList.add('active');
        feedbackEl.innerHTML = '<i class="fa fa-exclamation-circle"></i> <span>' + message + '</span>';
        if (controlEl) {
          controlEl.classList.add('is-invalid');
          controlEl.classList.remove('is-valid');
        }
      }
    }

    // --- Validation Rules ---
    function validateName() {
      if (!nameInput) return true;
      var val = nameInput.value.trim();
      if (!val) {
        setFeedback(feedbackName, nameInput, false, 'Please enter your full name.');
        return false;
      }
      if (val.length < 2) {
        setFeedback(feedbackName, nameInput, false, 'Name must be at least 2 characters long.');
        return false;
      }
      if (!/^[a-zA-Z\s.']{2,60}$/.test(val)) {
        setFeedback(feedbackName, nameInput, false, 'Please enter a valid name using letters only.');
        return false;
      }
      setFeedback(feedbackName, nameInput, true);
      return true;
    }

    function validateEmail() {
      if (!emailInput) return true;
      var val = emailInput.value.trim();
      if (val.length > 0) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          setFeedback(feedbackEmail, emailInput, false, 'Please enter a valid email address (e.g. name@example.com).');
          return false;
        }
      }
      setFeedback(feedbackEmail, emailInput, true);
      return true;
    }

    function validateService() {
      if (!serviceSelect) return true;
      var val = serviceSelect.value;
      if (!val || val === '') {
        setFeedback(feedbackService, serviceSelect, false, 'Please choose an interior service from the dropdown.');
        return false;
      }
      setFeedback(feedbackService, serviceSelect, true);
      return true;
    }

    function validatePhone() {
      if (!phoneInput) return true;
      var val = phoneInput.value.trim();
      var targetControl = phoneGroup || phoneInput;

      if (!val) {
        setFeedback(feedbackPhone, targetControl, false, 'Please enter your 10-digit mobile number.');
        return false;
      }
      if (val.length < 10) {
        setFeedback(feedbackPhone, targetControl, false, 'Mobile number must be 10 digits (currently ' + val.length + ').');
        return false;
      }
      if (!/^[6-9]/.test(val)) {
        setFeedback(feedbackPhone, targetControl, false, 'Indian mobile numbers must start with 6, 7, 8, or 9.');
        return false;
      }
      setFeedback(feedbackPhone, targetControl, true);
      return true;
    }

    // Live validation after first submit attempt
    if (nameInput) {
      nameInput.addEventListener('input', function() {
        if (hasSubmitted) validateName();
      });
      nameInput.addEventListener('blur', function() {
        if (hasSubmitted) validateName();
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', function() {
        if (hasSubmitted) validateEmail();
      });
      emailInput.addEventListener('blur', function() {
        if (hasSubmitted) validateEmail();
      });
    }

    if (serviceSelect) {
      serviceSelect.addEventListener('change', function() {
        if (hasSubmitted) validateService();
      });
    }

    // --- Form Submit & WhatsApp Dispatch ---
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      hasSubmitted = true;

      var isNameValid = validateName();
      var isEmailValid = validateEmail();
      var isServiceValid = validateService();
      var isPhoneValid = validatePhone();

      if (!isNameValid || !isEmailValid || !isServiceValid || !isPhoneValid) {
        // Shake first invalid field
        var firstInvalid = null;
        if (!isNameValid) firstInvalid = nameInput;
        else if (!isEmailValid) firstInvalid = emailInput;
        else if (!isServiceValid) firstInvalid = serviceSelect;
        else if (!isPhoneValid) firstInvalid = phoneInput;

        if (firstInvalid) {
          var shakeElement = (firstInvalid === phoneInput && phoneGroup) ? phoneGroup : firstInvalid;
          shakeElement.classList.remove('gp-shake');
          // Trigger reflow for animation restart
          void shakeElement.offsetWidth;
          shakeElement.classList.add('gp-shake');
          firstInvalid.focus();
        }
        return;
      }

      // All fields valid -> Format WhatsApp message
      var name = nameInput.value.trim();
      var email = emailInput ? emailInput.value.trim() : '';
      var service = serviceSelect.value;
      var phone = phoneInput.value.trim();
      var message = messageTextarea ? messageTextarea.value.trim() : '';

      var whatsappNumber = '919566795017';
      var textLines = [
        '✨ *New Consultation Enquiry — GP Interior*',
        '━━━━━━━━━━━━━━━━━━━',
        '👤 *Client Name:* ' + name,
        '📱 *Mobile:* +91 ' + phone,
        '🏷️ *Service:* ' + service
      ];

      if (email) {
        textLines.push('📧 *Email:* ' + email);
      }
      if (message) {
        textLines.push('💬 *Project Details:* ' + message);
      } else {
        textLines.push('💬 *Project Details:* Requesting showroom consultation & design quotation.');
      }

      textLines.push('━━━━━━━━━━━━━━━━━━━');
      textLines.push('📍 *Location:* Puducherry');
      textLines.push('_Sent via GP Interior Web Portal (gpinterior.in)_');

      var fullMessage = textLines.join('\n');
      var waUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(fullMessage);

      // Button loading indicator
      if (submitBtn) {
        var originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="gp-btn-icon"><i class="fa fa-spinner fa-spin"></i></span><span class="gp-btn-label">Opening WhatsApp...</span>';
        setTimeout(function() {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }, 3200);
      }

      // Show success alert banner with direct fallback link
      if (successBanner) {
        successBanner.style.display = 'flex';
        if (directWaLink) {
          directWaLink.href = waUrl;
        }
      }

      // Open WhatsApp chat in new window
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Dynamic Copyright Year
  function initDynamicYear() {
    var currentYear = new Date().getFullYear();
    var targets = document.querySelectorAll('#current-year, .current-year, .gp-current-year');
    for (var i = 0; i < targets.length; i++) {
      targets[i].textContent = currentYear;
    }
  }

  function init() {
    initDynamicYear();
    syncActiveNavState();
    syncStickyHeader();
    initScrollReveals();
    initCounters();
    enhanceGalleryLightboxes();
    injectFloatingControls();
    initReviewsCarousel();
    initSmartNavbar();
    initContactFormValidation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Immediate invocation if scripts load defer or bottom-of-body
  try {
    initDynamicYear();
  } catch(e) {}
})();
