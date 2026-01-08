const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Vérifier si un thème est déjà sauvegardé
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    toggleButton.textContent = '☀️';
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        toggleButton.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        toggleButton.textContent = '🌙';
    }
});