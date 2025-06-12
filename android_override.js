(function() {
  'use strict';

  function removeFooterChildren() {
      const footerWrapper = document.querySelector('.main-footer-wrapper');
      if (footerWrapper) {
          while (footerWrapper.firstChild) {
              footerWrapper.removeChild(footerWrapper.firstChild);
          }
      }
  }

  function toggleFooterDisplay() {
      const footerWrapper = document.querySelector('.main-footer-wrapper');
      if (footerWrapper) {
          const currentUrl = window.location.href.toLowerCase();
          if (currentUrl.includes('personal-details')) {
              footerWrapper.style.display = 'block';
              footerWrapper.style.height = '20vh';
              removeFooterChildren();
          } else {
              footerWrapper.style.display = 'none';
          }
      }
  }

  function makeEmailClickable() {
      if (!window.location.href.toLowerCase().includes('contactus')) return;

      const emailElements = document.querySelectorAll('.email-access');

      if (emailElements.length > 0) {
          emailElements.forEach(emailElement => {
              if (!emailElement) return;

              const emailText = emailElement.textContent.trim();
              if (!emailText) return;

              if (emailElement.tagName === 'A') {
                  return;
              }

              let currentElement = emailElement;
              while (currentElement.parentElement) {
                  if (currentElement.parentElement.tagName === 'A') {
                      return;
                  }
                  currentElement = currentElement.parentElement;
              }

              const existingClasses = Array.from(emailElement.classList);

              const mailtoLink = document.createElement('a');
              mailtoLink.setAttribute('href', `mailto:${emailText}`);
              mailtoLink.setAttribute('rel', 'noopener noreferrer');
              mailtoLink.setAttribute('target', '_blank');
              mailtoLink.textContent = emailText;

              mailtoLink.style.textDecoration = 'none';
              mailtoLink.style.cursor = 'pointer';
              mailtoLink.style.webkitTouchCallout = 'default';
              mailtoLink.style.webkitUserSelect = 'auto';
              mailtoLink.style.userSelect = 'auto';

              existingClasses.forEach(className => {
                  if (className !== 'email-access') {
                      mailtoLink.classList.add(className);
                  }
              });

              emailElement.parentNode.replaceChild(mailtoLink, emailElement);
          });
      } else {
          const paragraphs = document.querySelectorAll('p');
          const targetEmail = 'connect@picklebay.com';

          paragraphs.forEach(paragraph => {
              if (paragraph.textContent.trim().toLowerCase() === targetEmail.toLowerCase()) {
                  const parent = paragraph.parentElement;
                  if (parent) {
                      parent.removeChild(paragraph);
                      const mailtoLink = document.createElement('a');
                      mailtoLink.setAttribute('href', `mailto:${targetEmail}`);
                      mailtoLink.setAttribute('rel', 'noopener noreferrer');
                      mailtoLink.setAttribute('target', '_blank');
                      mailtoLink.textContent = targetEmail;
                      mailtoLink.style.textDecoration = 'none';
                      mailtoLink.style.cursor = 'pointer';
                      mailtoLink.style.webkitTouchCallout = 'default';
                      mailtoLink.style.webkitUserSelect = 'auto';
                      mailtoLink.style.userSelect = 'auto';
                      mailtoLink.classList.add('font-general', 'font-medium', 'text-sm', 'text-244cb4');
                      parent.appendChild(mailtoLink);
                  }
              }
          });
      }
  }

  function fixNavigationContainerBorder() {
      const navigationContainer = document.querySelector('.navigation-container');
      if (navigationContainer) {
          navigationContainer.style.borderBottom = '1px solid rgb(0, 0, 0)';
      }
  }

  function addMarginToAlsoHappeningContainer() {
      const alsoHappeningContainer = document.querySelector('.also-happening-container');
      if (alsoHappeningContainer) {
          alsoHappeningContainer.style.marginBottom = '10vh';
      }
  }

  function processInputForAutofill(inputType, input) {
      if (inputType === 'tel' || inputType === 'number') {
          if (inputType === 'tel') {
              input.type = 'number';
          }
          input.setAttribute('autocomplete', 'off');
          input.setAttribute('autocorrect', 'off');

          if (!input.hasAttribute('data-clipboard-disabled')) {
              input.setAttribute('data-clipboard-disabled', 'true');

              input.addEventListener('paste', function(e) {
                  e.preventDefault();
                  return false;
              });

              input.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  return false;
              });
          }
      }
  }

  function disableInputAutofill() {
      if (!window.location.href.toLowerCase().includes('login')) return;

      const inputs = document.querySelectorAll('input');

      inputs.forEach(input => {
          processInputForAutofill(input.type, input);
      });
  }

  function removeCommunityHeader() {
      if (!window.location.href.toLowerCase().includes('community.picklebay.com')) return;

      const headers = document.querySelectorAll('body > header.header');
      headers.forEach(header => {
          if (header.id !== 'mainHeader') {
              header.remove();
          }
      });
  }

  toggleFooterDisplay();
  makeEmailClickable();
  fixNavigationContainerBorder();
  addMarginToAlsoHappeningContainer();
  disableInputAutofill();
  removeCommunityHeader();

  const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
          if (mutation.addedNodes.length) {
              toggleFooterDisplay();
              makeEmailClickable();
              fixNavigationContainerBorder();
              addMarginToAlsoHappeningContainer();
              disableInputAutofill();
              removeCommunityHeader();
          }
      });
  });

  observer.observe(document.body, {
      childList: true,
      subtree: true
  });

  window.addEventListener('load', () => {
      toggleFooterDisplay();
      makeEmailClickable();
      fixNavigationContainerBorder();
      addMarginToAlsoHappeningContainer();
      disableInputAutofill();
      removeCommunityHeader();
  });

  document.body.style.webkitTouchCallout = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.userSelect = 'none';

  document.addEventListener('dragstart', function(e) {
      e.preventDefault();
  });

})();
