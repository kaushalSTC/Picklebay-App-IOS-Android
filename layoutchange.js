function androidFiltersWrap() {
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
updateNavigationContainerLayout();

function fixNavigationContainerBorder() {
    const navigationContainer = document.querySelector('.navigation-container');
    if (navigationContainer) {
        navigationContainer.style.borderBottom = '1px solid rgb(0, 0, 0)';
    }
}