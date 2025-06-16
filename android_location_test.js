(function() {
    'use strict';

    let webToNativeLoaded = false;

    function loadWebToNative() {
        return new Promise((resolve, reject) => {
            try {
                if (typeof WTN !== 'undefined') {
                    webToNativeLoaded = true;
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://unpkg.com/webtonative@1.0.71/webtonative.min.js';
                script.onload = () => {
                    setTimeout(() => {
                        if (typeof WTN !== 'undefined') {
                            webToNativeLoaded = true;
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
                                alert('Location button intercepted successfully');
                            } catch (listenerError) {
                                alert('Error adding event listener: ' + listenerError.message);
                            }
                        }
                    } else {
                        alert('Parent button element not found');
                    }
                } catch (buttonError) {
                    alert('Error processing button element: ' + buttonError.message);
                }
            }
        } catch (interceptError) {
            alert('Error intercepting location button: ' + interceptError.message);
        }
    }


    async function handleLocationButtonClick(event) {
        try {
            try {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            } catch (eventError) {
                alert('Error preventing default event: ' + eventError.message);
            }

            try {
                if (typeof window.getIsLoading === 'function' && window.getIsLoading()) {
                    alert('Location fetch already in progress');
                    return;
                }
            } catch (loadingCheckError) {
                alert('Error checking loading state: ' + loadingCheckError.message);
            }

            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError(null);
                }
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(true);
                }
            } catch (loadingSetError) {
                alert('Error setting loading state: ' + loadingSetError.message);
            }

            try {
                await checkGPSStatus();
            } catch (gpsError) {
                alert('GPS check failed: ' + gpsError.message);
                throw gpsError;
            }

        } catch (error) {
            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError('Error in location button: ' + error.message);
                } else {
                    alert('Error in location button: ' + error.message);
                }
            } catch (errorSetError) {
                alert('Error setting error message: ' + errorSetError.message);
            }

            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }
        }
    }

    function showPosition(position) {
        try {
            if (!position || !position.coords) {
                alert('Invalid position data received');
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    alert('Error resetting loading state: ' + loadingResetError.message);
                }
                return;
            }

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            if (lat === null || lat === undefined || lon === null || lon === undefined) {
                alert('Invalid coordinates received');
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    alert('Error resetting loading state: ' + loadingResetError.message);
                }
                return;
            }

            try {
                if (typeof window.setLocationData === 'function') {
                    window.setLocationData({
                        lat: lat,
                        lng: lon
                    });
                } else {
                    alert(`Latitude: ${lat} Longitude: ${lon} Accuracy: ${accuracy}m`);
                }
            } catch (dataSetError) {
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    alert('Error resetting loading state: ' + loadingResetError.message);
                }
            }

        } catch (positionError) {
            alert('Error processing position: ' + positionError.message);
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }
        }
    }

    function showError(error) {
        try {
            if (!error) {
                alert('Unknown location error occurred');
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    alert('Error resetting loading state: ' + loadingResetError.message);
                }
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
                    alert('Location error sent to React: ' + errorMessage);
                } else {
                    alert(`Location Error: ${errorMessage}`);
                }
            } catch (errorSetError) {
                alert('Error setting location error: ' + errorSetError.message);
            }

            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }

        } catch (showErrorError) {
            alert('Critical error in showError function: ' + showErrorError.message);
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }
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
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }
            await fallbackToStandardGeolocation();
        }
    }

    function requestLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError('Geolocation is not supported by this browser.');
                } else {
                    alert('Geolocation is not supported by this browser.');
                }
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    alert('Error resetting loading state: ' + loadingResetError.message);
                }
            }
        } catch (locationError) {
            if (typeof window.setLocationError === 'function') {
                window.setLocationError(`Error requesting location: ${locationError.message}`);
            } else {
                alert(`Error requesting location: ${locationError.message}`);
            }
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }
        }
    }

    async function fallbackToStandardGeolocation() {
        try {
            requestLocation();
        } catch (fallbackError) {
            if (typeof window.setLocationError === 'function') {
                window.setLocationError(`Error in fallback geolocation: ${fallbackError.message}`);
            } else {
                alert(`Error in fallback geolocation: ${fallbackError.message}`);
            }
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                alert('Error resetting loading state: ' + loadingResetError.message);
            }
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
                    callback: function(data) {
                        if (callbackExecuted) return;
                        callbackExecuted = true;
                        clearTimeout(timeoutId);

                        try {
                            if (data && typeof data === 'object') {
                                if (data.value !== undefined) {
                                    if (data.value === true) {
                                        requestLocation();
                                        resolve();
                                    } else {
                                        if (typeof window.setLocationError === 'function') {
                                            window.setLocationError('Device GPS is disabled. Please enable location services in your device settings.');
                                        } else {
                                            alert('Device GPS is disabled. Please enable location services in your device settings.');
                                        }
                                        try {
                                            if (typeof window.setLocationLoading === 'function') {
                                                window.setLocationLoading(false);
                                            }
                                        } catch (loadingResetError) {
                                            alert('Error resetting loading state: ' + loadingResetError.message);
                                        }
                                        resolve();
                                    }
                                } else {
                                    fallbackToStandardGeolocation();
                                    resolve();
                                }
                            } else {
                                fallbackToStandardGeolocation();
                                resolve();
                            }
                        } catch (callbackError) {
                            fallbackToStandardGeolocation();
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

    interceptLocationButtons();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                interceptLocationButtons();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener('load', () => {
        interceptLocationButtons();
    });

})();