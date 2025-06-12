# PickleBay Mobile App Documentation

## Platform Overview
[WebToNative](https://www.webtonative.com) is a conversion platform that transforms websites into native iOS and Android applications without requiring coding knowledge. The platform:

- Creates separate iOS and Android projects from a website URL
- Allows customization of splash screens (animated or static)
- Supports pull-to-refresh functionality
- Provides navigation options
- Includes customizable loading indicators
- Enables CSS and JavaScript overrides for platform-specific adjustments

The platform offers free testing with .apk files for Android and simulator files for iOS. Production deployment requires a paid subscription for each application.

## PickleBay App Implementation

### App Overview
- **App Name**: PickleBay
- **Platform**: Android & iOS via webtonative.com
- **Source Website**: https://picklebay.com

PickleBay is a lightweight mobile application available for both Android and iOS, created using the WebToNative platform. It acts as a native shell that wraps around the main website, providing users with a near-identical experience to the web version while benefiting from native app features.

### Purpose
The primary goal of the PickleBay app is to bring the functionality of https://picklebay.com into a native mobile environment, making it easier for users to:
- Access content via app stores
- Experience improved performance on mobile
- Leverage native features such as push notifications and smoother navigation

### Platform-Specific Issues and Solutions

## Cross-Platform (iOS & Android) Shared Fixes

The following issues and solutions apply to both iOS and Android platforms and are implemented in both override files:

#### 1. Footer Display Management
**Problem**: The website footer isn't needed in the app but removing it causes layout issues in the Profile > Personal Settings UI

**Solution**: Footer is conditionally displayed/hidden based on the current page

```javascript
function toggleFooterDisplay() {
    const footerWrapper = document.querySelector('.main-footer-wrapper');
    if (footerWrapper) {
        const currentUrl = window.location.href.toLowerCase();
        if (currentUrl.includes('personal-details')) {
            footerWrapper.style.display = 'block';
            footerWrapper.style.height = '20vh';
            removeFooterChildren();
            // Note: iOS version also calls adjustGenderSelectHeightIOS() here
        } else {
            footerWrapper.style.display = 'none';
        }
    }
}

function removeFooterChildren() {
    const footerWrapper = document.querySelector('.main-footer-wrapper');
    if (footerWrapper) {
        while (footerWrapper.firstChild) {
            footerWrapper.removeChild(footerWrapper.firstChild);
        }
    }
}
```

#### 2. Email Link Conversion
**Problem**: Contact page displays email addresses as non-clickable paragraph elements

**Solution**: Email text is converted to clickable mailto links while preserving styling (identical implementation on both platforms)

```javascript
function makeEmailClickable() {
    if (!window.location.href.toLowerCase().includes('contactus')) return;

    const emailElements = document.querySelectorAll('.email-access');

    if (emailElements.length > 0) {
        emailElements.forEach(emailElement => {
            if (!emailElement) return;

            const emailText = emailElement.textContent.trim();
            if (!emailText) return;

            // Skip if already a link
            if (emailElement.tagName === 'A') return;

            // Check if parent is already a link
            let currentElement = emailElement;
            while (currentElement.parentElement) {
                if (currentElement.parentElement.tagName === 'A') return;
                currentElement = currentElement.parentElement;
            }

            const existingClasses = Array.from(emailElement.classList);

            const mailtoLink = document.createElement('a');
            mailtoLink.setAttribute('href', `mailto:${emailText}`);
            mailtoLink.setAttribute('rel', 'noopener noreferrer');
            mailtoLink.setAttribute('target', '_blank');
            mailtoLink.textContent = emailText;

            // Preserve styling
            mailtoLink.style.textDecoration = 'none';
            mailtoLink.style.cursor = 'pointer';
            mailtoLink.style.webkitTouchCallout = 'default';
            mailtoLink.style.webkitUserSelect = 'auto';
            mailtoLink.style.userSelect = 'auto';

            // Apply existing classes
            existingClasses.forEach(className => {
                if (className !== 'email-access') {
                    mailtoLink.classList.add(className);
                }
            });

            emailElement.parentNode.replaceChild(mailtoLink, emailElement);
        });
    } else {
        // Fallback for specific email
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
```

#### 3. UI Consistency Fixes
**Problem**: Inconsistent border colors and margin issues across devices

**Solution**: Implementation of `fixNavigationContainerBorder()` and `addMarginToAlsoHappeningContainer()` (identical on both platforms)

```javascript
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
```

#### 4. Login Form Autofill Issues
**Problem**: Input autofill causes UI fluctuation when entering numbers in separate input fields

**Solution**: Autofill is disabled for specific input types (identical implementation on both platforms)

```javascript
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
```

#### 5. Community Header Removal
**Problem**: Redundant header in community pages

**Solution**: Implementation of `removeCommunityHeader()` (identical on both platforms)

```javascript
function removeCommunityHeader() {
    if (!window.location.href.toLowerCase().includes('community.picklebay.com')) return;

    const headers = document.querySelectorAll('body > header.header');
    headers.forEach(header => {
        if (header.id !== 'mainHeader') {
            header.remove();
        }
    });
}
```

## iOS-Specific Issues and Solutions

#### 1. Select Element Height Discrepancy
**Problem**: HTML select elements display with reduced height in iOS compared to other input elements

**Solution**: The `adjustGenderSelectHeightIOS()` function matches select element heights with other input elements

```javascript
function adjustGenderSelectHeightIOS() {
    const nameInput = document.querySelector('input[name="name"]');
    const genderSelect = document.querySelector('select[name="gender"]');

    if (nameInput && genderSelect) {
        const nameHeight = window.getComputedStyle(nameInput).height;
        genderSelect.style.height = nameHeight;
    }
}
```

#### 2. External Link Handling
**Problem**: `window.open()` opens URLs in the device's browser instead of the app's webview, adding navigation buttons that disrupt the user experience

**Solution**: The `interceptWindowOpenIOS()` function keeps links within the app's webview

```javascript
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
```

## Android-Specific Implementation

The Android implementation (`android_override.js`) includes all the cross-platform fixes mentioned above but **does not include** the iOS-specific functions:
- `adjustGenderSelectHeightIOS()` - Not needed on Android as select elements render consistently
- `interceptWindowOpenIOS()` - Android handles external links differently and doesn't require this workaround

## Cross-Platform CSS Styling

Both platforms share identical CSS overrides for consistent styling:

```css
.main-wrapper {
    padding-bottom: 90px;
}

* {
    user-select: none;
}

img, a {
    -webkit-user-drag: none;
    user-drag: none;
    pointer-events: auto;
}
```

### Implementation Details

#### Script Initialization

**iOS Implementation:**
All functions including iOS-specific ones are executed on page load and monitored for dynamic content changes:

```javascript
// Initial execution (iOS)
toggleFooterDisplay();
makeEmailClickable();
fixNavigationContainerBorder();
addMarginToAlsoHappeningContainer();
disableInputAutofill();
removeCommunityHeader();
interceptWindowOpenIOS(); // iOS-specific

// Monitor for dynamic content changes
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            toggleFooterDisplay();
            makeEmailClickable();
            fixNavigationContainerBorder();
            addMarginToAlsoHappeningContainer();
            disableInputAutofill();
            removeCommunityHeader();
            // Note: interceptWindowOpenIOS() not called in observer
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Additional load event listener (iOS)
window.addEventListener('load', () => {
    toggleFooterDisplay();
    makeEmailClickable();
    fixNavigationContainerBorder();
    addMarginToAlsoHappeningContainer();
    disableInputAutofill();
    removeCommunityHeader();
    interceptWindowOpenIOS(); // iOS-specific
});
```

**Android Implementation:**
Only cross-platform functions are executed (no iOS-specific functions):

```javascript
// Initial execution (Android)
toggleFooterDisplay();
makeEmailClickable();
fixNavigationContainerBorder();
addMarginToAlsoHappeningContainer();
disableInputAutofill();
removeCommunityHeader();
// No interceptWindowOpenIOS() or adjustGenderSelectHeightIOS()

// Monitor for dynamic content changes (identical to iOS)
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

// Additional load event listener (Android)
window.addEventListener('load', () => {
    toggleFooterDisplay();
    makeEmailClickable();
    fixNavigationContainerBorder();
    addMarginToAlsoHappeningContainer();
    disableInputAutofill();
    removeCommunityHeader();
    // No iOS-specific functions
});
```

#### Security Features
Both platforms include identical security measures to prevent unwanted interactions:

```javascript
// Disable text selection and drag operations (both platforms)
document.body.style.webkitTouchCallout = 'none';
document.body.style.webkitUserSelect = 'none';
document.body.style.userSelect = 'none';

document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});
```

### File Structure
- `ios_override.js` - Contains iOS-specific fixes and all cross-platform customizations
- `ios_override.css` - iOS-specific CSS styling (identical to Android)
- `android_override.js` - Contains only cross-platform fixes (no iOS-specific functions)
- `android_override.css` - Android-specific CSS styling (identical to iOS)
- `README.md` - This comprehensive documentation file
- `icon.jpeg` - App icon used for both platforms

### Platform Comparison Summary

| Feature | iOS | Android | Notes |
|---------|-----|---------|-------|
| Footer Management | ✅ | ✅ | Identical implementation |
| Email Link Conversion | ✅ | ✅ | Identical implementation |
| UI Consistency Fixes | ✅ | ✅ | Identical implementation |
| Autofill Prevention | ✅ | ✅ | Identical implementation |
| Community Header Removal | ✅ | ✅ | Identical implementation |
| Security Features | ✅ | ✅ | Identical implementation |
| CSS Styling | ✅ | ✅ | Identical files |
| Select Element Height Fix | ✅ | ❌ | iOS-only (not needed on Android) |
| External Link Interception | ✅ | ❌ | iOS-only (Android handles differently) |

## Deployment

### WebToNative Platform Implementation

**Important Note**: The physical files (`ios_override.js`, `android_override.js`, `ios_override.css`, `android_override.css`) cannot be directly uploaded to the WebToNative.com platform. Instead, the code content must be manually copied and pasted into the platform's override configuration interface.

### Deployment Steps for WebToNative Platform

#### Prerequisites
- Active WebToNative.com account
- Existing project created from your website URL
- Access to the override files in this repository

#### Step-by-Step Implementation

1. **Access Your Project**
   - Log into your WebToNative.com account
   - Navigate to your PickleBay project dashboard
   - Locate the project settings or configuration area

2. **Navigate to Website Overrides**
   - Go to the "Website Overrides" section in your project settings
   - This section allows you to inject custom CSS and JavaScript code

3. **Configure CSS Overrides**
   - Click "Configure" next to "CSS Override"
   - **For iOS builds:**
     - Open `ios_override.css` from this repository
     - Copy the entire content of the file
     - Paste the CSS code into the override text area
   - **For Android builds:**
     - Open `android_override.css` from this repository
     - Copy the entire content of the file
     - Paste the CSS code into the override text area
   - Save the CSS configuration

4. **Configure JavaScript Overrides**
   - Click "Configure" next to "JavaScript Override"
   - **For iOS builds:**
     - Open `ios_override.js` from this repository
     - Copy the entire content of the file (all 243 lines)
     - Paste the JavaScript code into the override text area
   - **For Android builds:**
     - Open `android_override.js` from this repository
     - Copy the entire content of the file (all 201 lines)
     - Paste the JavaScript code into the override text area
   - Save the JavaScript configuration

5. **Build and Test**
   - Save all override configurations
   - Rebuild your app using the WebToNative platform
   - Test the app thoroughly to ensure all fixes are working correctly

#### Platform-Specific Deployment Notes

**iOS Deployment:**
- Use `ios_override.js` (includes all cross-platform fixes + iOS-specific functions)
- Use `ios_override.css` (shared styling)
- Ensure both `adjustGenderSelectHeightIOS()` and `interceptWindowOpenIOS()` functions are included

**Android Deployment:**
- Use `android_override.js` (includes only cross-platform fixes)
- Use `android_override.css` (shared styling, identical to iOS)
- Verify that iOS-specific functions are NOT included in the Android build

#### Verification Checklist

After deployment, verify the following functionality works correctly:

**Cross-Platform Features (Both iOS & Android):**
- [ ] Footer is hidden on all pages except personal-details
- [ ] Email addresses on contact page are clickable
- [ ] Navigation container has consistent border styling
- [ ] Also-happening container has proper margin
- [ ] Login form inputs have autofill disabled
- [ ] Community headers are removed appropriately
- [ ] Text selection and drag operations are disabled

**iOS-Specific Features:**
- [ ] Select elements match input element heights on personal-details page
- [ ] External links open within the app webview (not device browser)

**Android-Specific Features:**
- [ ] All cross-platform features work without iOS-specific functions
- [ ] No JavaScript errors related to missing iOS functions

#### Troubleshooting

**Common Issues:**
1. **JavaScript Errors**: Ensure you copied the complete file content without truncation
2. **CSS Not Applied**: Verify the CSS was pasted in the correct override section
3. **Platform Mix-up**: Double-check you're using the correct files for each platform
4. **Caching Issues**: Clear app cache or rebuild if changes don't appear immediately

**Testing Recommendations:**
- Test on actual devices when possible
- Use WebToNative's testing features (.apk for Android, simulator for iOS)
- Verify functionality on different screen sizes
- Test all affected pages (login, contact, personal-details, community)

### Maintenance and Updates

When updating the override code:
1. Make changes to the appropriate files in this repository
2. Copy the updated content to WebToNative platform
3. Rebuild and test the applications
4. Update this documentation if new features are added

This deployment process must be completed separately for both iOS and Android builds, using their respective platform-specific override files to ensure optimal performance and functionality on each platform.

