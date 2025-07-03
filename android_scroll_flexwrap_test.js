(function() {
    try {
        const candidates = Array.from(document.querySelectorAll('.overflow-x-auto'));
        const scrollDiv = candidates.find(div =>
            div.classList.contains('flex') &&
            div.classList.contains('items-center') &&
            div.classList.contains('justify-start') &&
            div.classList.contains('gap-5') &&
            div.classList.contains('whitespace-nowrap') &&
            div.classList.contains('flex-nowrap')
        );
        if (scrollDiv) {
            scrollDiv.style.flexWrap = 'wrap';
            scrollDiv.style.overflowX = 'visible';
            scrollDiv.style.whiteSpace = 'normal';
            scrollDiv.style.justifyContent = 'space-between';
        }
    } catch (e) {}

    function androidScrollPolyfillTest() {
        try {
            const candidates = Array.from(document.querySelectorAll('.overflow-x-auto'));
            const scrollDiv = candidates.find(div =>
                div.classList.contains('flex') &&
                div.classList.contains('items-center') &&
                div.classList.contains('justify-start') &&
                div.classList.contains('gap-5') &&
                div.classList.contains('whitespace-nowrap') &&
                div.classList.contains('flex-nowrap')
            );
            if (scrollDiv) {
                scrollDiv.style.overflowX = 'auto';
                scrollDiv.style.webkitOverflowScrolling = 'touch';
                scrollDiv.style.scrollBehavior = 'smooth';
                scrollDiv.style.touchAction = 'pan-x';
                scrollDiv.style.pointerEvents = 'auto';
                scrollDiv.style.userSelect = 'auto';
                scrollDiv.style.webkitUserSelect = 'auto';
                scrollDiv.style.maxWidth = '100vw';
                scrollDiv.style.width = '100%';
                scrollDiv.style.paddingRight = '16px';
                let startX = 0, scrollLeft = 0, isDown = false;
                scrollDiv.addEventListener('touchstart', function(e) {
                    isDown = true;
                    startX = e.touches[0].pageX - scrollDiv.offsetLeft;
                    scrollLeft = scrollDiv.scrollLeft;
                });
                scrollDiv.addEventListener('touchend', function() {
                    isDown = false;
                });
                scrollDiv.addEventListener('touchmove', function(e) {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.touches[0].pageX - scrollDiv.offsetLeft;
                    const walk = (startX - x) * 2.5;
                    scrollDiv.scrollLeft = scrollLeft + walk;
                }, { passive: false });
            }
        } catch (e) {}
    }
    androidScrollPolyfillTest();
})(); 