// ========== HUBISAI.JS – VERSION AVEC SUPABASE ==========

// Configuration Supabase
const supabaseUrl = 'https://hlszrqnrzfvzjwindwpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3pycW5yemZ2emp3aW5kd3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTQ2NzYsImV4cCI6MjA4ODQ5MDY3Nn0.LXdNt0NWF_MlQy7MTclrdGl-RP7pfxl-xjtysIQEBXU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// -------------------- DONNÉES DES COMPÉTITIONS --------------------
const competitionsData = {
    angleterre: {
        "Premier League": { stakes: 1.0, type: "league" },
        "Championship": { stakes: 1.0, type: "league" },
        "FA Cup": { stakes: 1.8, type: "cup" }
    },
    // ... (le reste des données est identique à avant, je ne réécris pas pour gagner de la place)
    // Assure-toi de conserver l'intégralité de l'objet competitionsData de la version précédente.
};

// -------------------- GESTION DE L'UTILISATEUR --------------------
let currentUser = null;
let credits = 0;

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    if (user) {
        // Charger les crédits depuis la table profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();
        if (!error && data) {
            credits = data.credits;
        } else {
            credits = 15; // fallback
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
    const creditsBadge = document.querySelector('.credits-badge');

    if (currentUser) {
        // Connecté
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        if (creditsBadge) creditsBadge.style.display = 'flex';
    } else {
        // Non connecté
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (creditsBadge) creditsBadge.style.display = 'flex'; // On peut afficher 0 crédit
    }
}

function updateCreditDisplay() {
    const creditSpan = document.getElementById('creditDisplay');
    if (creditSpan) creditSpan.textContent = credits.toFixed(1);
}

// -------------------- FONCTIONS DE CRÉDITS --------------------
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

    // Mettre à jour dans Supabase
    const newCredits = credits - cost;
    const { error } = await supabase
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

// -------------------- SAUVEGARDE DES ANALYSES --------------------
async function saveAnalysis(type, inputData, result, cost) {
    if (!currentUser) return;

    const { error } = await supabase
        .from('analyses')
        .insert([
            {
                user_id: currentUser.id,
                type: type,
                input_data: inputData,
                result: result,
                credits_cost: cost
            }
        ]);

    if (error) console.error('Erreur sauvegarde analyse:', error);
}

// -------------------- BOUTON DE CALCUL MODIFIÉ --------------------
document.getElementById('calcBtn').addEventListener('click', async function() {
    const selectedAnalysis = document.querySelector('input[name="analysisType"]:checked');
    if (!selectedAnalysis) {
        alert('Veuillez sélectionner un type d\'analyse.');
        return;
    }
    const analysisType = selectedAnalysis.value;
    const cost = analysisCosts[analysisType] || 0.5;

    if (!await hasEnoughCredit(cost)) {
        alert(`Crédits insuffisants. Il vous faut ${cost} HubiSai.`);
        return;
    }

    // Récupérer toutes les données saisies pour les sauvegarder
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
        country: document.getElementById('countrySelect').value,
        competition: document.getElementById('compSelect').value,
        nameA: document.getElementById('nameA').value,
        nameB: document.getElementById('nameB').value
    };

    const result = calculatePrediction(); // fonction inchangée
    let resultText = "";
    let displayHtml = "<h2>🎯 RÉSULTAT IA HUBISOCCER</h2>";

    // Construction de l'affichage (identique à avant)
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

    // Débiter les crédits
    if (!await debitCredit(cost)) return;

    // Sauvegarder l'analyse dans Supabase
    await saveAnalysis(analysisType, inputData, result, cost);

    // Afficher le résultat
    const resultDiv = document.getElementById('finalResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = displayHtml;

    // Attacher l'événement au bouton "Archiver"
    document.getElementById('saveResultBtn')?.addEventListener('click', function() {
        const selected = document.querySelector('input[name="analysisType"]:checked');
        const typeName = selected ? selected.nextElementSibling.innerText.split('-')[0].trim() : 'Analyse';
        // Ici on pourrait aussi sauvegarder l'analyse manuellement, mais déjà fait
        addHistory(typeName, resultText);
        alert('Pronostic archivé !');
    });
});

// -------------------- MENU MOBILE (inchangé, mais on s'assure que les éléments existent) --------------------
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
}

// -------------------- INITIALISATION --------------------
checkUser();

// On peut aussi écouter les changements d'auth
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkUser();
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        credits = 0;
        updateCreditDisplay();
        updateMenuForAuth();
    }
});