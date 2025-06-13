(function() {
  'use strict';

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

      function showPosition(position) {
          alert('Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude);
      }

      function showError(error) {
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  alert('User denied the request for Geolocation.');
                  break;
              case error.POSITION_UNAVAILABLE:
                  alert('Location information is unavailable.');
                  break;
              case error.TIMEOUT:
                  alert('The request to get user location timed out.');
                  break;
              case error.UNKNOWN_ERROR:
                  alert('An unknown error occurred.');
                  break;
          }
      }

      function loadWebToNative() {
          return new Promise((resolve, reject) => {
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
              script.onerror = () => reject(new Error('Failed to load WebToNative script'));
              document.head.appendChild(script);
          });
      }

      async function checkGPSStatus() {
          try {
              await loadWebToNative();

              if (typeof WTN !== 'undefined' && WTN.isDeviceGPSEnabled) {
                  try {
                      WTN.isDeviceGPSEnabled({
                          callback: function(data) {
                              try {
                                  if (data.value) {
                                      alert('Device GPS is enabled. Proceeding with location request...');
                                      if (navigator.geolocation) {
                                          navigator.geolocation.getCurrentPosition(showPosition, showError);
                                      } else {
                                          alert('Geolocation is not supported by this browser.');
                                      }
                                  } else {
                                      alert('Device GPS is disabled. Please enable location services in your device settings.');
                                  }
                              } catch (callbackError) {
                                  alert('Error in GPS status callback: ' + callbackError.message);
                              }
                          }
                      });
                  } catch (wtnError) {
                      alert('Error calling WTN.isDeviceGPSEnabled: ' + wtnError.message + '. Using standard geolocation...');
                      if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(showPosition, showError);
                      } else {
                          alert('Geolocation is not supported by this browser.');
                      }
                  }
              } else {
                  alert('WebToNative GPS check not available. Using standard geolocation...');
                  try {
                      if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(showPosition, showError);
                      } else {
                          alert('Geolocation is not supported by this browser.');
                      }
                  } catch (fallbackError) {
                      alert('Error in fallback geolocation: ' + fallbackError.message);
                  }
              }
          } catch (gpsCheckError) {
              alert('Error in GPS status check: ' + gpsCheckError.message);
          }
      }

      button1.addEventListener('click', async function(e) {
          try {
              e.stopPropagation();
              checkGPSStatus();
          } catch (error) {
              alert('Error in fetch location button: ' + error.message);
          }
      });

      button2.addEventListener('click', function(e) {
          e.stopPropagation();
          alert('Action Button 2 clicked! Functionality confirmed.');
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