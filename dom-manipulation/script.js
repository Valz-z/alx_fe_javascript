let quotes = [];

// Load from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    ];
    saveQuotes();
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected filter to localStorage
function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

// Get selected filter from localStorage
function getSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

// Populate category dropdown from unique categories in quotes
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const dropdown = document.getElementById("categoryFilter");

  // Clear existing (except first "all")
  dropdown.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  // Set selected from storage
  dropdown.value = getSelectedCategory();
}

// Display quotes matching selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  saveSelectedCategory(selected);

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  const container = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    container.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];

  container.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add new quote and update categories
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Export quotes to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Must be an array.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Initialize
document.getElementById("newQuote").addEventListener("click", filterQuotes);
loadQuotes();
populateCategories();
filterQuotes();
