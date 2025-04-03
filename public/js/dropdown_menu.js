function toggleSubMenu(button) {
    // Get the submenu that belongs to this button
    const subMenu = button.nextElementSibling;
    
    // Toggle the show class
    subMenu.classList.toggle('show');
    
    // Rotate the arrow icon
    const arrow = button.querySelector('svg');
    if (subMenu.classList.contains('show')) {
        arrow.style.transform = 'rotate(180deg)';
    } else {
        arrow.style.transform = 'rotate(0deg)';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown-button')) {
        document.querySelectorAll('.sub-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-button svg').forEach(arrow => {
            arrow.style.transform = 'rotate(0deg)';
        });
    }
}); 