(function() {
    var checkboxes = Array.from(document.querySelectorAll('input.hidden.peer'));
    var found = false;
    if (checkboxes.length > 0) {
        for (var i = 0; i < checkboxes.length; i++) {
            var input = checkboxes[i];
            var parent = input.parentElement;
            var grandparent = parent ? parent.parentElement : null;
            if (grandparent) {
                // Apply styles for webview-based apps
                grandparent.style.overflowX = 'auto';
                grandparent.style.webkitOverflowScrolling = 'touch';
                grandparent.style.scrollBehavior = 'smooth';
                grandparent.style.touchAction = 'pan-x';
                console.log('Grandparent for input (updated for webview scrolling):', grandparent);
                found = true;
                break;
            } else {
                console.log('Grandparent not found for input:', input);
            }
        }
        if (!found) {
            console.log('No grandparent found for any <input> with class "hidden peer".');
        }
    } else {
        console.log('No <input> elements with class "hidden peer" found.');
    }
})(); 