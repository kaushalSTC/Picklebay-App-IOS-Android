(function() {
    'use strict';

    let webToNativeLoaded = false;
    let alertQueue = [];
    let isProcessingAlert = false;

    function iosAlert(message) {
        return new Promise((resolve, reject) => {
            const alertItem = {
                message,
                resolve,
                reject,
                timestamp: Date.now()
            };
            alertQueue.push(alertItem);
            processAlertQueue();

            setTimeout(() => {
                const index = alertQueue.indexOf(alertItem);
                if (index > -1) {
                    alertQueue.splice(index, 1);
                    reject(new Error('Alert timeout: ' + message));
                }
            }, 10000);
        });
    }

    function processAlertQueue() {
        if (isProcessingAlert || alertQueue.length === 0) return;

        isProcessingAlert = true;
        const { message, resolve } = alertQueue.shift();

        setTimeout(() => {
            try {
                alert(message);
                setTimeout(() => {
                    isProcessingAlert = false;
                    resolve();
                    processAlertQueue();
                }, 300);
            } catch (alertError) {
                isProcessingAlert = false;
                resolve();
                processAlertQueue();
            }
        }, 100);
    }

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
                                iosAlert('Location button intercepted successfully');
                            } catch (listenerError) {
                                iosAlert('Error adding event listener: ' + listenerError.message);
                                try {
                                    if (typeof window.setLocationLoading === 'function') {
                                        window.setLocationLoading(false);
                                    }
                                } catch (loadingResetError) {
                                    iosAlert('Error resetting loading state: ' + loadingResetError.message);
                                }
                            }
                        }
                    } else {
                        iosAlert('Parent button element not found');
                    }
                } catch (buttonError) {
                    iosAlert('Error processing button element: ' + buttonError.message);
                }
            }
        } catch (interceptError) {
            iosAlert('Error intercepting location button: ' + interceptError.message);
        }
    }

    async function handleLocationButtonClick(event) {
        try {
            try {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            } catch (eventError) {
                await iosAlert('Error preventing default event: ' + eventError.message);
            }

            try {
                if (typeof window.getIsLoading === 'function' && window.getIsLoading()) {
                    await iosAlert('Location fetch already in progress');
                    return;
                }
            } catch (loadingCheckError) {
                await iosAlert('Error checking loading state: ' + loadingCheckError.message);
            }

            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError(null);
                }
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(true);
                }
            } catch (loadingSetError) {
                await iosAlert('Error setting loading state: ' + loadingSetError.message);
            }

            try {
                await checkGPSStatus();
            } catch (gpsError) {
                await iosAlert('GPS check failed: ' + gpsError.message);
                throw gpsError;
            }

        } catch (error) {
            try {
                if (typeof window.setLocationError === 'function') {
                    window.setLocationError('Error in location button: ' + error.message);
                } else {
                    await iosAlert('Error in location button: ' + error.message);
                }
            } catch (errorSetError) {
                await iosAlert('Error setting error message: ' + errorSetError.message);
            }

            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
            }
        }
    }

    async function showPosition(position) {
        try {
            if (!position || !position.coords) {
                await iosAlert('Invalid position data received');
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    await iosAlert('Error resetting loading state: ' + loadingResetError.message);
                }
                return;
            }

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            if (lat === null || lat === undefined || lon === null || lon === undefined) {
                await iosAlert('Invalid coordinates received');
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    await iosAlert('Error resetting loading state: ' + loadingResetError.message);
                }
                return;
            }

            try {
                if (typeof window.setLocationData === 'function') {
                    window.setLocationData({
                        lat: lat,
                        lng: lon
                    });
                    await iosAlert(`Location coordinates sent to React: ${lat}, ${lon}`);
                } else {
                    await iosAlert(`Latitude: ${lat} Longitude: ${lon} Accuracy: ${accuracy}m`);
                }
            } catch (dataSetError) {
                await iosAlert('Error setting location data: ' + dataSetError.message);
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    await iosAlert('Error resetting loading state: ' + loadingResetError.message);
                }
            }

        } catch (positionError) {
            await iosAlert('Error processing position: ' + positionError.message);
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
            }
        }
    }

    async function showError(error) {
        try {
            if (!error) {
                await iosAlert('Unknown location error occurred');
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    await iosAlert('Error resetting loading state: ' + loadingResetError.message);
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
                    await iosAlert('Location error sent to React: ' + errorMessage);
                } else {
                    await iosAlert(`Location Error: ${errorMessage}`);
                }
            } catch (errorSetError) {
                await iosAlert('Error setting location error: ' + errorSetError.message);
            }

            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
            }

        } catch (showErrorError) {
            await iosAlert('Critical error in showError function: ' + showErrorError.message);
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
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
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
            }
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
                } else {
                    await iosAlert('Geolocation is not supported by this browser.');
                }
                try {
                    if (typeof window.setLocationLoading === 'function') {
                        window.setLocationLoading(false);
                    }
                } catch (loadingResetError) {
                    await iosAlert('Error resetting loading state: ' + loadingResetError.message);
                }
            }
        } catch (locationError) {
            if (typeof window.setLocationError === 'function') {
                window.setLocationError(`Error requesting location: ${locationError.message}`);
            } else {
                await iosAlert(`Error requesting location: ${locationError.message}`);
            }
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
            }
        }
    }

    async function fallbackToStandardGeolocation() {
        try {
            await requestLocation();
        } catch (fallbackError) {
            if (typeof window.setLocationError === 'function') {
                window.setLocationError(`Error in fallback geolocation: ${fallbackError.message}`);
            } else {
                await iosAlert(`Error in fallback geolocation: ${fallbackError.message}`);
            }
            try {
                if (typeof window.setLocationLoading === 'function') {
                    window.setLocationLoading(false);
                }
            } catch (loadingResetError) {
                await iosAlert('Error resetting loading state: ' + loadingResetError.message);
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
                                        } else {
                                            await iosAlert('Device GPS is disabled. Please enable location services in your device settings.');
                                        }
                                        try {
                                            if (typeof window.setLocationLoading === 'function') {
                                                window.setLocationLoading(false);
                                            }
                                        } catch (loadingResetError) {
                                            await iosAlert('Error resetting loading state: ' + loadingResetError.message);
                                        }
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
