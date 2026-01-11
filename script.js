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


/* --- LOGIQUE MARIO AVEC ANIMATION --- */

// Points du chemin (coordonnées X, Y bottom) pour suivre les virages
const pathPoints = [
    { x: 30, bottom: 100 },      // Départ
    { x: 130, bottom: 105 },     // Segment 1-2
    { x: 245, bottom: 155 },     // Tuyau 2
    { x: 330, bottom: 185 },     // Montée
    { x: 400, bottom: 195 },     // Tuyau 3 (sommet)
    { x: 490, bottom: 175 },     // Descente
    { x: 580, bottom: 170 },     // Tuyau 4
    { x: 680, bottom: 195 },     // Remontée
    { x: 760, bottom: 205 },     // Tuyau 5
    { x: 850, bottom: 165 },     // Descente
    { x: 950, bottom: 160 }      // Tuyau 6
];

function selectCompetence(element, url) {
    const mario = document.getElementById('mario-character');
    const stage = document.querySelector('.game-stage');

    // 1. Calculer la position du tuyau cliqué
    const pipeRect = element.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    // Position cible : centre du tuyau
    const targetLeft = (pipeRect.left - stageRect.left) + (pipeRect.width / 2) - 24;
    const targetBottom = window.innerHeight - pipeRect.bottom + stageRect.top + 10;

    // 2. Démarrer l'animation de marche
    mario.classList.add('mario-walking');

    // 3. Trouver le chemin à suivre
    const currentLeft = parseInt(window.getComputedStyle(mario).left) || 30;

    // Trouver les points de chemin entre la position actuelle et la cible
    let pathToFollow = [];
    let foundStart = false;

    for (let point of pathPoints) {
        if (!foundStart && point.x >= currentLeft - 50) {
            foundStart = true;
        }
        if (foundStart) {
            pathToFollow.push(point);
            if (point.x >= targetLeft - 30) {
                break;
            }
        }
    }

    // Si aucun chemin trouvé, aller directement
    if (pathToFollow.length === 0) {
        pathToFollow = [{ x: targetLeft, bottom: targetBottom }];
    }

    // 4. Animer Mario le long du chemin
    let currentPointIndex = 0;
    const animateAlongPath = () => {
        if (currentPointIndex >= pathToFollow.length) {
            // Arrivé à destination
            mario.classList.remove('mario-walking');

            // Petit saut avant d'entrer dans le tuyau
            mario.classList.add('mario-jumping');

            setTimeout(() => {
                mario.classList.remove('mario-jumping');
                // Animation d'entrée dans le tuyau
                mario.classList.add('mario-entering');

                // Changer de page après l'animation
                setTimeout(() => {
                    window.location.href = url;
                }, 1200);
            }, 600);

            return;
        }

        const point = pathToFollow[currentPointIndex];
        const duration = 300; // ms par segment

        mario.style.transition = `left ${duration}ms linear, bottom ${duration}ms linear`;
        mario.style.left = `${point.x}px`;
        mario.style.bottom = `${point.bottom}px`;

        currentPointIndex++;
        setTimeout(animateAlongPath, duration);
    };

    animateAlongPath();
}

// Animation de marche au chargement pour montrer Mario vivant
window.addEventListener('load', () => {
    const mario = document.getElementById('mario-character');

    // Petite animation de démarrage
    setTimeout(() => {
        mario.classList.add('mario-jumping');
        setTimeout(() => {
            mario.classList.remove('mario-jumping');
        }, 600);
    }, 500);
});