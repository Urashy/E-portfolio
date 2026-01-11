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
/* --- MOTEUR DE JEU MARIO (PLATFORMER) --- */

const gameContainer = document.getElementById('game-container');
const gameWorld = document.getElementById('game-world');

// --- CONFIGURATION DU NIVEAU ---
// C'est ici que tu dessines ton niveau !
// x: position horizontale, y: hauteur (0 = en bas), w: largeur, h: hauteur
// type: 'ground', 'pipe', 'brick', 'mystery', 'enemy'
const levelData = [
    // LE SOL (Longue plateforme de base)
    { type: 'ground', x: 0, y: 0, w: 3000, h: 60 },

    // TUYAU 1 : C1 (Réaliser)
    { type: 'pipe', x: 400, y: 60, h: 80, label: 'C1: Réaliser', link: 'competence1.html' },

    // OBSTACLES & ENNEMIS ENTRE C1 ET C2
    { type: 'enemy', x: 600, y: 60, w: 40, h: 40, dist: 100 }, // Ennemi qui patrouille
    { type: 'brick', x: 700, y: 160, w: 40, h: 40 },
    { type: 'mystery', x: 740, y: 160, w: 40, h: 40 },
    { type: 'brick', x: 780, y: 160, w: 40, h: 40 },

    // TUYAU 2 : C2 (Optimiser) - Sur une colline
    { type: 'ground', x: 900, y: 0, w: 200, h: 120 }, // Colline
    { type: 'pipe', x: 960, y: 120, h: 60, label: 'C2: Optimiser', link: 'competence2.html' },

    // TUYAU 3 : C3 (Administrer)
    { type: 'enemy', x: 1200, y: 60, w: 40, h: 40, dist: 150 },
    { type: 'pipe', x: 1350, y: 60, h: 90, label: 'C3: Admin', link: 'competence3.html' },

    // TUYAU 4 : C4 (Données)
    { type: 'brick', x: 1550, y: 100, w: 40, h: 40 },
    { type: 'brick', x: 1600, y: 150, w: 40, h: 40 },
    { type: 'pipe', x: 1700, y: 60, h: 70, label: 'C4: Données', link: 'competence4.html' },

    // TUYAU 5 : C5 (Gestion)
    { type: 'pipe', x: 2000, y: 60, h: 80, label: 'C5: Gestion', link: 'competence5.html' },

    // TUYAU 6 : C6 (Équipe)
    { type: 'mystery', x: 2200, y: 150, w: 40, h: 40 },
    { type: 'pipe', x: 2400, y: 60, h: 80, label: 'C6: Équipe', link: 'competence6.html' },

    // MUR DE FIN
    { type: 'ground', x: 2900, y: 0, w: 100, h: 1000 }
];

// --- VARIABLES DU JEU ---
let player = {
    el: null,
    x: 50,
    y: 200,
    w: 40,
    h: 40,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpForce: 14,
    grounded: false
};

const physics = {
    gravity: 0.8,
    friction: 0.85
};

let keys = {};
let entities = [];
let gameLoopId;

// --- INITIALISATION ---
function initGame() {
    gameWorld.innerHTML = '';
    entities = [];

    // Créer le joueur
    player.el = document.createElement('div');
    player.el.id = 'player';
    gameWorld.appendChild(player.el);

    // Générer le niveau
    levelData.forEach(item => {
        const el = document.createElement('div');
        el.classList.add('game-entity');
        el.style.left = item.x + 'px';
        el.style.bottom = item.y + 'px'; // On travaille en bottom-up (Y=0 est le bas)
        el.style.width = (item.w || 60) + 'px';
        el.style.height = (item.h || 60) + 'px';

        // Styles spécifiques
        if (item.type === 'ground') el.classList.add('ground-block');
        if (item.type === 'brick') el.classList.add('brick');
        if (item.type === 'mystery') el.classList.add('mystery-box');

        if (item.type === 'pipe') {
            el.classList.add('pipe-structure');
            el.style.width = '60px'; // Force largeur tuyau
            // Ajout du label
            const label = document.createElement('div');
            label.className = 'pipe-label';
            label.innerText = item.label;
            el.appendChild(label);
        }

        if (item.type === 'enemy') {
            el.classList.add('enemy');
            // Logique de patrouille simple
            item.originX = item.x;
            item.dir = 1;
        }

        gameWorld.appendChild(el);

        // Ajouter à la liste des entités physiques
        entities.push({
            ...item,
            el: el,
            w: item.w || 60,
            h: item.h || 60
        });
    });

    // Lancer la boucle
    requestAnimationFrame(gameLoop);
}

// --- GESTION DES ENTRÉES ---
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    // Empêcher le scroll de la page avec les flèches
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => keys[e.key] = false);

// --- BOUCLE DE JEU (GAME LOOP) ---
function gameLoop() {
    // 1. Appliquer les forces
    if (keys['ArrowRight'] || keys['d']) player.vx += 1;
    if (keys['ArrowLeft'] || keys['q']) player.vx -= 1;

    // Saut
    if ((keys['ArrowUp'] || keys['z'] || keys[' ']) && player.grounded) {
        player.vy = player.jumpForce;
        player.grounded = false;
    }

    // Physique
    player.vx *= physics.friction;
    player.vy -= physics.gravity; // La gravité tire vers le bas (vy négatif)

    player.x += player.vx;
    player.y += player.vy;

    // 2. Gestion des collisions
    player.grounded = false; // On suppose qu'il est en l'air avant de vérifier

    // Collision avec le sol du monde (tombé dans le vide)
    if (player.y < -100) {
        respawn(); // Game Over
    }

    // Collision avec les entités
    entities.forEach(ent => {
        // Logique ENNEMI (Patrouille)
        if (ent.type === 'enemy') {
            ent.x += 2 * ent.dir;
            if (Math.abs(ent.x - ent.originX) > (ent.dist || 100)) ent.dir *= -1;
            ent.el.style.left = ent.x + 'px';

            // Collision Joueur vs Ennemi
            if (checkRectCollide(player, { x: ent.x, y: ent.y, w: ent.w, h: ent.h })) {
                // Si on tombe dessus : Ennemi meurt
                if (player.vy < 0 && player.y > ent.y + ent.h / 2) {
                    player.vy = 10; // Rebond
                    ent.el.style.display = 'none'; // Disparait visuellement
                    ent.type = 'dead'; // Désactivé physiquement
                } else {
                    respawn(); // Mario meurt
                }
            }
            return; // Pas de collision solide avec ennemi
        }

        if (ent.type === 'dead') return;

        // Logique OBSTACLES SOLIDES
        // On vérifie une collision AABB simple
        if (checkRectCollide(player, ent)) {
            // Résolution de collision basique

            // On regarde d'où on vient pour savoir de quel côté repousser
            // Le "y" précédent (approximation)
            const prevY = player.y - player.vy;
            const prevX = player.x - player.vx;

            // Collision par le HAUT (atterrissage)
            if (prevY >= ent.y + ent.h) {
                player.y = ent.y + ent.h;
                player.vy = 0;
                player.grounded = true;

                // Interaction TUYAU
                if (ent.type === 'pipe' && keys['ArrowDown']) {
                    enterPipe(ent.link);
                }
            }
            // Collision par le BAS (tête cogne)
            else if (prevY + player.h <= ent.y) {
                player.y = ent.y - player.h;
                player.vy = 0;
            }
            // Collision LATÉRALE
            else {
                if (player.vx > 0) player.x = ent.x - player.w;
                else if (player.vx < 0) player.x = ent.x + ent.w;
                player.vx = 0;
            }
        }
    });

    // 3. Rendu (Mise à jour DOM)
    player.el.style.left = player.x + 'px';
    player.el.style.bottom = player.y + 'px';

    // Orientation visuelle (Sprite flip)
    if (player.vx > 0.1) player.el.style.transform = 'scaleX(1)';
    if (player.vx < -0.1) player.el.style.transform = 'scaleX(-1)';

    // 4. Caméra (Scrolling)
    // On centre la caméra sur le joueur
    const containerWidth = gameContainer.offsetWidth;
    const scrollX = player.x - containerWidth / 2;
    // On ne scroll pas en dessous de 0
    gameContainer.scrollLeft = Math.max(0, scrollX);

    requestAnimationFrame(gameLoop);
}

// --- UTILITAIRES ---

function checkRectCollide(r1, r2) {
    return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
    );
}

function respawn() {
    player.x = 50;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
    // Un petit flash rouge pour dire "Aïe"
    gameContainer.style.background = '#ffcccc';
    setTimeout(() => gameContainer.style.background = '#5c94fc', 100);
}

function enterPipe(url) {
    if (!url) return;

    // Animation d'entrée
    player.el.style.transition = 'bottom 1s ease';
    player.el.style.bottom = (parseInt(player.el.style.bottom) - 50) + 'px';

    // Jouer un son si tu veux ici

    setTimeout(() => {
        window.location.href = url;
    }, 1000);
}

// Démarrer quand la page est chargée
if (document.getElementById('game-world')) {
    initGame();
}