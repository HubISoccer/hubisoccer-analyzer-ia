// ========== HUBISAI.JS – VERSION FINALE AVEC SUPABASE (CORRIGÉE) ==========

// Configuration Supabase
const supabaseUrl = 'https://hlszrqnrzfvzjwindwpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3pycW5yemZ2emp3aW5kd3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ2NzYsImV4cCI6MjA4ODQ5MDY3Nn0.LXdNt0NWF_MlQy7MTclrdGl-RP7pfxl-xjtysIQEBXU';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

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

// -------------------- VARIABLES GLOBALES --------------------
let currentUser = null;
let credits = 0;

// -------------------- FONCTIONS UTILISATEUR --------------------
async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    currentUser = user;
    if (user) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();
        if (!error && data) {
            credits = data.credits;
        } else {
            credits = 0;
        }
        updateCreditDisplay();
        updateMenuForAuth();
    } else {
        credits = 0;
        updateCreditDisplay();
        updateMenuForAuth();
    }
}

function updateMenuForAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const creditsBadge = document.querySelector('.credits-badge');

    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (creditsBadge) creditsBadge.style.display = 'flex';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (creditsBadge) creditsBadge.style.display = 'flex';
    }
}

function updateCreditDisplay() {
    const creditSpan = document.getElementById('creditDisplay');
    if (creditSpan) creditSpan.textContent = credits.toFixed(1);
}

// Déconnexion
document.addEventListener('click', async (e) => {
    if (e.target.id === 'logoutBtn') {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        window.location.reload();
    }
});

// -------------------- SÉLECTION DU TYPE D'ANALYSE --------------------
const radioAnalysis = document.querySelectorAll('input[name="analysisType"]');
const costDisplay = document.getElementById('costDisplay');
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

function updateCostDisplay() {
    const selected = document.querySelector('input[name="analysisType"]:checked');
    if (!selected) return;
    const cost = analysisCosts[selected.value] || 0.5;
    costDisplay.innerHTML = `Coût de l'analyse sélectionnée : <strong>${cost} HubiSai</strong>`;
}

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

    let ipA = (tcA * 4) + ((tA - tcA) * 1) + (adA * 0.7);
    let ipB = (tcB * 4) + ((tB - tcB) * 1) + (adB * 0.7);
    let rankBonusA = (rankB - rankA) * 0.5;
    let rankBonusB = (rankA - rankB) * 0.5;
    let totalPowerA = (ipA + (formA * 2) + rankBonusA) * stakes;
    let totalPowerB = (ipB + (formB * 2) + rankBonusB) * stakes;

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

    let totalTirs = tA + tB;
    let predTirs = "";
    if (totalTirs > 25) predTirs = "Plus de 25 tirs";
    else if (totalTirs > 20) predTirs = "Entre 20 et 25 tirs";
    else predTirs = "Moins de 20 tirs";

    return { dc, buts, predTirs, reasonDC, totalPowerA, totalPowerB };
}

// -------------------- FONCTIONS DE CRÉDITS ET SAUVEGARDE --------------------
async function hasEnoughCredit(cost) {
    return credits >= cost;
}

async function debitCredit(cost) {
    if (!currentUser) {
        alert('Vous devez être connecté pour effectuer une analyse.');
        return false;
    }
    if (credits < cost) {
        alert('Crédits insuffisants.');
        return false;
    }

    const newCredits = credits - cost;
    const { error } = await supabaseClient
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', currentUser.id);

    if (error) {
        console.error('Erreur mise à jour crédits:', error);
        alert('Erreur lors du débit des crédits.');
        return false;
    }

    credits = newCredits;
    updateCreditDisplay();
    return true;
}

async function saveAnalysis(type, inputData, result, cost) {
    if (!currentUser) return;

    const { error } = await supabaseClient
        .from('analyses')
        .insert([{
            user_id: currentUser.id,
            type: type,
            input_data: inputData,
            result: result,
            credits_cost: cost
        }]);

    if (error) console.error('Erreur sauvegarde analyse:', error);
}

// -------------------- HISTORIQUE LOCAL (en attendant de charger depuis BDD) --------------------
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
                <button class="history-win" data-id="${h.id}">✅</button>
                <button class="history-lose" data-id="${h.id}">❌</button>
            </div>
        </div>
    `).join('');
}

document.getElementById('historyList')?.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    if (isNaN(id)) return;

    if (btn.classList.contains('history-win')) {
        history = history.map(h => h.id === id ? {...h, status: 'GAGNÉ'} : h);
    } else if (btn.classList.contains('history-lose')) {
        history = history.map(h => h.id === id ? {...h, status: 'PERDU'} : h);
    }
    saveHistory();
    renderHistory();
});

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
document.getElementById('calcBtn').addEventListener('click', async function() {
    const selectedAnalysis = document.querySelector('input[name="analysisType"]:checked');
    if (!selectedAnalysis) {
        alert('Veuillez sélectionner un type d\'analyse.');
        return;
    }
    const analysisType = selectedAnalysis.value;
    const cost = analysisCosts[analysisType] || 0.5;

    if (!currentUser) {
        alert('Vous devez être connecté pour effectuer une analyse.');
        return;
    }

    if (!await hasEnoughCredit(cost)) {
        alert(`Crédits insuffisants. Il vous faut ${cost} HubiSai.`);
        return;
    }

    // Récupérer les données saisies
    const inputData = {
        min: document.getElementById('min').value,
        score: document.getElementById('score').value,
        tA: document.getElementById('tA').value,
        tB: document.getElementById('tB').value,
        tcA: document.getElementById('tcA').value,
        tcB: document.getElementById('tcB').value,
        adA: document.getElementById('adA').value,
        adB: document.getElementById('adB').value,
        rankA: document.getElementById('rankA').value,
        rankB: document.getElementById('rankB').value,
        formA: document.getElementById('formA').value,
        formB: document.getElementById('formB').value,
        country: countrySelect.value,
        competition: compSelect.value,
        nameA: document.getElementById('nameA').value,
        nameB: document.getElementById('nameB').value
    };

    const result = calculatePrediction();
    let resultText = "";
    let displayHtml = "<h2>🎯 RÉSULTAT IA HUBISOCCER</h2>";

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

    displayHtml += `<button id="saveResultBtn" class="btn-small" style="width:100%; margin-top:15px;">💾 ARCHIVER</button>`;

    // Débiter et sauvegarder
    const debited = await debitCredit(cost);
    if (!debited) return;

    await saveAnalysis(analysisType, inputData, result, cost);

    // Afficher le résultat
    const resultDiv = document.getElementById('finalResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = displayHtml;

    // Attacher l'événement au bouton "Archiver"
    document.getElementById('saveResultBtn')?.addEventListener('click', function() {
        const selected = document.querySelector('input[name="analysisType"]:checked');
        const typeName = selected ? selected.nextElementSibling.innerText.split('-')[0].trim() : 'Analyse';
        addHistory(typeName, resultText);
        alert('Pronostic archivé !');
    });
});

// -------------------- MENU MOBILE --------------------
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('open');
            }
        });

        navLinks.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        console.error('Menu mobile : éléments non trouvés');
    }

    // Initialisation des écouteurs de radios
    radioAnalysis.forEach(radio => {
        radio.addEventListener('change', updateCostDisplay);
    });
    updateCostDisplay();

    // Charger les données utilisateur et historique
    checkUser();
    loadHistory();

    // Écouter les changements d'auth
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            checkUser();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            credits = 0;
            updateCreditDisplay();
            updateMenuForAuth();
        }
    });
});