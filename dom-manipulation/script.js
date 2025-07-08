let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
    { text: "This above all: to thine own self be true.", category: "Wisdom" }
  ];
  saveQuotes();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected category
function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

// Get selected category
function getSel
