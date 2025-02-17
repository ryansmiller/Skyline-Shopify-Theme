class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    const productSectionHtml = parsedState.sections["cart-notification-product"];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = productSectionHtml;
  
    // Extract the cart item key from the id of the cart item element
    const cartItemElement = tempDiv.querySelector('.cart-item');
    if (cartItemElement) {
      const cartItemId = cartItemElement.getAttribute('id'); // Safe way
      this.cartItemKey = cartItemId.replace('cart-notification-product-', '');
    } else {
      console.warn('Could not find cart item element in cart-notification-product section.');
      this.cartItemKey = null;
    }
  
    this.getSectionsToRender().forEach(function (section) {
      const sectionHTML = parsedState.sections[section.id];
      if (!sectionHTML) {
        console.warn('Section with ID "' + section.id + '" was not returned in the response.');
        return;
      }
  
      const elementToReplace = document.getElementById(section.id);
      if (!elementToReplace) {
        console.warn('Element with ID "' + section.id + '" not found in DOM.');
        return;
      }
  
      const innerHTML = this.getSectionInnerHTML(sectionHTML, section.selector || '.shopify-section');
      if (innerHTML === '') {
        console.warn('Selector "' + section.selector + '" not found in section "' + section.id + '" HTML.');
        console.warn('Section HTML content:', sectionHTML);
        return;
      }
  
      elementToReplace.innerHTML = innerHTML;
    }.bind(this)); // Important to bind(this) for 'this' context
  
    if (this.header) {
      this.header.reveal();
    }
    this.open();
  }
  
  
  
  

  getSectionsToRender() {
    return [
      { id: "cart-notification-product", selector: `[id="cart-notification-product-${this.cartItemKey}"]` },
      { id: "cart-notification-button" },
      { id: "cart-icon-bubble" }
    ];
  }

  console.log('Extracted cartItemKey:', this.cartItemKey);
  console.log('Full Product Section HTML:', productSectionHtml);

  

  getSectionInnerHTML(html, selector = ".shopify-section") {
    const element = new DOMParser().parseFromString(html, "text/html").querySelector(selector);
    if (!element) {
      console.warn(`Selector "${selector}" not found in section HTML. Returning full HTML as fallback.`);
      console.warn("Problematic HTML response:", html);
      return html; // Fallback for debugging
    }
    return element.innerHTML;
  }
  

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure, header-menu');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
