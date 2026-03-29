const TRANSLATIONS = {
  en: {
    "title":          "Passphrase Generator",
    "words":          "Words",
    "words-hint":     "4 or more recommended",
    "separator":      "Separator",
    "sep-hyphen":     "Hyphen (-)",
    "sep-underscore": "Underscore (_)",
    "sep-dot":        "Dot (.)",
    "sep-space":      "Space ( )",
    "sep-at":         "At (@)",
    "sep-tilde":      "Tilde (~)",
    "sep-asterisk":   "Asterisk (*)",
    "sep-hash":       "Hash (#)",
    "sep-none":       "None",
    "capitalize":     "Capitalization",
    "cap-none":       "None",
    "cap-all":        "All words",
    "cap-random":     "Some words",
    "include-number": "Include digits",
    "history":        "Previous",
    "generate":       "Generate",
    "copy":           "Copy",
    "copied":         "Copied!"
  },
  pl: {
    "title":          "Generator haseł",
    "words":          "Liczba słów",
    "words-hint":     "Zalecane 4 lub więcej",
    "separator":      "Separator",
    "sep-hyphen":     "Myślnik (-)",
    "sep-underscore": "Podkreślnik (_)",
    "sep-dot":        "Kropka (.)",
    "sep-space":      "Spacja ( )",
    "sep-at":         "Małpa (@)",
    "sep-tilde":      "Tylda (~)",
    "sep-asterisk":   "Gwiazdka (*)",
    "sep-hash":       "Kratka (#)",
    "sep-none":       "Brak",
    "capitalize":     "Wielka litera",
    "cap-none":       "Brak",
    "cap-all":        "Wszystkie słowa",
    "cap-random":     "Niektóre słowa",
    "include-number": "Dodaj cyfry",
    "history":        "Poprzednie",
    "generate":       "Generuj",
    "copy":           "Kopiuj",
    "copied":         "Skopiowano!"
  }
};

let WORDS_EN = [];
let WORDS_PL = [];
let currentLang = "en";

const HISTORY_MAX = 5;
let phraseHistory = [];

async function loadWordlists() {
  const btn = document.getElementById("pg-generate");
  btn.disabled = true;
  const [enRes, plRes] = await Promise.all([
    fetch("/wordlists/en.txt"),
    fetch("/wordlists/pl.txt"),
  ]);
  const [enText, plText] = await Promise.all([enRes.text(), plRes.text()]);
  WORDS_EN = enText.trim().split("\n").map(l => l.trim()).filter(Boolean);
  WORDS_PL = plText.trim().split("\n").map(l => l.trim()).filter(Boolean);
  btn.disabled = false;
}

function applyTranslations(lang) {
  const t = TRANSLATIONS[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pushHistory(phrase) {
  if (phraseHistory[0] === phrase) return;
  phraseHistory.unshift(phrase);
  if (phraseHistory.length > HISTORY_MAX) phraseHistory.pop();
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("pg-history");
  const list = document.getElementById("pg-history-list");
  if (!phraseHistory.length) { container.style.display = "none"; return; }
  container.style.display = "";
  list.innerHTML = "";
  phraseHistory.forEach(phrase => {
    const li = document.createElement("li");
    li.textContent = phrase;
    li.addEventListener("click", () => {
      navigator.clipboard.writeText(phrase).then(() => {
        li.classList.add("pg-copied");
        setTimeout(() => li.classList.remove("pg-copied"), 900);
      });
    });
    list.appendChild(li);
  });
}

function generate() {
  const wordList = currentLang === "pl" ? WORDS_PL : WORDS_EN;
  if (!wordList.length) return;

  const count     = parseInt(document.getElementById("pg-word-count").value, 10);
  const sep       = document.getElementById("pg-separator").value;
  const capMode   = document.getElementById("pg-capitalize").value;
  const addNumber = document.getElementById("pg-number").checked;

  let tokens = Array.from({ length: count }, () => pick(wordList));

  if (capMode === "all") {
    tokens = tokens.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  } else if (capMode === "random") {
    const flags = tokens.map(() => Math.random() < 0.5);
    if (!flags.some(Boolean)) flags[Math.floor(Math.random() * flags.length)] = true;
    tokens = tokens.map((w, i) => flags[i] ? w.charAt(0).toUpperCase() + w.slice(1) : w);
  }

  if (addNumber) {
    const assigned = tokens.map(() => {
      const r = Math.random();
      return r < 0.25 ? "before" : r < 0.5 ? "after" : "none";
    });
    if (!assigned.some(s => s !== "none")) {
      const i = Math.floor(Math.random() * assigned.length);
      assigned[i] = Math.random() < 0.5 ? "before" : "after";
    }
    tokens = tokens.map((w, i) => {
      const d = String(Math.floor(Math.random() * 10));
      if (assigned[i] === "before") return d + w;
      if (assigned[i] === "after")  return w + d;
      return w;
    });
  }

  const phrase = tokens.join(sep);

  // push the outgoing phrase to history before replacing it
  const outgoing = document.getElementById("pg-result").textContent;
  if (outgoing !== "—") pushHistory(outgoing);

  document.getElementById("pg-result").textContent = phrase;
}

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("pg-lang", lang);
  applyTranslations(lang);
  generate();
}

(async () => {
  await loadWordlists();

  const saved = ["en", "pl"].includes(localStorage.getItem("pg-lang"))
    ? localStorage.getItem("pg-lang")
    : "en";
  const radio = document.querySelector(`input[name="pg-lang"][value="${saved}"]`);
  if (radio) radio.checked = true;

  document.querySelectorAll("input[name='pg-lang']").forEach(r => {
    r.addEventListener("change", function () { switchLanguage(this.value); });
  });

  document.getElementById("pg-generate").addEventListener("click", generate);

  document.getElementById("pg-copy").addEventListener("click", function () {
    const text = document.getElementById("pg-result").textContent;
    if (text === "—") return;
    const btn = document.getElementById("pg-copy");
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = TRANSLATIONS[currentLang]["copied"];
      setTimeout(() => { btn.textContent = TRANSLATIONS[currentLang]["copy"]; }, 1500);
    });
  });

  switchLanguage(saved);
})();
