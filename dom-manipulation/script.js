let quotes = [];

// Load from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  ];
  saveQuotes();
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected filter
function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

// Get selected filter
function getSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

// Populate categories
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const dropdown = document.getElementById("categoryFilter");

  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  dropdown.value = getSelectedCategory();
}

// Filter quotes
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

// Add quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  postQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Export to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON
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
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Notify user
function notifyUser(message) {
  const banner = document.getElementById("notification");
  banner.textContent = message;
  banner.style.display = "block";
  setTimeout(() => (banner.style.display = "none"), 5000);
}

// Simulated server endpoints
const SERVER_FETCH_URL = "https://jsonplaceholder.typicode.com/posts";
const SERVER_POST_URL = "https://jsonplaceholder.typicode.com/posts";

// Post to server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    if (response.ok) {
      console.log("[✔] Quote posted to server.");
    } else {
      console.warn("[✖] Failed to post quote to server.");
    }
  } catch (error) {
    console.error("[✖] Error posting to server:", error);
  }
}

// Sync all quotes with server and resolve conflicts
async function syncQuotes() {
  try {
    const res = await fetch(SERVER_FETCH_URL);
    const serverQuotesRaw = await res.json();

    // Simulate extracting server quotes (limit to 5 for demo)
    const serverQuotes = serverQuotesRaw.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    let newQuotes = serverQuotes.filter(
      sq => !quotes.some(lq => lq.text === sq.text && lq.category === sq.category)
    );

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser("Data has been updated from the server.");
    }
  } catch (err) {
    console.error("Error syncing with server:", err);
  }
}

// --- Initialization ---
document.getElementById("newQuote").addEventListener("click", filterQuotes);
loadQuotes();
populateCategories();
filterQuotes();

// Periodic sync using syncQuotes function
setInterval(syncQuotes, 30000); // every 30 seconds
