// Navigation disclosures only. Clinical topics stay unavailable until data is connected.
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.header-navigation');
    if (!nav) return;
    const header = nav.closest('header');
    const measureHeader = () => document.documentElement.style.setProperty('--system-header-bottom', `${header.getBoundingClientRect().bottom}px`);
    new ResizeObserver(measureHeader).observe(header);
    measureHeader();
    const menus = [...nav.querySelectorAll(':scope > .header-menu')];
    const close = except => menus.forEach(menu => { if (menu !== except) menu.open = false; });
    menus.forEach(menu => menu.addEventListener('toggle', () => {
      if (menu.open) close(menu);
    }));
    document.addEventListener('pointerdown', event => {
      if (!nav.contains(event.target)) close();
    });
    nav.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const open = menus.find(menu => menu.open);
      if (open) {
        event.preventDefault();
        close();
        open.querySelector('summary').focus();
      }
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('#search-dropdown')) {
        close();
        return;
      }
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      // Keep the location disclosure open while entering a search query.
      if (button.closest('.campus-selector-group, .nav-actions')) close();
    });
    const sync = () => {
      const view = document.getElementById('header-view-value');
      if (view) view.textContent = document.getElementById('btn-toggle-xray')?.classList.contains('active') ? '全棟透視' : '3D 鳥瞰';
    };
    const observer = new MutationObserver(sync);
    nav.querySelectorAll('.btn-campus, #btn-toggle-xray').forEach(button => {
      observer.observe(button, { attributes: true, attributeFilter: ['class'] });
    });
    sync();
  });
})();
