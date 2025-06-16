(function() {
    'use strict';

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
                console.error('Alert error:', alertError);
                resolve();
                processAlertQueue();
            }
        }, 100);
    }

    function checkBodyProtection() {
        if (document.body && document.body.classList.contains('protected')) {
            return true;
        }
        return false;
    }

    function clearBodyContent() {
        if (checkBodyProtection()) return;

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    }

    function addProtectionClass() {
        if (!document.body.classList.contains('protected')) {
            document.body.classList.add('protected');
        }
    }

    function createButtons() {
        if (checkBodyProtection() && document.getElementById('buttonContainer')) return;

        const existingContainer = document.getElementById('buttonContainer');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'buttonContainer';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            gap: 20px;
            z-index: 99999;
            pointer-events: auto;
        `;

        const button1 = document.createElement('button');
        button1.textContent = 'Fetch location';
        button1.id = 'actionBtn1';
        button1.style.cssText = `
            background-color: #000000;
            color: #ffffff;
            border: 2px solid #ffffff;
            padding: 15px 25px;
            min-width: 150px;
            min-height: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            border-radius: 5px;
            z-index: 100000;
            pointer-events: auto;
            user-select: auto;
            -webkit-user-select: auto;
            text-align: center;
        `;

        const button2 = document.createElement('button');
        button2.textContent = 'Action Button 2';
        button2.id = 'actionBtn2';
        button2.style.cssText = `
            background-color: #000000;
            color: #ffffff;
            border: 2px solid #ffffff;
            padding: 15px 25px;
            min-width: 150px;
            min-height: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            border-radius: 5px;
            z-index: 100000;
            pointer-events: auto;
            user-select: auto;
            -webkit-user-select: auto;
            text-align: center;
        `;

        async function showPosition(position) {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                await iosAlert(`Latitude: ${lat} Longitude: ${lon} Accuracy: ${accuracy}m`);
            } catch (positionError) {
                await iosAlert(`Error displaying position: ${positionError.message}`);
            }
        }

        async function showError(error) {
            try {
                let errorMessage = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location permissions in your device settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please check your GPS settings.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out. Please try again.';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred while retrieving location.';
                        break;
                    default:
                        errorMessage = `An unexpected error occurred: ${error.message || 'Unknown error'}`;
                        break;
                }
                await iosAlert(`Location Error: ${errorMessage}`);
            } catch (errorHandlingError) {
                await iosAlert(`Error in error handler: ${errorHandlingError.message}`);
            }
        }

        async function loadWebToNative() {
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
                await fallbackToStandardGeolocation();
            }
        }

        async function requestLocation() {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition, showError, {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0
                    });
                } else {
                    await iosAlert('Geolocation is not supported by this browser.');
                }
            } catch (locationError) {
                await iosAlert(`Error requesting location: ${locationError.message}`);
            }
        }

        async function fallbackToStandardGeolocation() {
            try {
                await requestLocation();
            } catch (fallbackError) {
                await iosAlert(`Error in fallback geolocation: ${fallbackError.message}`);
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
                                            await iosAlert('Device GPS is disabled. Please enable location services in your device settings.');
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

        button1.addEventListener('click', async function(e) {
            try {
                e.stopPropagation();
                await checkGPSStatus();
            } catch (error) {
                await iosAlert(`Error in fetch location button: ${error.message}`);
            }
        });

        button2.addEventListener('click', async function(e) {
            e.stopPropagation();
            await iosAlert('Action Button 2 clicked! Functionality confirmed.');
        });

        container.appendChild(button1);
        container.appendChild(button2);
        document.body.appendChild(container);

        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.backgroundColor = '#f0f0f0';
        document.body.style.fontFamily = 'Arial, sans-serif';
        document.body.style.overflow = 'hidden';
    }

    function initializeBodyModification() {
        if (!checkBodyProtection()) {
            clearBodyContent();
            addProtectionClass();
        }
        createButtons();
    }

    initializeBodyModification();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                initializeBodyModification();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener('load', () => {
        initializeBodyModification();
    });

  })();