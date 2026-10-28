/* Dados da empresa: única fonte dos contatos e da identificação operacional.
   WhatsApp confirmado pelo cliente neste chat em 28/10/2026.
   [PENDENTE] E-mail, domínio, CNPJ, razão social, complemento e horários regulares.
   Não substituir null por valores de exemplo. */
const EMPRESA = {
  nome: 'ZASS Dental Clinic',
  telefone: { numero: '+5581979155335', exibicao: '(81) 97915-5335' },
  whatsapp: {
    numero: '5581979155335',
    confirmado: true,
    mensagem: 'Olá! Vim pelo site da ZASS e gostaria de informações sobre agendamento.'
  },
  email: null, // [PENDENTE] E-mail institucional.
  endereco: {
    rua: 'Rua Manoel Estevão da Costa', numero: '298', bairro: 'Iputinga',
    cidade: 'Recife', estado: 'PE', cep: '50670-590', pais: 'BR',
    complemento: null // [PENDENTE] Loja/galeria e instruções de chegada.
  },
  maps: 'https://maps.app.goo.gl/XzQ88tGrr51oXyFbA',
  horarios: {
    confirmados: false, // [PENDENTE] Segunda-feira, intervalos e feriados.
    texto: 'Consulte a equipe sobre os horários de atendimento.',
    publicadosNoDossie: [
      { dias: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '08:00', fecha: '18:00' },
      { dias: ['Saturday'], abre: '08:00', fecha: '12:00' }
    ]
  },
  redesSociais: { instagram: { url: 'https://www.instagram.com/zassdentalclinic/', usuario: '@zassdentalclinic' } },
  dominio: null, // [PENDENTE] Domínio oficial.
  logo: 'assets/logo-zass.svg',
  imagemCompartilhamento: 'assets/compartilhamento.jpg'
};

(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const setText = (selector, value) => $$(selector).forEach(node => { node.textContent = value; });
  const external = (node, href) => {
    node.href = href;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
  };
  const endereco = EMPRESA.endereco;
  const temEndereco = Boolean(endereco?.rua && endereco?.numero && endereco?.cidade && !Object.values(endereco).some(value => typeof value === 'string' && value.includes('[PENDENTE]')));
  const enderecoCompleto = temEndereco ? `${endereco.rua}, ${endereco.numero}${endereco.complemento ? `, ${endereco.complemento}` : ''} — ${endereco.bairro}, ${endereco.cidade} — ${endereco.estado}, ${endereco.cep}` : '';
  const localidade = temEndereco ? `${endereco.bairro}, ${endereco.cidade}` : '';

  setText('[data-company-name]', EMPRESA.nome);
  setText('[data-location]', localidade);
  setText('[data-address]', enderecoCompleto);
  setText('[data-address-short]', temEndereco ? `${endereco.rua}, ${endereco.numero} · ${endereco.bairro}` : 'Consulte a equipe sobre a localização.');
  setText('[data-phone-text]', EMPRESA.telefone.exibicao);
  setText('[data-hours]', EMPRESA.horarios.texto);
  setText('[data-instagram-text]', EMPRESA.redesSociais.instagram.usuario);
  setText('[data-year]', new Date().getFullYear());
  $$('[data-brand-link]').forEach(node => node.setAttribute('aria-label', `${EMPRESA.nome}, início`));
  $$('[data-brand-image]').forEach(node => { node.src = EMPRESA.logo; node.alt = EMPRESA.nome; });
  $$('[data-phone]').forEach(node => { node.href = `tel:${EMPRESA.telefone.numero}`; });
  $$('[data-instagram]').forEach(node => external(node, EMPRESA.redesSociais.instagram.url));
  $$('[data-maps]').forEach(node => { if (EMPRESA.maps) external(node, EMPRESA.maps); else node.hidden = true; });
  document.title = `${EMPRESA.nome} | Odontologia em ${localidade}`;
  $('meta[property="og:image"]').content = new URL(EMPRESA.imagemCompartilhamento, document.baseURI).href;
  if (EMPRESA.dominio) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical'; canonical.href = EMPRESA.dominio; document.head.append(canonical);
    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url'); ogUrl.content = EMPRESA.dominio; document.head.append(ogUrl);
  }

  const toast = $('.toast');
  let toastTimer;
  function avisar(message) {
    clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6500);
  }
  const whatsappAtivo = EMPRESA.whatsapp.confirmado && /^\d{12,13}$/.test(EMPRESA.whatsapp.numero);
  $$('[data-whatsapp]').forEach(link => {
    if (whatsappAtivo) {
      external(link, `https://wa.me/${EMPRESA.whatsapp.numero}?text=${encodeURIComponent(EMPRESA.whatsapp.mensagem)}`);
    } else {
      link.removeAttribute('href');
      link.setAttribute('role', 'link');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '0');
      link.setAttribute('aria-label', 'WhatsApp em confirmação. Use o telefone da clínica.');
      link.title = 'WhatsApp em confirmação. Use o telefone da clínica.';
      link.addEventListener('click', event => {
        event.preventDefault(); avisar(`WhatsApp em confirmação. Você pode ligar para ${EMPRESA.telefone.exibicao}.`);
      });
      link.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); link.click(); }
      });
    }
  });
  $$('[data-whatsapp-note]').forEach(node => {
    node.hidden = whatsappAtivo;
    if (!whatsappAtivo) {
      node.append('WhatsApp em confirmação. ');
      const call = document.createElement('a'); call.href = `tel:${EMPRESA.telefone.numero}`;
      call.textContent = 'Ligar para a clínica'; call.className = 'text-link'; node.append(call);
    }
  });

  const schema = { '@context': 'https://schema.org', '@type': 'Dentist', name: EMPRESA.nome, telephone: EMPRESA.telefone.numero,
    image: new URL(EMPRESA.imagemCompartilhamento, document.baseURI).href,
    sameAs: [EMPRESA.redesSociais.instagram.url, EMPRESA.maps].filter(Boolean) };
  if (temEndereco) schema.address = { '@type': 'PostalAddress', streetAddress: `${endereco.rua}, ${endereco.numero}`, addressLocality: endereco.cidade, addressRegion: endereco.estado, postalCode: endereco.cep, addressCountry: endereco.pais };
  if (EMPRESA.dominio) schema.url = EMPRESA.dominio;
  if (EMPRESA.email) schema.email = EMPRESA.email;
  if (EMPRESA.horarios.confirmados) schema.openingHoursSpecification = EMPRESA.horarios.publicadosNoDossie.map(item => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: item.dias, opens: item.abre, closes: item.fecha }));
  const ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.textContent = JSON.stringify(schema); document.head.append(ld);

  const header = $('.site-header');
  const menuButton = $('.menu-toggle');
  const navigation = $('.navigation');
  const mobile = matchMedia('(max-width: 767px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let menuOpen = false;
  function setMenu(open, restoreFocus = false) {
    menuOpen = open;
    document.body.classList.toggle('menu-open', open && mobile.matches);
    menuButton.setAttribute('aria-expanded', String(open));
    $('.sr-only', menuButton).textContent = open ? 'Fechar menu' : 'Abrir menu';
    navigation.classList.toggle('is-open', open);
    navigation.inert = mobile.matches && !open;
    if (restoreFocus) menuButton.focus();
  }
  setMenu(false);
  menuButton.addEventListener('click', () => setMenu(!menuOpen));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a[href]')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive: true });

  // Âncoras são nativas: o navegador mantém hash, histórico e navegação sem SPA.
  const navLinks = $$('a[href^="#"]', navigation).filter(link => link.hash && $(link.hash));
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -60% 0px' });
    navLinks.forEach(link => sectionObserver.observe($(link.hash)));
  }

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.documentElement.classList.add('reveal-enabled');
    $$('[data-stagger]').forEach(grid => {
      $$(':scope > [data-reveal]', grid).forEach((node, index) => { node.style.setProperty('--reveal-delay', `calc(var(--stagger) * ${index})`); });
    });
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    $$('[data-reveal]').forEach(node => reveals.observe(node));
    reducedMotion.addEventListener('change', event => {
      if (event.matches) { document.documentElement.classList.remove('reveal-enabled'); reveals.disconnect(); }
    });
  }

  // FAQ: anima somente opacity/transform; o estado semântico pertence ao details.
  const faqAnimations = new WeakMap();
  $$('.faq-list details').forEach(details => {
    const summary = $('summary', details), answer = $('.faq-answer', details);
    let closing = false;
    summary.addEventListener('click', event => {
      if (reducedMotion.matches || typeof answer.animate !== 'function') return;
      event.preventDefault();
      faqAnimations.get(details)?.cancel();
      const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-fast')) || 240;
      if (!details.open || closing) {
        closing = false; details.open = true;
        const animation = answer.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration, easing: 'ease-out' });
        faqAnimations.set(details, animation);
      } else {
        closing = true;
        const animation = answer.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration, easing: 'ease-in' });
        faqAnimations.set(details, animation);
        animation.onfinish = () => { details.open = false; closing = false; };
      }
    });
  });

  const mapWrapper = $('[data-map-wrapper]');
  const mapActivate = $('.map-activate'), mapDeactivate = $('.map-deactivate');
  if (temEndereco) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(`${EMPRESA.nome}, ${enderecoCompleto}`)}&output=embed`;
    iframe.title = `Localização da ${EMPRESA.nome}`;
    iframe.loading = 'lazy'; iframe.width = '100%'; iframe.height = '380';
    iframe.referrerPolicy = 'no-referrer-when-downgrade'; iframe.allowFullscreen = true;
    iframe.tabIndex = mobile.matches ? -1 : 0;
    $('#mapa').append(iframe);
    const resetMap = () => { mapWrapper.classList.remove('is-interactive'); mapActivate.hidden = false; mapDeactivate.hidden = true; iframe.tabIndex = mobile.matches ? -1 : 0; };
    mapActivate.addEventListener('click', () => { mapWrapper.classList.add('is-interactive'); mapActivate.hidden = true; mapDeactivate.hidden = false; iframe.tabIndex = 0; mapDeactivate.focus({ preventScroll: true }); });
    mapDeactivate.addEventListener('click', () => { resetMap(); mapActivate.focus({ preventScroll: true }); });
    mapWrapper.addEventListener('keydown', event => { if (event.key === 'Escape') { resetMap(); mapActivate.focus({ preventScroll: true }); } });
    mobile.addEventListener('change', resetMap);
  } else {
    mapWrapper.hidden = true; // [PENDENTE] Sem endereço real, não renderizar mapa.
  }

  const lightbox = $('.lightbox'), lightboxImage = $('#imagem-ampliada');
  const galleryLinks = $$('[data-lightbox]');
  let currentPhoto = 0, lastGalleryFocus;
  const showPhoto = index => {
    currentPhoto = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[currentPhoto];
    lightboxImage.src = link.href; lightboxImage.alt = link.dataset.caption;
    $('#legenda-ampliada').textContent = `${link.dataset.caption} · ${currentPhoto + 1} / ${galleryLinks.length}`;
  };
  if (typeof lightbox.showModal === 'function') {
    galleryLinks.forEach((link, index) => link.addEventListener('click', event => {
      event.preventDefault(); lastGalleryFocus = link; showPhoto(index); lightbox.showModal(); document.body.classList.add('modal-open');
    }));
    $('.lightbox-close').addEventListener('click', () => lightbox.close());
    $('[data-gallery-prev]').addEventListener('click', () => showPhoto(currentPhoto - 1));
    $('[data-gallery-next]').addEventListener('click', () => showPhoto(currentPhoto + 1));
    lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); lightbox.close(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(currentPhoto - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(currentPhoto + 1); }
    });
    lightbox.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastGalleryFocus?.focus({ preventScroll: true }); });
  }
})();
