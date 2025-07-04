(function() {
    'use strict';

    let isBodyPaddingApplied = false;
    let isNavLayoutApplied = false;
    let isFooterDisplayToggled = false;
    let isEmailClickable = false;
    let isNavBorderFixed = false;
    let isAlsoHappeningMarginAdded = false;
    let isInputAutofillDisabled = false;
    let isCommunityHeaderRemoved = false;
    let isLocationButtonsIntercepted = false;
    let isWindowOpenIntercepted = false;

    function applyIOSBodySafeAreaPadding() {
        if (isBodyPaddingApplied) return;
        const safeAreaPadding = window.innerHeight * 0.018;
        document.body.style.paddingBottom = `${safeAreaPadding}px`;
        isBodyPaddingApplied = true;
        return safeAreaPadding;
    }

    async function updateNavigationContainerLayout() {
        if (isNavLayoutApplied) return;
        const navContainer = document.querySelector('.navigation-container');
        if (!navContainer) return;
        const safeAreaPadding = applyIOSBodySafeAreaPadding();
        const parent = navContainer.parentElement;
        if (parent) {
            parent.className = '';
            parent.classList.add(
                'fixed', 'bottom-0', 'left-0', 'w-full', 'z-50', 'bg-white', 'border-t', 'border-f2f2f2'
            );
            parent.style.borderTopLeftRadius = '1rem';
            parent.style.borderTopRightRadius = '1rem';
            parent.style.removeProperty('padding-bottom');
        }
        navContainer.className = '';
        navContainer.classList.add(
            'navigation-container', 'flex', 'items-center', 'justify-between', 'gap-3',
            'px-4', 'py-2', 'bg-white', 'w-full'
        );
        navContainer.style.borderTopLeftRadius = '1rem';
        navContainer.style.borderTopRightRadius = '1rem';
        navContainer.querySelectorAll('span.bg-56b918').forEach(span => {
            span.style.bottom = `${safeAreaPadding}px`;
        });
        isNavLayoutApplied = true;
    }

    function toggleFooterDisplay() {
        if (isFooterDisplayToggled) return;
        const footerWrapper = document.querySelector('.main-footer-wrapper');
        if (footerWrapper) {
            const currentUrl = window.location.href.toLowerCase();
            if (currentUrl.includes('personal-details')) {
                footerWrapper.style.display = 'block';
                footerWrapper.style.height = '20vh';
                removeFooterChildren();
                adjustGenderSelectHeightIOS();
            } else {
                footerWrapper.style.display = 'none';
            }
        }
        isFooterDisplayToggled = true;
    }

    function makeEmailClickable() {
        if (isEmailClickable) return;
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
        }
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
        isEmailClickable = true;
    }

    function fixNavigationContainerBorder() {
        if (isNavBorderFixed) return;
        const navigationContainer = document.querySelector('.navigation-container');
        if (navigationContainer) {
            navigationContainer.style.borderBottom = '1px solid rgb(0, 0, 0)';
        }
        isNavBorderFixed = true;
    }

    function addMarginToAlsoHappeningContainer() {
        if (isAlsoHappeningMarginAdded) return;
        const alsoHappeningContainer = document.querySelector('.also-happening-container');
        if (alsoHappeningContainer) {
            alsoHappeningContainer.style.marginBottom = '10vh';
        }
        isAlsoHappeningMarginAdded = true;
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
        if (isInputAutofillDisabled) return;
        if (!window.location.href.toLowerCase().includes('login')) return;
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            processInputForAutofill(input.type, input);
        });
        isInputAutofillDisabled = true;
    }

    function removeCommunityHeader() {
        if (isCommunityHeaderRemoved) return;
        if (!window.location.href.toLowerCase().includes('community.picklebay.com')) return;
        const headers = document.querySelectorAll('body > header.header');
        headers.forEach(header => {
            if (header.id !== 'mainHeader') {
                header.remove();
            }
        });
        isCommunityHeaderRemoved = true;
    }

    function interceptLocationButtons() {
        if (isLocationButtonsIntercepted) return;
        const locationButton = document.querySelector('.currentLocation-access');
        if (locationButton) {
            const parentButton = locationButton.closest('button');
            if (parentButton) {
                if (!parentButton.hasAttribute('data-location-intercepted')) {
                    parentButton.setAttribute('data-location-intercepted', 'true');
                    parentButton.addEventListener('click', handleLocationButtonClick, true);
                }
            }
        }
        isLocationButtonsIntercepted = true;
    }

    function interceptWindowOpenIOS() {
        if (isWindowOpenIntercepted) return;
        let interceptedUrl = null;
        window.open = function(url, target, features) {
            interceptedUrl = url;
            const anchor = document.createElement('a');
            anchor.href = interceptedUrl;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            anchor.textContent = 'Open Community';
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            setTimeout(() => {
                const evt = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                anchor.dispatchEvent(evt);
            }, 300);
            return null;
        };
        isWindowOpenIntercepted = true;
    }

    function removeFooterChildren() {
        const footerWrapper = document.querySelector('.main-footer-wrapper');
        if (footerWrapper) {
            while (footerWrapper.firstChild) {
                footerWrapper.removeChild(footerWrapper.firstChild);
            }
        }
    }

    function adjustGenderSelectHeightIOS() {
        const nameInput = document.querySelector('input[name="name"]');
        const genderSelect = document.querySelector('select[name="gender"]');
        if (nameInput && genderSelect) {
            const nameHeight = window.getComputedStyle(nameInput).height;
            genderSelect.style.height = nameHeight;
        }
    }

    async function runAllOverrides() {
        applyIOSBodySafeAreaPadding();
        await loadWebToNative();
        await updateNavigationContainerLayout();
        await toggleFooterDisplay();
        await makeEmailClickable();
        await fixNavigationContainerBorder();
        await addMarginToAlsoHappeningContainer();
        await disableInputAutofill();
        await removeCommunityHeader();
        await interceptLocationButtons();
        await interceptWindowOpenIOS();
    }

    runAllOverrides();

    const observer = new MutationObserver(mutations => {
        isBodyPaddingApplied = false;
        isNavLayoutApplied = false;
        isFooterDisplayToggled = false;
        isEmailClickable = false;
        isNavBorderFixed = false;
        isAlsoHappeningMarginAdded = false;
        isInputAutofillDisabled = false;
        isCommunityHeaderRemoved = false;
        isLocationButtonsIntercepted = false;
        isWindowOpenIntercepted = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                runAllOverrides();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener('load', () => {
        isBodyPaddingApplied = false;
        isNavLayoutApplied = false;
        isFooterDisplayToggled = false;
        isEmailClickable = false;
        isNavBorderFixed = false;
        isAlsoHappeningMarginAdded = false;
        isInputAutofillDisabled = false;
        isCommunityHeaderRemoved = false;
        isLocationButtonsIntercepted = false;
        isWindowOpenIntercepted = false;
        runAllOverrides();
    });

    document.body.style.webkitTouchCallout = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';

    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

})(); 