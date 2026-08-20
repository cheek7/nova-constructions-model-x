/**
 * NOVA Construction — UI/UX Pro Max Core Script v2.0
 * Modular architecture:
 * - Header & Navigation (Scrollspy, Sticky states)
 * - Mobile Drawer (Accessible, ESC-closing, Focus management)
 * - Scroll Reveal Animations (IntersectionObserver)
 * - Animated Number Counters
 * - Interactive Budget / Construction Estimator
 * - Project Filter Toolbar (Zero reload, instant DOM transition)
 * - Project Detail Modal (Rich inspection dialog)
 * - FAQ Accordion System
 * - Phone Input Mask & Form Validation
 * - Back to Top & Toast Notifications
 */

(function () {
  'use strict';

  // ── 1. DOM UTILITIES ──────────────────────────────────────────
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

  // ── 2. TOAST NOTIFICATION ─────────────────────────────────────
  const Toast = {
    el: $('#toast'),
    msg: $('#toast-msg'),
    timer: null,
    show(text, duration = 3000) {
      if (!this.el) return;
      this.msg.textContent = text;
      this.el.hidden = false;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.el.hidden = true;
      }, duration);
    }
  };

  // ── 3. HEADER & SCROLLSPY ─────────────────────────────────────
  const Header = {
    header: $('#header'),
    links: $$('.nav__link'),
    sections: $$('section[id]'),

    init() {
      if (!this.header) return;
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    },

    onScroll() {
      const scrollY = window.scrollY;
      this.header.classList.toggle('scrolled', scrollY > 40);

      // Back to top toggle
      const backTop = $('#back-to-top');
      if (backTop) {
        backTop.hidden = scrollY < 500;
      }

      // Active section highlight
      let currentSectionId = '';
      this.sections.forEach(sec => {
        const top = sec.offsetTop - this.header.offsetHeight - 120;
        if (scrollY >= top) {
          currentSectionId = sec.id;
        }
      });

      this.links.forEach(link => {
        const isMatch = link.getAttribute('href') === `#${currentSectionId}`;
        link.classList.toggle('is-active', isMatch);
      });
    }
  };

  // ── 4. MOBILE DRAWER NAVIGATION ───────────────────────────────
  const MobileNav = {
    burger: $('#burger'),
    drawer: $('#mobile-nav'),
    backdrop: $('#mobile-backdrop'),
    closeBtn: $('#mobile-close'),
    links: $$('.mobile-nav__link, .mobile-nav__cta'),

    init() {
      if (!this.burger || !this.drawer) return;

      this.burger.addEventListener('click', () => this.toggle(true));
      this.closeBtn.addEventListener('click', () => this.toggle(false));
      this.backdrop.addEventListener('click', () => this.toggle(false));

      this.links.forEach(link => {
        link.addEventListener('click', () => this.toggle(false));
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !this.drawer.hidden) {
          this.toggle(false);
        }
      });
    },

    toggle(isOpen) {
      this.drawer.hidden = !isOpen;
      this.backdrop.hidden = !isOpen;
      this.burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) this.closeBtn.focus();
    }
  };

  // ── 5. SCROLL REVEAL (INTERSECTION OBSERVER) ──────────────────
  const ScrollReveal = {
    init() {
      const targets = $$('.js-reveal');
      if (!targets.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      targets.forEach(el => observer.observe(el));
    }
  };

  // ── 6. ANIMATED COUNTERS ──────────────────────────────────────
  const CounterTicker = {
    init() {
      const counters = $$('.js-counter');
      if (!counters.length) return;

      const animate = (el) => {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;
        const duration = 1800;
        const startTime = performance.now();

        const step = (currentTime) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          // Ease-out expo curve
          const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.floor(easeOut * target);
          el.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        };

        requestAnimationFrame(step);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      counters.forEach(c => observer.observe(c));
    }
  };

  // ── 7. INTERACTIVE PROJECT CALCULATOR ─────────────────────────
  const Calculator = {
    chips: $$('.calc-chip'),
    range: $('#area-range'),
    badge: $('#area-val-badge'),
    chkProj: $('#chk-proj'),
    chkFrame: $('#chk-frame'),
    chkEng: $('#chk-eng'),
    priceOut: $('#calc-price-output'),
    sqmOut: $('#calc-sqm-output'),
    timeOut: $('#calc-time-output'),
    applyBtn: $('#calc-apply-btn'),

    currentTypeRate: 42000,
    currentTypeName: 'Офисный / БЦ',

    init() {
      if (!this.range) return;

      this.chips.forEach(chip => {
        chip.addEventListener('click', () => {
          this.chips.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          chip.classList.add('active');
          chip.setAttribute('aria-checked', 'true');
          this.currentTypeRate = parseInt(chip.dataset.rate, 10);
          this.currentTypeName = chip.textContent.trim();
          this.calculate();
        });
      });

      this.range.addEventListener('input', () => {
        const area = parseInt(this.range.value, 10);
        this.badge.innerHTML = `<strong>${area.toLocaleString('ru-RU')}</strong> м²`;
        this.calculate();
      });

      [this.chkProj, this.chkFrame, this.chkEng].forEach(chk => {
        if (chk) chk.addEventListener('change', () => this.calculate());
      });

      if (this.applyBtn) {
        this.applyBtn.addEventListener('click', () => this.applyToForm());
      }

      this.calculate();
    },

    calculate() {
      const area = parseInt(this.range.value, 10);
      let rate = this.currentTypeRate;

      if (this.chkProj && this.chkProj.checked) rate += parseInt(this.chkProj.dataset.add, 10);
      if (this.chkEng && this.chkEng.checked) rate += parseInt(this.chkEng.dataset.add, 10);

      const totalPrice = area * rate;
      const millions = (totalPrice / 1_000_000).toFixed(1);

      this.priceOut.textContent = `${millions} млн ₽`;
      this.sqmOut.textContent = `от ${rate.toLocaleString('ru-RU')} ₽ / м²`;

      // Estimate duration
      let duration = '4–6 месяцев';
      if (area >= 15000) duration = '12–16 месяцев';
      else if (area >= 5000) duration = '7–10 месяцев';
      else if (area >= 2000) duration = '5–7 месяцев';

      this.timeOut.textContent = duration;
    },

    applyToForm() {
      const area = parseInt(this.range.value, 10);
      const text = `Расчёт: ${this.currentTypeName}, ${area.toLocaleString('ru-RU')} м² (~${this.priceOut.textContent})`;

      const prefillBadge = $('#calc-prefill-badge');
      const prefillText = $('#calc-prefill-text');
      const commentInput = $('#lead-comment');

      if (prefillBadge && prefillText) {
        prefillText.textContent = text;
        prefillBadge.hidden = false;
      }

      if (commentInput) {
        commentInput.value = `Интересует строительство: ${this.currentTypeName}, площадь ${area.toLocaleString('ru-RU')} м². Бюджетная вилка по калькулятору: ${this.priceOut.textContent}.`;
      }

      // Smooth scroll to form
      const contactSection = $('#contact');
      if (contactSection) {
        const top = contactSection.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      Toast.show('Параметры расчёта добавлены в форму заявки!');
    }
  };

  // ── 8. PROJECT FILTER TOOLBAR ─────────────────────────────────
  const ProjectFilter = {
    tabs: $$('.filter-tab'),
    cards: $$('.project-card'),

    init() {
      if (!this.tabs.length) return;

      this.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const filter = tab.dataset.filter;

          this.tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-pressed', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-pressed', 'true');

          this.cards.forEach(card => {
            const cat = card.dataset.category;
            const isMatch = (filter === 'all' || cat === filter);
            card.classList.toggle('is-hidden', !isMatch);
          });
        });
      });
    }
  };

  // ── 9. PROJECT DETAIL MODAL ───────────────────────────────────
  const ProjectModal = {
    modal: $('#project-modal'),
    backdrop: $('#modal-backdrop'),
    closeBtn: $('#modal-close'),
    cards: $$('.project-card'),

    title: $('#modal-project-title'),
    type: $('#modal-type'),
    area: $('#modal-area'),
    loc: $('#modal-loc'),
    year: $('#modal-year'),
    scope: $('#modal-scope'),
    img: $('#modal-img'),
    badge: $('#modal-badge'),

    init() {
      if (!this.modal) return;

      this.cards.forEach(card => {
        card.addEventListener('click', () => this.open(card));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.open(card);
          }
        });
      });

      this.closeBtn.addEventListener('click', () => this.close());
      this.backdrop.addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.modal.hidden) {
          this.close();
        }
      });

      // CTA in modal closes modal and scrolls to form
      const modalCta = $('.modal__cta-btn', this.modal);
      if (modalCta) {
        modalCta.addEventListener('click', () => {
          this.close();
        });
      }
    },

    open(card) {
      const d = card.dataset;
      this.title.textContent = d.title || '';
      this.type.textContent = d.type || '';
      this.area.textContent = d.area || '';
      this.loc.textContent = d.location || '';
      this.year.textContent = d.year || '';
      this.scope.textContent = d.scope || '';
      this.img.src = d.img || '';
      this.img.alt = d.title || '';
      this.badge.textContent = d.category === 'industrial' ? 'Производственный объект' : 'Коммерческий объект';

      this.modal.hidden = false;
      document.body.style.overflow = 'hidden';
      this.closeBtn.focus();
    },

    close() {
      this.modal.hidden = true;
      document.body.style.overflow = '';
    }
  };

  // ── 10. FAQ ACCORDION ────────────────────────────────────────
  const FAQ = {
    items: $$('.faq-item'),

    init() {
      this.items.forEach(item => {
        const btn = $('.faq-question', item);
        const answer = $('.faq-answer', item);
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';

          // Close all other items for clean accordion UX
          this.items.forEach(other => {
            if (other !== item) {
              const otherBtn = $('.faq-question', other);
              const otherAns = $('.faq-answer', other);
              if (otherBtn && otherAns) {
                other.classList.remove('is-open');
                otherBtn.setAttribute('aria-expanded', 'false');
                otherAns.hidden = true;
              }
            }
          });

          item.classList.toggle('is-open', !isExpanded);
          btn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
          answer.hidden = isExpanded;
        });
      });
    }
  };

  // ── 11. PHONE MASK & FORM VALIDATION ──────────────────────────
  const FormHandler = {
    form: $('#contact-form'),
    successBox: $('#form-success'),
    resetBtn: $('#success-reset-btn'),
    phoneInput: $('#lead-phone'),
    nameInput: $('#lead-name'),
    submitBtn: $('#submit-btn'),
    clearPrefillBtn: $('#calc-prefill-clear'),
    prefillBadge: $('#calc-prefill-badge'),

    init() {
      if (!this.form) return;

      // Phone Mask Formatting (+7 (XXX) XXX-XX-XX)
      if (this.phoneInput) {
        this.phoneInput.addEventListener('input', (e) => this.handlePhoneInput(e));
        this.phoneInput.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && this.phoneInput.value === '+7 (') {
            e.preventDefault();
            this.phoneInput.value = '';
          }
        });
      }

      // Clear inline errors on user input
      this.nameInput.addEventListener('input', () => this.clearError('name'));
      this.phoneInput.addEventListener('input', () => this.clearError('phone'));

      // Clear calculation prefill tag
      if (this.clearPrefillBtn) {
        this.clearPrefillBtn.addEventListener('click', () => {
          if (this.prefillBadge) this.prefillBadge.hidden = true;
          const comment = $('#lead-comment');
          if (comment) comment.value = '';
        });
      }

      // Reset form on success view
      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', () => {
          this.form.reset();
          this.form.hidden = false;
          this.successBox.hidden = true;
        });
      }

      // Form Submit
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    handlePhoneInput(e) {
      let raw = e.target.value.replace(/\D/g, '');
      if (raw.startsWith('7') || raw.startsWith('8')) {
        raw = raw.slice(1);
      }
      raw = raw.slice(0, 10);

      if (!raw.length) {
        e.target.value = '';
        return;
      }

      let formatted = '+7 (';
      if (raw.length > 0) formatted += raw.slice(0, 3);
      if (raw.length >= 3) formatted += ') ' + raw.slice(3, 6);
      if (raw.length >= 6) formatted += '-' + raw.slice(6, 8);
      if (raw.length >= 8) formatted += '-' + raw.slice(8, 10);

      e.target.value = formatted;
    },

    setError(field, message) {
      const group = $(`#group-${field}`);
      const errEl = $(`#error-${field}`);
      if (group) group.classList.add('has-error');
      if (errEl) errEl.textContent = message;
      const input = field === 'name' ? this.nameInput : this.phoneInput;
      if (input) input.setAttribute('aria-invalid', 'true');
    },

    clearError(field) {
      const group = $(`#group-${field}`);
      const errEl = $(`#error-${field}`);
      if (group) group.classList.remove('has-error');
      if (errEl) errEl.textContent = '';
      const input = field === 'name' ? this.nameInput : this.phoneInput;
      if (input) input.removeAttribute('aria-invalid');
    },

    handleSubmit(e) {
      e.preventDefault();
      let isValid = true;

      const nameVal = this.nameInput.value.trim();
      const phoneDigits = this.phoneInput.value.replace(/\D/g, '');

      if (!nameVal || nameVal.length < 2) {
        this.setError('name', 'Пожалуйста, введите ваше имя (не менее 2 букв)');
        isValid = false;
      } else {
        this.clearError('name');
      }

      if (phoneDigits.length < 11) {
        this.setError('phone', 'Пожалуйста, укажите полный номер телефона');
        isValid = false;
      } else {
        this.clearError('phone');
      }

      if (!isValid) {
        const firstErr = this.form.querySelector('[aria-invalid="true"]');
        if (firstErr) firstErr.focus();
        return;
      }

      // Simulated Async API Request
      const originalText = this.submitBtn.innerHTML;
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Отправка заявки...</span>
      `;

      // Inject spinner animation style if missing
      if (!$('#spinner-anim-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-anim-style';
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }

      setTimeout(() => {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalText;
        this.form.hidden = true;
        this.successBox.hidden = false;
        Toast.show('Заявка успешно отправлена!');
      }, 1000);
    }
  };

  // ── 12. BACK TO TOP SMOOTH SCROLL ────────────────────────────
  const BackToTop = {
    btn: $('#back-to-top'),
    init() {
      if (!this.btn) return;
      this.btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  // ── 13. SMOOTH ANCHOR NAVIGATION ──────────────────────────────
  const SmoothAnchor = {
    init() {
      const header = $('#header');
      $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (!href || href === '#') return;
          const target = $(href);
          if (!target) return;

          e.preventDefault();
          const offset = header ? header.offsetHeight + 10 : 70;
          const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
      });
    }
  };

  // ── INITIALIZE APPLICATION ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    Header.init();
    MobileNav.init();
    ScrollReveal.init();
    CounterTicker.init();
    Calculator.init();
    ProjectFilter.init();
    ProjectModal.init();
    FAQ.init();
    FormHandler.init();
    BackToTop.init();
    SmoothAnchor.init();

    console.log('%cNOVA CONSTRUCTION UI/UX PRO MAX v2.0 READY', 'color:#E8A020;font-weight:bold;font-size:14px;');
  });

})();
