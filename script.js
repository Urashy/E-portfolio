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


/* --- LOGIQUE MARIO --- */
function selectCompetence(element, url) {
    const mario = document.getElementById('mario-character');
    const stage = document.querySelector('.game-stage');

    // 1. Calculer la position du tuyau cliqué
    // On récupère la position gauche du tuyau par rapport au conteneur parent
    const pipeRect = element.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    // Position cible : centre du tuyau - moitié de la largeur de Mario
    const targetLeft = (pipeRect.left - stageRect.left) + (pipeRect.width / 2) - 20;

    // 2. Calculer le temps de trajet (pour que la vitesse soit constante)
    const currentLeft = parseInt(window.getComputedStyle(mario).left) || 20;
    const distance = Math.abs(targetLeft - currentLeft);
    const duration = distance / 300; // Vitesse arbitraire

    // 3. Déplacer Mario
    mario.style.transition = `left ${duration}s linear`;
    mario.style.left = `${targetLeft}px`;

    // 4. Une fois arrivé, lancer l'animation d'entrée
    setTimeout(() => {
        // Enlever la transition de mouvement pour l'animation de saut
        mario.style.transition = 'none';
        mario.classList.add('mario-entering');

        // 5. Changer de page après l'animation
        setTimeout(() => {
            window.location.href = url;
        }, 800); // Attend la fin de l'animation pipe-enter

    }, duration * 1000); // Convertir durée en ms
}