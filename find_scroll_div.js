(function() {
    var candidates = Array.from(document.querySelectorAll('.overflow-x-auto'));
    var found = candidates.find(div =>
        div.classList.contains('flex') &&
        div.classList.contains('items-center') &&
        div.classList.contains('justify-start') &&
        div.classList.contains('gap-5') &&
        div.classList.contains('whitespace-nowrap') &&
        div.classList.contains('flex-nowrap')
    );
    if (found) {
        console.log('Scrollable div FOUND!');
        Array.from(found.children).forEach((child, idx) => {
            console.log('Child', idx, ':', child.innerText);
        });
    } else {
        console.log('Scrollable div NOT FOUND!');
    }
})(); 