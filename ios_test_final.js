(function() {
    'use strict';

    function loadWebToNative() {
        return new Promise((resolve, reject) => {
            try {
                if (typeof WTN !== 'undefined') {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/webtonative@1.0.71/webtonative.min.js';
                script.onload = () => {
                    setTimeout(() => {
                        if (typeof WTN !== 'undefined') {
                            resolve();
                        } else {
                            reject(new Error('WebToNative failed to load'));
                        }
                    }, 100);
                };
                script.onerror = () => {
                    reject(new Error('Failed to load WebToNative script'));
                };
                document.head.appendChild(script);
            } catch (loadError) {
                reject(loadError);
            }
        });
    }

    function interceptLocationButtons() {
        try {
            const locationButton = document.querySelector('.currentLocation-access');
            if (locationButton) {
                try {
                    const parentButton = locationButton.closest('button');
                    if (parentButton) {
                        if (!parentButton.hasAttribute('data-location-intercepted')) {
                            try {
                                parentButton.setAttribute('data-location-intercepted', 'true');
                                parentButton.addEventListener('click', handleLocationButtonClick, true);
                            } catch (listenerError) {}
                        }
                    } else {}
                } catch (buttonError) {}
            }
        } catch (interceptError) {}
    }

    async function handleLocationButtonClick(event) {
        try {
            try {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            } catch (eventError) {}
            try {
                if (typeof window.getIsLoading === 'function' && window.getIsLoading()) {
                    return;
                }
            } catch (loadingCheckError) {}
            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError(null);
                }
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(true);
                }
            } catch (loadingSetError) {}
            try {
                await checkGPSStatus();
            } catch (gpsError) {
                throw gpsError;
            }
        } catch (error) {
            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError('Error in location button: ' + error.message);
                }
            } catch (errorSetError) {}
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
        }
    }

    async function showPosition(position) {
        try {
            if (!position || !position.coords) {
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {}
                return;
            }
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            if (lat === null || lat === undefined || lon === null || lon === undefined) {
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {}
                return;
            }
            try {
                if (typeof window.setLocationData === 'function') {
                    window.setLocationData({ lat: lat, lng: lon });
                }
            } catch (dataSetError) {
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {}
            }
        } catch (positionError) {
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
        }
    }

    async function showError(error) {
        try {
            if (!error) {
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {}
                return;
            }
            let errorMessage = '';
            try {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location permissions in settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location unavailable. Please check GPS settings.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timeout. Please try again.';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred while retrieving location.';
                        break;
                    default:
                        errorMessage = `An unexpected error occurred: ${error.message || 'Unknown error'}`;
                        break;
                }
            } catch (switchError) {
                errorMessage = 'Error processing location error: ' + switchError.message;
            }
            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError(errorMessage);
                }
            } catch (errorSetError) {}
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
        } catch (showErrorError) {
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
        }
    }

    async function checkGPSStatus() {
        try {
            try {
                await loadWebToNative();
            } catch (loadError) {
                await fallbackToStandardGeolocation();
                return;
            }
            if (typeof WTN !== 'undefined') {
                if (WTN.isDeviceGPSEnabled) {
                    try {
                        await checkGPSWithTimeout();
                    } catch (gpsTimeoutError) {
                        await fallbackToStandardGeolocation();
                    }
                } else {
                    await fallbackToStandardGeolocation();
                }
            } else {
                await fallbackToStandardGeolocation();
            }
        } catch (gpsCheckError) {
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
            await fallbackToStandardGeolocation();
        }
    }

    async function requestLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError('Geolocation is not supported by this browser.');
                }
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {}
            }
        } catch (locationError) {
            if (typeof window.setLocationError === 'function') {
                window.setLocationError(`Error requesting location: ${locationError.message}`);
            }
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
        }
    }

    async function fallbackToStandardGeolocation() {
        try {
            await requestLocation();
        } catch (fallbackError) {
            if (typeof window.setLocationError === 'function') {
                window.setLocationError(`Error in fallback geolocation: ${fallbackError.message}`);
            }
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {}
        }
    }

    async function checkGPSWithTimeout() {
        return new Promise((resolve, reject) => {
            let callbackExecuted = false;
            let timeoutId;
            try {
                timeoutId = setTimeout(() => {
                    if (!callbackExecuted) {
                        callbackExecuted = true;
                        reject(new Error('GPS status callback timeout'));
                    }
                }, 5000);
                WTN.isDeviceGPSEnabled({
                    callback: async function(data) {
                        if (callbackExecuted) return;
                        callbackExecuted = true;
                        clearTimeout(timeoutId);
                        try {
                            if (data && typeof data === 'object') {
                                if (data.value !== undefined) {
                                    if (data.value === true) {
                                        await requestLocation();
                                        resolve();
                                    } else {
                                        if (typeof window.setLocationError === 'function') {
                                            window.setLocationError('Device GPS is disabled. Please enable location services in your device settings.');
                                        }
                                        try {
                                            if (typeof window.setLocationLoading === 'function') {
                                                window.setLocationLoading(false);
                                            }
                                        } catch (loadingResetError) {}
                                        resolve();
                                    }
                                } else {
                                    await fallbackToStandardGeolocation();
                                    resolve();
                                }
                            } else {
                                await fallbackToStandardGeolocation();
                                resolve();
                            }
                        } catch (callbackError) {
                            await fallbackToStandardGeolocation();
                            resolve();
                        }
                    }
                });
            } catch (wtnCallError) {
                if (!callbackExecuted) {
                    callbackExecuted = true;
                    clearTimeout(timeoutId);
                    reject(wtnCallError);
                }
            }
        });
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

    function interceptWindowOpenIOS() {
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
    }

    function toggleFooterDisplay() {
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

    function updateNavigationContainerLayout() {
        try {
            const navContainer = document.querySelector('.navigation-container');
            if (navContainer) {
                const parent = navContainer.parentElement;
                if (parent) {
                    parent.className = '';
                    parent.classList.add(
                        'fixed',
                        'bottom-0',
                        'left-0',
                        'w-full',
                        'z-50',
                        'bg-white',
                        'border-t',
                        'border-f2f2f2'
                    );
                    parent.style.borderTopLeftRadius = '1rem';
                    parent.style.borderTopRightRadius = '1rem';
                    if (window.WTN && typeof window.WTN.getSafeArea === 'function') {
                        window.WTN.getSafeArea({
                            callback: function(data) {
                                if (data && typeof data.bottom === 'number') {
                                    parent.style.paddingBottom = (data.bottom + 2) + 'px';
                                }
                            }
                        });
                    }
                }
                navContainer.className = '';
                navContainer.classList.add(
                    'navigation-container',
                    'flex',
                    'items-center',
                    'justify-between',
                    'gap-3',
                    'px-4',
                    'py-2',
                    'bg-white',
                    'w-full'
                );
                navContainer.style.borderTopLeftRadius = '1rem';
                navContainer.style.borderTopRightRadius = '1rem';
            }
        } catch (e) {}
    }
    

    function runAllOverrides() {
        toggleFooterDisplay();
        makeEmailClickable();
        fixNavigationContainerBorder();
        addMarginToAlsoHappeningContainer();
        disableInputAutofill();
        removeCommunityHeader();
        interceptLocationButtons();
        interceptWindowOpenIOS();
        updateNavigationContainerLayout();
    }

    runAllOverrides();

    const observer = new MutationObserver(mutations => {
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
        runAllOverrides();
    });

    document.body.style.webkitTouchCallout = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';

    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

})(); 