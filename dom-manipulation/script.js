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
function getSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "all";
}

// Populate filter dropdown
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });
  dropdown.value = getSelectedCategory();
}

// Filter and show quotes
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  saveSelectedCategory(selected);
  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  const container = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    container.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  container.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add new quote
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

// Export as JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
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

// Notification banner
function notifyUser(message) {
  const banner = document.getElementById("notification");
  banner.textContent = message;
  banner.style.display = "block";
  setTimeout(() => banner.style.display = "none", 5000);
}

// FETCH quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    return data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Failed to fetch from server:", err);
    return [];
  }
}

// POST quote to mock server
async function postQuoteToServer(quote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    if (res.ok) {
      console.log("Quote posted to server.");
    } else {
      console.warn("POST request failed.");
    }
  } catch (err) {
    console.error("POST error:", err);
  }
}

// Sync quotes from server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  const newQuotes = serverQuotes.filter(
    sq => !quotes.some(lq => lq.text === sq.text && lq.category === sq.category)
  );

  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUser("Quotes synced from server.");
  }
}

// Periodic Sync
setInterval(syncQuotes, 30000);

// Initialize
document.getElementById("newQuote").addEventListener("click", filterQuotes);
loadQuotes();
populateCategories();
filterQuotes();
