(function() {
    var checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    var matches = checkboxes.filter(input => input.value && input.value.trim().toLowerCase() === 'all levels');
    if (matches.length > 0) {
        console.log('Found checkbox inputs with value "All Levels":', matches);
    } else {
        console.log('No checkbox inputs with value "All Levels" found.');
    }
})(); 