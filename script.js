// --- VARIABLES DU JEU ---
let score = 0;
let pointsParClic = 1;
let pointsParSeconde = 0;
let totalClics = 0;

let coutClic = 10;
let coutAuto = 50;
let coutSuperAuto = 500;
let coutBoost = 200;

let multiplicateurBoost = 1;
let tempsRestantBoost = 0;
let intervalBoost = null;

// --- SÉLECTION DES ÉLÉMENTS HTML ---
const elementScore = document.getElementById("score");
const elementPPS = document.getElementById("pps");
const listeSucces = [
    { id: "premier_clic", titre: "Premier Clic 🖱️", desc: "Effectuer votre tout premier clic.", debloque: false, condition: () => totalClics >= 1 },
    { id: "cent_points", titre: "Centenaire 💯", desc: "Atteindre un score de 100 points.", debloque: false, condition: () => score >= 100 },
    { id: "premier_auto", titre: "Automatisation 🤖", desc: "Posséder au moins 1 point par seconde.", debloque: false, condition: () => pointsParSeconde >= 1 },
    { id: "mille_points", titre: "Millionnaire en herbe 💰", desc: "Atteindre un score de 1 000 points.", debloque: false, condition: () => score >= 1000 },
    { id: "cliqueur_fou", titre: "Cliqueur Fou ⚡", desc: "Effectuer 100 clics manuels.", debloque: false, condition: () => totalClics >= 100 }
];

const elementToast = document.getElementById("toast");
const containerSucces = document.getElementById("achievements-list");
const unlockedCountText = document.getElementById("unlocked-count");
const totalCountText = document.getElementById("total-count");

const boutonClic = document.getElementById("click-btn");
const boutonUpgradeClic = document.getElementById("upgrade-click-btn");
const boutonUpgradeAuto = document.getElementById("upgrade-auto-btn");
const boutonUpgradeSuperAuto = document.getElementById("upgrade-super-auto-btn");
const boutonBoost = document.getElementById("boost-btn");
const boutonReset = document.getElementById("reset-btn");

const costClickText = document.getElementById("cost-click");
const costAutoText = document.getElementById("cost-auto");
const costSuperAutoText = document.getElementById("cost-super-auto");
const costBoostText = document.getElementById("cost-boost");

const boosterStatus = document.getElementById("booster-status");
const boosterTimer = document.getElementById("booster-timer");

// --- ÉVÉNEMENTS ---

// Clic principal
boutonClic.addEventListener("click", (e) => {
    totalClics++; // On compte le nombre total de clics
    const gain = pointsParClic * multiplicateurBoost;
    score += gain;
    creerTexteFlottant(e, `+${gain}`);
    verifierSucces();
    mettreAJourAffichage();
});

// Achat : Amélioration du Clic
boutonUpgradeClic.addEventListener("click", () => {
    if (score >= coutClic) {
        score -= coutClic;
        pointsParClic += 1;
        coutClic = Math.floor(coutClic * 1.5);
        sauvegarder();
        mettreAJourAffichage();
    }
});

// Initialiser l'affichage HTML des succès
function initialiserSuccesHTML() {
    containerSucces.innerHTML = "";
    totalCountText.textContent = listeSucces.length;

    listeSucces.forEach(s => {
        const card = document.createElement("div");
        card.id = `succes-${s.id}`;
        card.className = `achievement-card ${s.debloque ? 'unlocked' : ''}`;
        card.innerHTML = `
            <div>
                <div class="achievement-title">${s.titre}</div>
                <div class="achievement-desc">${s.desc}</div>
            </div>
            <div class="achievement-icon">${s.debloque ? '✅' : '🔒'}</div>
        `;
        containerSucces.appendChild(card);
    });

    mettreAJourCompteurSucces();
}

function verifierSucces() {
    listeSucces.forEach(s => {
        if (!s.debloque && s.condition()) {
            s.debloque = true;
            
            // Mise à jour visuelle de la carte
            const card = document.getElementById(`succes-${s.id}`);
            if (card) {
                card.classList.add("unlocked");
                card.querySelector(".achievement-icon").textContent = "✅";
            }

            afficherNotification(s.titre);
            mettreAJourCompteurSucces();
            sauvegarder();
        }
    });
}

function afficherNotification(titreSucces) {
    elementToast.textContent = `🏆 Succès débloqué : ${titreSucces} !`;
    elementToast.classList.remove("hidden");

    setTimeout(() => {
        elementToast.classList.add("hidden");
    }, 3500);
}

function mettreAJourCompteurSucces() {
    const nombreDebloques = listeSucces.filter(s => s.debloque).length;
    unlockedCountText.textContent = nombreDebloques;
}

// Achat : Auto-Clicker
boutonUpgradeAuto.addEventListener("click", () => {
    if (score >= coutAuto) {
        score -= coutAuto;
        pointsParSeconde += 1;
        coutAuto = Math.floor(coutAuto * 1.6);
        sauvegarder();
        mettreAJourAffichage();
    }
});

// Achat : Super Auto-Clicker
boutonUpgradeSuperAuto.addEventListener("click", () => {
    if (score >= coutSuperAuto) {
        score -= coutSuperAuto;
        pointsParSeconde += 10;
        coutSuperAuto = Math.floor(coutSuperAuto * 1.7);
        sauvegarder();
        mettreAJourAffichage();
    }
});

// Achat : Booster Temporaire x2
boutonBoost.addEventListener("click", () => {
    if (score >= coutBoost && tempsRestantBoost === 0) {
        score -= coutBoost;
        coutBoost = Math.floor(coutBoost * 2);
        
        // Activer le booster
        multiplicateurBoost = 2;
        tempsRestantBoost = 10;
        boosterStatus.classList.remove("hidden");
        boosterTimer.textContent = tempsRestantBoost;

        intervalBoost = setInterval(() => {
            tempsRestantBoost--;
            boosterTimer.textContent = tempsRestantBoost;

            if (tempsRestantBoost <= 0) {
                clearInterval(intervalBoost);
                multiplicateurBoost = 1;
                boosterStatus.classList.add("hidden");
            }
            mettreAJourAffichage();
        }, 1000);

        sauvegarder();
        mettreAJourAffichage();
    }
});

// Réinitialiser la partie
boutonReset.addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment recommencer à zéro ?")) {
        localStorage.removeItem("clickerSave");
        location.reload();
    }
});

// --- BOUCLES TEMPORELLES ---

// Auto-clicker : s'exécute 10 fois par seconde pour la fluidité
setInterval(() => {
    if (pointsParSeconde > 0) {
        score += (pointsParSeconde * multiplicateurBoost) / 10;
        mettreAJourAffichage();
    }
}, 100);

// Sauvegarde automatique toutes les 5 secondes
setInterval(() => {
    sauvegarder();
}, 5000);

// --- FONCTIONS AUXILIAIRES ---

function mettreAJourAffichage() {
    elementScore.textContent = Math.floor(score);
    elementPPS.textContent = pointsParSeconde * multiplicateurBoost;

    costClickText.textContent = coutClic;
    costAutoText.textContent = coutAuto;
    costSuperAutoText.textContent = coutSuperAuto;
    costBoostText.textContent = coutBoost;

    // Activer / Désactiver les boutons selon le score
    boutonUpgradeClic.disabled = score < coutClic;
    boutonUpgradeAuto.disabled = score < coutAuto;
    boutonUpgradeSuperAuto.disabled = score < coutSuperAuto;
    boutonBoost.disabled = score < coutBoost || tempsRestantBoost > 0;
}

function creerTexteFlottant(event, texteAffiche) {
    const texte = document.createElement("div");
    texte.classList.add("floating-text");
    texte.textContent = texteAffiche;
    texte.style.left = `${event.clientX}px`;
    texte.style.top = `${event.clientY}px`;
    document.body.appendChild(texte);

    setTimeout(() => texte.remove(), 800);
}

// --- SAUVEGARDE & CHARGEMENT (localStorage) ---

function sauvegarder() {
    const sauvegarde = {
        score: score,
        pointsParClic: pointsParClic,
        pointsParSeconde: pointsParSeconde,
        coutClic: coutClic,
        coutAuto: coutAuto,
        coutSuperAuto: coutSuperAuto,
        coutBoost: coutBoost,
        totalClics: totalClics,
        succesDebloques: listeSucces.filter(s => s.debloque).map(s => s.id)
    };
    localStorage.setItem("clickerSave", JSON.stringify(sauvegarde));
}

function charger() {
    const donnees = localStorage.getItem("clickerSave");
    if (donnees) {
        const sauvegarde = JSON.parse(donnees);
        score = sauvegarde.score || 0;
        pointsParClic = sauvegarde.pointsParClic || 1;
        pointsParSeconde = sauvegarde.pointsParSeconde || 0;
        coutClic = sauvegarde.coutClic || 10;
        coutAuto = sauvegarde.coutAuto || 50;
        coutSuperAuto = sauvegarde.coutSuperAuto || 500;
        coutBoost = sauvegarde.coutBoost || 200;
        totalClics = sauvegarde.totalClics || 0;

        // Restaurer les succès
        const succesIds = sauvegarde.succesDebloques || [];
        listeSucces.forEach(s => {
            if (succesIds.includes(s.id)) {
                s.debloque = true;
            }
        });
    }
}

// Appels initiaux lors du chargement
charger();
initialiserSuccesHTML();
mettreAJourAffichage();