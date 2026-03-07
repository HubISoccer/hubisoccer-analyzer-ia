// ========== HUBISAI.JS – LOGIQUE COMPLÈTE ==========

// -------------------- DONNÉES DES COMPÉTITIONS --------------------
const competitionsData = {
    angleterre: {
        "Premier League": { stakes: 1.0, type: "league" },
        "Championship": { stakes: 1.0, type: "league" },
        "FA Cup": { stakes: 1.8, type: "cup" }
    },
    espagne: {
        "La Liga": { stakes: 1.0, type: "league" },
        "La Liga 2 (Segunda)": { stakes: 1.0, type: "league" },
        "Copa del Rey": { stakes: 1.8, type: "cup" }
    },
    italie: {
        "Serie A": { stakes: 1.0, type: "league" },
        "Serie B": { stakes: 1.0, type: "league" },
        "Coppa Italia": { stakes: 1.8, type: "cup" }
    },
    allemagne: {
        "Bundesliga": { stakes: 1.0, type: "league" },
        "2. Bundesliga": { stakes: 1.0, type: "league" },
        "DFB-Pokal": { stakes: 1.8, type: "cup" }
    },
    france: {
        "Ligue 1": { stakes: 1.0, type: "league" },
        "Ligue 2": { stakes: 1.0, type: "league" },
        "Coupe de France": { stakes: 1.8, type: "cup" }
    },
    portugal: {
        "Primeira Liga": { stakes: 1.0, type: "league" },
        "Liga Portugal 2": { stakes: 1.0, type: "league" },
        "Taça de Portugal": { stakes: 1.8, type: "cup" }
    },
    paysbas: {
        "Eredivisie": { stakes: 1.0, type: "league" },
        "Eerste Divisie": { stakes: 1.0, type: "league" },
        "KNVB Beker": { stakes: 1.8, type: "cup" }
    },
    bresil: {
        "Série A (Brasileirão)": { stakes: 1.0, type: "league" },
        "Série B": { stakes: 1.0, type: "league" },
        "Copa do Brasil": { stakes: 1.8, type: "cup" }
    },
    belgique: {
        "Pro League": { stakes: 1.0, type: "league" },
        "Challenger Pro League": { stakes: 1.0, type: "league" },
        "Coupe de Belgique": { stakes: 1.8, type: "cup" }
    },
    turquie: {
        "Süper Lig": { stakes: 1.0, type: "league" },
        "TFF 1. Lig": { stakes: 1.0, type: "league" },
        "Coupe de Turquie": { stakes: 1.8, type: "cup" }
    },
    europe: {
        "UEFA Champions League (Phase de groupes)": { stakes: 1.3, type: "europe-group" },
        "UEFA Champions League (Élimination directe)": { stakes: 2.0, type: "europe-knockout" },
        "UEFA Europa League (Phase de groupes)": { stakes: 1.2, type: "europe-group" },
        "UEFA Europa League (Élimination directe)": { stakes: 1.8, type: "europe-knockout" },
        "UEFA Conference League (Phase de groupes)": { stakes: 1.1, type: "europe-group" },
        "UEFA Conference League (Élimination directe)": { stakes: 1.6, type: "europe-knockout" }
    }
};

// -------------------- GESTION DES CRÉDITS --------------------
let credit = 0; // Valeur initiale (sera chargée depuis localStorage)
const CREDIT_PER_RECHARGE = 25000; // Pour l'admin, on mettra à jour après authentification

function initCredits() {
    // Simule un utilisateur : si aucun crédit enregistré, on donne 25000 (pour admin)
    // Dans la vraie app, on récupérera depuis Supabase
    const stored = localStorage.getItem('hubisai_credit');
    if (stored) {
        credit = parseInt(stored);
    } else {
        credit = 25000; // Admin par défaut
        localStorage.setItem('hubisai_credit', credit);
    }
    document.getElementById('creditDisplay').textContent = credit;
}

function updateCreditDisplay() {
    document.getElementById('creditDisplay').textContent = credit;
    localStorage.setItem('hubisai_credit', credit);
}

// Vérifier si assez de crédits
function hasEnoughCredit(cost) {
    return credit >= cost;
}

// Débiter
function debitCredit(cost) {
    if (credit >= cost) {
        credit -= cost;
        updateCreditDisplay();
        return true;
    }
    return false;
}

// Rechargement (simulé)
document.getElementById('rechargeBtn')?.addEventListener('click', () => {
    // Ici, rediriger vers FedaPay ou autre
    alert("Redirection vers FedaPay pour recharger (simulation)");
    // Après paiement, on ajouterait les crédits
    // Exemple : credit += 25000; updateCreditDisplay();
});

// -------------------- GESTION DES COMPÉTITIONS --------------------
const countrySelect = document.getElementById('countrySelect');
const compSelect = document.getElementById('compSelect');
const stakesDisplay = document.getElementById('stakesDisplay');

countrySelect.addEventListener('change', function() {
    const country = this.value;
    compSelect.innerHTML = '<option value="">Choisissez une compétition</option>';
    if (!country) return;

    const comps = competitionsData[country];
    for (let compName in comps) {
        const option = document.createElement('option');
        option.value = compName;
        option.textContent = compName;
        compSelect.appendChild(option);
    }
});

compSelect.addEventListener('change', function() {
    const country = countrySelect.value;
    const comp = this.value;
    if (!country || !comp) return;
    const stakes = competitionsData[country][comp].stakes;
    stakesDisplay.textContent = stakes.toFixed(1);
});

// -------------------- ALGORITHME DE CALCUL --------------------
function calculatePrediction() {
    // Récupération des valeurs
    const min = parseInt(document.getElementById('min').value) || 1;
    const score = document.getElementById('score').value || '0-0';
    const [bA, bB] = score.split('-').map(Number);
    const stakes = parseFloat(stakesDisplay.textContent) || 1.0;

    // Stats live
    const tA = parseInt(document.getElementById('tA').value) || 0;
    const tB = parseInt(document.getElementById('tB').value) || 0;
    const tcA = parseInt(document.getElementById('tcA').value) || 0;
    const tcB = parseInt(document.getElementById('tcB').value) || 0;
    const adA = parseInt(document.getElementById('adA').value) || 0;
    const adB = parseInt(document.getElementById('adB').value) || 0;

    // Stats pré-match
    const rankA = parseInt(document.getElementById('rankA').value) || 10;
    const rankB = parseInt(document.getElementById('rankB').value) || 10;
    const formA = parseInt(document.getElementById('formA').value) || 3;
    const formB = parseInt(document.getElementById('formB').value) || 3;

    // --- Indice de puissance live ---
    let ipA = (tcA * 4) + ((tA - tcA) * 1) + (adA * 0.7);
    let ipB = (tcB * 4) + ((tB - tcB) * 1) + (adB * 0.7);

    // Bonus classement
    let rankBonusA = (rankB - rankA) * 0.5;
    let rankBonusB = (rankA - rankB) * 0.5;

    let totalPowerA = ipA + (formA * 2) + rankBonusA;
    let totalPowerB = ipB + (formB * 2) + rankBonusB;

    // Application de l'enjeu (les équipes réagissent à la pression)
    totalPowerA *= stakes;
    totalPowerB *= stakes;

    // --- DOUBLE CHANCE ---
    let dc = "";
    let reasonDC = "";
    if (totalPowerA > totalPowerB * 1.3) {
        dc = "1X";
        reasonDC = "L'équipe A domine nettement.";
    } else if (totalPowerB > totalPowerA * 1.3) {
        dc = "2X";
        reasonDC = "L'équipe B a une nette supériorité.";
    } else {
        dc = "12";
        reasonDC = "Match très serré, le nul improbable.";
    }

    // --- PRÉDICTION BUTS ---
    let buts = "";
    let dangerTotal = (tcA + tcB) / min; // tirs cadrés par minute
    let totalScore = bA + bB;

    if (dangerTotal > 0.25 || (stakes > 1.5 && min > 70)) {
        buts = "+2,5 Buts";
    } else if (dangerTotal > 0.12) {
        buts = "+1,5 Buts";
    } else if (dangerTotal > 0.06) {
        buts = "+0,5 Buts";
    } else {
        buts = (totalScore > 2) ? "-3,5 Buts" : "-2,5 Buts";
    }

    return { dc, buts, reasonDC, totalPowerA, totalPowerB };
}

// -------------------- HISTORIQUE --------------------
let history = [];

function loadHistory() {
    const stored = localStorage.getItem('hubisai_history');
    if (stored) {
        history = JSON.parse(stored);
    }
    renderHistory();
}

function saveHistory() {
    localStorage.setItem('hubisai_history', JSON.stringify(history));
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    if (history.length === 0) {
        list.innerHTML = '<p class="no-data">Aucun historique.</p>';
        return;
    }
    let html = '';
    history.slice().reverse().forEach(h => {
        html += `
            <div class="history-item" data-id="${h.id}">
                <div>
                    <strong>${h.result}</strong><br>
                    <small>${new Date(h.date).toLocaleString()}</small>
                </div>
                <div>
                    <button class="win" onclick="setHistoryResult(${h.id}, 'GAGNÉ')">✅</button>
                    <button class="lose" onclick="setHistoryResult(${h.id}, 'PERDU')">❌</button>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

window.setHistoryResult = function(id, status) {
    history = history.map(h => h.id === id ? {...h, status} : h);
    saveHistory();
    renderHistory();
};

function addHistory(resultText) {
    history.push({
        id: Date.now(),
        result: resultText,
        date: new Date().toISOString(),
        status: 'Attente'
    });
    saveHistory();
    renderHistory();
}

// -------------------- BOUTON DE CALCUL --------------------
document.getElementById('calcBtn').addEventListener('click', function() {
    // Vérifier les crédits (coût = 1 pour l'instant)
    if (!hasEnoughCredit(1)) {
        alert('Crédits insuffisants. Veuillez recharger.');
        return;
    }

    const result = calculatePrediction();
    const resultText = `${result.dc} | ${result.buts}`;

    // Débiter 1 crédit
    debitCredit(1);

    // Afficher le résultat
    const resultDiv = document.getElementById('finalResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h2>🎯 RÉSULTAT IA HUBISOCCER</h2>
        <div class="res-box">
            <span class="res-label">DOUBLE CHANCE</span>
            <span class="res-val">${result.dc}</span>
        </div>
        <div class="res-box">
            <span class="res-label">PRÉDICTION BUTS</span>
            <span class="res-val accent">${result.buts}</span>
        </div>
        <p style="margin-top:15px;"><strong>Analyse :</strong> ${result.reasonDC}</p>
        <p><strong>Puissances :</strong> A = ${result.totalPowerA.toFixed(1)} | B = ${result.totalPowerB.toFixed(1)}</p>
        <button onclick="saveCurrentResult('${resultText}')" class="btn-small" style="width:100%; margin-top:10px;">💾 ARCHIVER</button>
    `;
});

// Sauvegarder le résultat dans l'historique
window.saveCurrentResult = function(text) {
    addHistory(text);
    alert('Pronostic archivé !');
};

// -------------------- MENU MOBILE (copié du projet principal) --------------------
document.addEventListener('click', function(e) {
    const menuToggle = e.target.closest('#menuToggle');
    if (menuToggle) {
        e.preventDefault();
        const navLinks = document.getElementById('navLinks');
        if (navLinks) {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
        }
        return;
    }
    if (!e.target.closest('.nav-links') && !e.target.closest('#menuToggle')) {
        const navLinks = document.getElementById('navLinks');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const toggle = document.getElementById('menuToggle');
            if (toggle) toggle.classList.remove('open');
        }
    }
});

// -------------------- GESTION DE LA LANGUE (simplifiée) --------------------
document.getElementById('langSelect')?.addEventListener('change', function(e) {
    // Ici, on pourrait changer la langue, mais pour l'instant on stocke juste
    localStorage.setItem('hubiLang', e.target.value);
});

// -------------------- INITIALISATION --------------------
initCredits();
loadHistory();