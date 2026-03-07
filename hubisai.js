// ========== HUBISAI.JS – VERSION COMPLÈTE AVEC COÛTS VARIABLES ==========

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
let credit = 25000; // Pour toi l'admin
const CREDIT_KEY = 'hubisai_credit';

// Tableau des coûts par type d'analyse
const analysisCosts = {
    simple: 0.5,
    dc: 1,
    buts05: 1,
    buts15: 1,
    buts25: 1,
    totalTirs: 1.5,
    combo: 2,
    full: 3
};

function initCredits() {
    const stored = localStorage.getItem(CREDIT_KEY);
    if (stored) {
        credit = parseFloat(stored);
    } else {
        credit = 25000;
        localStorage.setItem(CREDIT_KEY, credit);
    }
    document.getElementById('creditDisplay').textContent = credit.toFixed(1);
}

function updateCreditDisplay() {
    document.getElementById('creditDisplay').textContent = credit.toFixed(1);
    localStorage.setItem(CREDIT_KEY, credit);
}

function hasEnoughCredit(cost) {
    return credit >= cost;
}

function debitCredit(cost) {
    if (credit >= cost) {
        credit -= cost;
        updateCreditDisplay();
        return true;
    }
    return false;
}

// Rechargement (simulé)
document.addEventListener('click', function(e) {
    if (e.target.closest('#rechargeBtn')) {
        alert("Redirection vers FedaPay pour recharger (simulation)");
        // Logique de paiement à intégrer plus tard
    }
});

// -------------------- SÉLECTION DU TYPE D'ANALYSE --------------------
const radioAnalysis = document.querySelectorAll('input[name="analysisType"]');
const costDisplay = document.getElementById('costDisplay');

function updateCostDisplay() {
    const selected = document.querySelector('input[name="analysisType"]:checked');
    if (!selected) return;
    const cost = analysisCosts[selected.value] || 0.5;
    costDisplay.innerHTML = `Coût de l'analyse sélectionnée : <strong>${cost} HubiSai</strong>`;
}

radioAnalysis.forEach(radio => {
    radio.addEventListener('change', updateCostDisplay);
});
updateCostDisplay(); // Initialisation

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

// -------------------- ALGORITHME DE CALCUL AMÉLIORÉ --------------------
function calculatePrediction() {
    // Récupération des valeurs
    const min = parseInt(document.getElementById('min').value) || 1;
    const score = document.getElementById('score').value || '0-0';
    const [bA, bB] = score.split('-').map(Number);
    const stakes = parseFloat(stakesDisplay.textContent) || 1.0;

    const tA = parseInt(document.getElementById('tA').value) || 0;
    const tB = parseInt(document.getElementById('tB').value) || 0;
    const tcA = parseInt(document.getElementById('tcA').value) || 0;
    const tcB = parseInt(document.getElementById('tcB').value) || 0;
    const adA = parseInt(document.getElementById('adA').value) || 0;
    const adB = parseInt(document.getElementById('adB').value) || 0;
    const rankA = parseInt(document.getElementById('rankA').value) || 10;
    const rankB = parseInt(document.getElementById('rankB').value) || 10;
    const formA = parseInt(document.getElementById('formA').value) || 3;
    const formB = parseInt(document.getElementById('formB').value) || 3;

    // Indices de puissance
    let ipA = (tcA * 4) + ((tA - tcA) * 1) + (adA * 0.7);
    let ipB = (tcB * 4) + ((tB - tcB) * 1) + (adB * 0.7);
    let rankBonusA = (rankB - rankA) * 0.5;
    let rankBonusB = (rankA - rankB) * 0.5;
    let totalPowerA = (ipA + (formA * 2) + rankBonusA) * stakes;
    let totalPowerB = (ipB + (formB * 2) + rankBonusB) * stakes;

    // Double Chance
    let dc = "", reasonDC = "";
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

    // Prédiction Buts
    let buts = "";
    let dangerTotal = (tcA + tcB) / min;
    if (dangerTotal > 0.25 || (stakes > 1.5 && min > 70)) {
        buts = "+2,5 Buts";
    } else if (dangerTotal > 0.12) {
        buts = "+1,5 Buts";
    } else if (dangerTotal > 0.06) {
        buts = "+0,5 Buts";
    } else {
        buts = (bA + bB > 2) ? "-3,5 Buts" : "-2,5 Buts";
    }

    // Total de tirs estimé
    let totalTirs = tA + tB;
    let predTirs = "";
    if (totalTirs > 25) predTirs = "Plus de 25 tirs";
    else if (totalTirs > 20) predTirs = "Entre 20 et 25 tirs";
    else predTirs = "Moins de 20 tirs";

    return { dc, buts, predTirs, reasonDC, totalPowerA, totalPowerB };
}

// -------------------- HISTORIQUE --------------------
let history = [];

function loadHistory() {
    const stored = localStorage.getItem('hubisai_history');
    if (stored) history = JSON.parse(stored);
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
    list.innerHTML = history.slice().reverse().map(h => `
        <div class="history-item" data-id="${h.id}">
            <div>
                <strong>${h.type} : ${h.result}</strong><br>
                <small>${new Date(h.date).toLocaleString()}</small>
            </div>
            <div>
                <button onclick="setHistoryResult(${h.id}, 'GAGNÉ')">✅</button>
                <button onclick="setHistoryResult(${h.id}, 'PERDU')">❌</button>
            </div>
        </div>
    `).join('');
}

window.setHistoryResult = function(id, status) {
    history = history.map(h => h.id === id ? {...h, status} : h);
    saveHistory();
    renderHistory();
};

function addHistory(type, resultText) {
    history.push({
        id: Date.now(),
        type: type,
        result: resultText,
        date: new Date().toISOString(),
        status: 'Attente'
    });
    saveHistory();
    renderHistory();
}

// -------------------- BOUTON DE CALCUL --------------------
document.getElementById('calcBtn').addEventListener('click', function() {
    const selectedAnalysis = document.querySelector('input[name="analysisType"]:checked');
    if (!selectedAnalysis) {
        alert('Veuillez sélectionner un type d\'analyse.');
        return;
    }
    const analysisType = selectedAnalysis.value;
    const cost = analysisCosts[analysisType] || 0.5;

    if (!hasEnoughCredit(cost)) {
        alert(`Crédits insuffisants. Il vous faut ${cost} HubiSai. Veuillez recharger.`);
        return;
    }

    const result = calculatePrediction();
    let resultText = "";
    let displayHtml = "<h2>🎯 RÉSULTAT IA HUBISOCCER</h2>";

    // Construction de l'affichage selon le type choisi
    if (analysisType === "simple" || analysisType === "combo" || analysisType === "full") {
        displayHtml += `<div class="res-box"><span class="res-label">Analyse</span><span class="res-val">${result.reasonDC} | Puissance A: ${result.totalPowerA.toFixed(1)} B: ${result.totalPowerB.toFixed(1)}</span></div>`;
        resultText += `Analyse: ${result.reasonDC}`;
    }
    if (analysisType === "dc" || analysisType === "combo" || analysisType === "full") {
        displayHtml += `<div class="res-box"><span class="res-label">Double Chance</span><span class="res-val">${result.dc}</span></div>`;
        resultText += ` DC: ${result.dc}`;
    }
    if (analysisType === "buts05" || analysisType === "buts15" || analysisType === "buts25" || analysisType === "combo" || analysisType === "full") {
        displayHtml += `<div class="res-box"><span class="res-label">Prédiction Buts</span><span class="res-val gold">${result.buts}</span></div>`;
        resultText += ` Buts: ${result.buts}`;
    }
    if (analysisType === "totalTirs" || analysisType === "full") {
        displayHtml += `<div class="res-box"><span class="res-label">Total Tirs</span><span class="res-val">${result.predTirs}</span></div>`;
        resultText += ` Tirs: ${result.predTirs}`;
    }

    displayHtml += `<button onclick="saveCurrentResult('${resultText}')" class="btn-small" style="width:100%; margin-top:15px;">💾 ARCHIVER</button>`;

    // Débiter les crédits
    debitCredit(cost);

    // Afficher
    const resultDiv = document.getElementById('finalResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = displayHtml;
});

window.saveCurrentResult = function(text) {
    const selected = document.querySelector('input[name="analysisType"]:checked');
    const typeName = selected ? selected.nextElementSibling.innerText.split('-')[0].trim() : 'Analyse';
    addHistory(typeName, text);
    alert('Pronostic archivé !');
};

// -------------------- MENU MOBILE --------------------
document.getElementById('menuToggle')?.addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('active');
    this.classList.toggle('open');
});

// -------------------- INITIALISATION --------------------
initCredits();
loadHistory();