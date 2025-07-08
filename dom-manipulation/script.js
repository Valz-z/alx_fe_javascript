let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
      console.log("[✔] Quotes successfully loaded from localStorage.");
    } catch (e) {
      console.error("[✖] Error parsing quotes from localStorage:", e.message);
      quotes = [];
    }
  } else {
    // Default quotes
    quotes = [
      { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    ];
    saveQuotes();
    console.log("[ℹ] Default quotes initialized.");
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  console.log("[✔] Quotes saved to localStorage.");
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  console.log(`[✔] Quote displayed and stored in sessionStorage.`);
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    showRandomQuote();

    textInput.value = "";
    categoryInput.value = "";
    console.log(`[✔] Quote added: "${text}" - ${category}`);
  } else {
    alert("Please fill in both fields.");
    console.warn("[⚠] Quote not added - fields were empty.");
  }
}

// Create the quote input form and import/export buttons
function createAddQuoteForm() {
  const formDiv = document.createElement("div");
  formDiv.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
    <br/><br/>
    <button onclick="exportToJson()">Export Quotes to JSON</button>
    <input type="file" id="importFile" accept=".json" onchange="importFromJsonFile(event)" />
  `;
  document.body.appendChild(formDiv);
  console.log("[✔] Quote form and import/export controls rendered.");
}

// Export quotes to a JSON file
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log("[✔] Quotes exported to JSON file.");
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        showRandomQuote();
        alert("Quotes imported successfully!");
        console.log(`[✔] ${importedQuotes.length} quotes imported from JSON.`);
      } else {
        alert("Invalid file format. Must be a JSON array.");
        console.error("[✖] Import failed: Uploaded file is not a valid JSON array.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
      console.error("[✖] Error reading JSON file:", err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Initialization ---
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
loadQuotes();
createAddQuoteForm();
showRandomQuote();
