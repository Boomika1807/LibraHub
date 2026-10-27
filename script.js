const STORAGE_BOOKS = "librahub_books_v1";
const STORAGE_RECORDS = "librahub_records_v1";

const starterBooks = [
  {
    id: "b1",
    title: "JavaScript Basics",
    author: "John Smith",
    isbn: "LIB-001",
    category: "Programming",
    quantity: 5,
    available: 4
  },
  {
    id: "b2",
    title: "Modern Science",
    author: "David Miller",
    isbn: "LIB-002",
    category: "Science",
    quantity: 4,
    available: 4
  },
  {
    id: "b3",
    title: "The Great Stories",
    author: "Emily Rose",
    isbn: "LIB-003",
    category: "Literature",
    quantity: 3,
    available: 2
  },
  {
    id: "b4",
    title: "World History",
    author: "Robert Brown",
    isbn: "LIB-004",
    category: "History",
    quantity: 6,
    available: 6
  }
];

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value
      ? JSON.parse(value)
      : JSON.parse(JSON.stringify(fallback));
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

let books = loadData(STORAGE_BOOKS, starterBooks);
let records = loadData(STORAGE_RECORDS, []);

function saveData() {
  localStorage.setItem(STORAGE_BOOKS, JSON.stringify(books));
  localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function makeId() {
  return "id-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 7);
}

/* PAGE NAVIGATION */

function goToPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.toggle("active", section.id === page);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  document.getElementById("mainNav").classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-page]");

  if (button) {
    event.preventDefault();
    goToPage(button.dataset.page);
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});

/* DASHBOARD COUNTS */

function renderStats() {
  const total = books.reduce(
    (sum, book) => sum + Number(book.quantity), 0
  );

  const available = books.reduce(
    (sum, book) => sum + Number(book.available), 0
  );

  document.getElementById("totalCount").textContent = total;
  document.getElementById("availableCount").textContent = available;
  document.getElementById("issuedCount").textContent = total - available;
  document.getElementById("titleCount").textContent = books.length;
}

/* BOOK SEARCH AND FILTER */

function renderBooks() {
  const query = document.getElementById("searchInput")
    .value.trim().toLowerCase();

  const category = document.getElementById("categoryFilter").value;
  const status = document.getElementById("availabilityFilter").value;

  const filtered = books.filter(book => {
    const matchesSearch =
      [book.title, book.author, book.isbn]
        .join(" ").toLowerCase().includes(query);

    const matchesCategory =
      category === "All" || book.category === category;

    const matchesStatus =
      status === "All" ||
      (status === "Available" && book.available > 0) ||
      (status === "Issued" && book.available === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const grid = document.getElementById("bookGrid");

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="empty">📚<br><br>No books found. Try another search.</div>';
    return;
  }

  grid.innerHTML = filtered.map((book, index) => `
    <article class="book-card">
      <div class="book-cover">
        ${["📘", "📗", "📙", "📕", "📓"][index % 5]}
      </div>

      <h3>${safe(book.title)}</h3>
      <p class="author">by ${safe(book.author)}</p>

      <div class="book-meta">
        <span>ISBN</span>
        <strong>${safe(book.isbn)}</strong>
      </div>

      <div class="book-meta">
        <span>Category</span>
        <strong>${safe(book.category)}</strong>
      </div>

      <div class="book-meta">
        <span>Available</span>
        <strong>${book.available} / ${book.quantity}</strong>
      </div>

      <div class="book-meta">
        <span>Status</span>
        <span class="pill ${book.available === 0 ? "unavailable" : ""}">
          ${book.available === 0 ? "Fully Issued" : "Available"}
        </span>
      </div>

      <div class="book-actions">
        <button class="small-btn" data-edit="${safe(book.id)}">Edit</button>
        <button class="small-btn delete"
          data-delete="${safe(book.id)}">Delete</button>
      </div>
    </article>
  `).join("");
}

["searchInput", "categoryFilter", "availabilityFilter"].forEach(id => {
  const element = document.getElementById(id);

  element.addEventListener(
    id === "searchInput" ? "input" : "change",
    renderBooks
  );
});

/* ADD AND EDIT BOOKS */

function resetBookForm() {
  document.getElementById("bookForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formHeading").textContent = "Add a New Book";
  document.getElementById("bookQuantity").value = 1;
}

function openBookForm(book = null) {
  const form = document.getElementById("bookForm");
  form.classList.remove("hidden");

  if (book) {
    document.getElementById("editId").value = book.id;
    document.getElementById("bookTitle").value = book.title;
    document.getElementById("bookAuthor").value = book.author;
    document.getElementById("bookISBN").value = book.isbn;
    document.getElementById("bookCategory").value = book.category;
    document.getElementById("bookQuantity").value = book.quantity;

    document.getElementById("formHeading").textContent = "Edit Book Details";
  } else {
    resetBookForm();
    form.classList.remove("hidden");
  }

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("showAddForm").addEventListener("click", () => {
  openBookForm();
});

document.getElementById("cancelForm").addEventListener("click", () => {
  document.getElementById("bookForm").classList.add("hidden");
});

document.getElementById("bookForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("editId").value;
  const title = document.getElementById("bookTitle").value.trim();
  const author = document.getElementById("bookAuthor").value.trim();
  const isbn = document.getElementById("bookISBN").value.trim();
  const category = document.getElementById("bookCategory").value;
  const quantity = Number(document.getElementById("bookQuantity").value);

  if (books.some(book =>
    book.isbn.toLowerCase() === isbn.toLowerCase() && book.id !== id
  )) {
    alert("A book with this ISBN already exists.");
    return;
  }

  if (id) {
    const book = books.find(item => item.id === id);
    const issued = book.quantity - book.available;

    if (quantity < issued) {
      alert(`At least ${issued} copies are currently issued.`);
      return;
    }

    Object.assign(book, {
      title,
      author,
      isbn,
      category,
      quantity,
      available: quantity - issued
    });
  } else {
    books.push({
      id: makeId(),
      title,
      author,
      isbn,
      category,
      quantity,
      available: quantity
    });
  }

  saveData();
  document.getElementById("bookForm").classList.add("hidden");
  resetBookForm();
  renderAll();
});

/* DELETE BOOK */

document.getElementById("bookGrid").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const book = books.find(item => item.id === editButton.dataset.edit);
    if (book) openBookForm(book);
  }

  if (deleteButton) {
    const book = books.find(item => item.id === deleteButton.dataset.delete);
    if (!book) return;

    const hasActiveIssue = records.some(record =>
      record.bookId === book.id && record.status === "Issued"
    );

    if (hasActiveIssue) {
      alert("Return this book before deleting it.");
      return;
    }

    if (confirm(`Delete "${book.title}"?`)) {
      books = books.filter(item => item.id !== book.id);
      saveData();
      renderAll();
    }
  }
});

/* ISSUE AND DUE DATES */

function toDateInput(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function setDefaultDates() {
  const today = new Date();
  const due = new Date(today);

  due.setDate(due.getDate() + 14);

  document.getElementById("issueDate").value = toDateInput(today);
  document.getElementById("dueDate").value = toDateInput(due);
  document.getElementById("dueDate").min = toDateInput(today);
}

document.getElementById("issueDate").addEventListener("change", () => {
  const value = document.getElementById("issueDate").value;
  if (!value) return;

  const date = new Date(value + "T12:00:00");
  date.setDate(date.getDate() + 14);

  document.getElementById("dueDate").min = value;
  document.getElementById("dueDate").value = toDateInput(date);
});

function renderIssueOptions() {
  const issueSelect = document.getElementById("issueBookSelect");
  const previousBook = issueSelect.value;

  const availableBooks = books.filter(book => book.available > 0);

  issueSelect.innerHTML = availableBooks.length
    ? availableBooks.map(book => `
        <option value="${safe(book.id)}">
          ${safe(book.title)} (${book.available} available)
        </option>
      `).join("")
    : '<option value="">No books available</option>';

  if (availableBooks.some(book => book.id === previousBook)) {
    issueSelect.value = previousBook;
  }

  const returnSelect = document.getElementById("returnRecordSelect");
  const previousRecord = returnSelect.value;

  const activeRecords = records.filter(record => record.status === "Issued");

  returnSelect.innerHTML = activeRecords.length
    ? activeRecords.map(record => `
        <option value="${safe(record.id)}">
          ${safe(record.bookTitle)} — ${safe(record.borrower)}
          (${safe(record.studentId)})
        </option>
      `).join("")
    : '<option value="">No active issue records</option>';

  if (activeRecords.some(record => record.id === previousRecord)) {
    returnSelect.value = previousRecord;
  }

  updateReturnPreview();

  document.querySelector('#issueForm button[type="submit"]').disabled =
    availableBooks.length === 0;

  document.querySelector('#returnForm button[type="submit"]').disabled =
    activeRecords.length === 0;
}

/* CONFIRM ISSUE */

document.getElementById("issueForm").addEventListener("submit", event => {
  event.preventDefault();

  const book = books.find(item =>
    item.id === document.getElementById("issueBookSelect").value
  );

  const borrower = document.getElementById("borrowerName").value.trim();
  const studentId = document.getElementById("borrowerId").value.trim();
  const issueDate = document.getElementById("issueDate").value;
  const dueDate = document.getElementById("dueDate").value;

  if (!book || book.available < 1) {
    showMessage("No copies of this book are available.", true);
    return;
  }

  if (!borrower || !studentId || !issueDate || !dueDate) {
    showMessage("Please complete all required fields.", true);
    return;
  }

  if (dueDate < issueDate) {
    showMessage("Due date cannot be earlier than issue date.", true);
    return;
  }

  book.available--;

  records.unshift({
    id: makeId(),
    bookId: book.id,
    bookTitle: book.title,
    borrower,
    studentId,
    issueDate,
    dueDate,
    status: "Issued",
    returnDate: ""
  });

  saveData();
  event.target.reset();
  setDefaultDates();
  renderAll();

  showMessage(`Successfully issued "${book.title}" to ${borrower}.`);
});

/* RETURN BOOK */

document.getElementById("returnRecordSelect")
  .addEventListener("change", updateReturnPreview);

function updateReturnPreview() {
  const record = records.find(item =>
    item.id === document.getElementById("returnRecordSelect").value &&
    item.status === "Issued"
  );

  const preview = document.getElementById("returnPreview");

  preview.innerHTML = record
    ? `<strong>${safe(record.bookTitle)}</strong><br>
       Borrower: ${safe(record.borrower)}<br>
       Student ID: ${safe(record.studentId)}<br>
       Issued: ${safe(record.issueDate)}<br>
       Due: ${safe(record.dueDate)}`
    : "No active issue record selected.";
}

document.getElementById("returnForm").addEventListener("submit", event => {
  event.preventDefault();

  const record = records.find(item =>
    item.id === document.getElementById("returnRecordSelect").value &&
    item.status === "Issued"
  );

  if (!record) {
    showMessage("Please select an active issue record.", true);
    return;
  }

  record.status = "Returned";
  record.returnDate = toDateInput(new Date());

  const book = books.find(item => item.id === record.bookId);

  if (book) {
    book.available = Math.min(book.quantity, book.available + 1);
  }

  saveData();
  renderAll();

  showMessage(`"${record.bookTitle}" was returned successfully.`);
});

/* SUCCESS AND ERROR MESSAGE */

function showMessage(message, isError = false) {
  const element = document.getElementById("message");

  element.textContent = message;
  element.classList.toggle("error", isError);
  element.classList.remove("hidden");
}

/* ISSUE RECORDS */

function renderRecords() {
  const query = document.getElementById("recordSearch")
    .value.trim().toLowerCase();

  const status = document.getElementById("recordStatus").value;

  const filtered = records.filter(record => {
    const matchesSearch =
      [record.bookTitle, record.borrower, record.studentId]
        .join(" ").toLowerCase().includes(query);

    return matchesSearch &&
      (status === "All" || record.status === status);
  });

  const tbody = document.getElementById("recordsBody");

  tbody.innerHTML = filtered.length
    ? filtered.map(record => `
        <tr>
          <td>
            <strong>${safe(record.bookTitle)}</strong>
            ${record.returnDate
              ? `<br><span class="muted">
                   Returned: ${safe(record.returnDate)}
                 </span>`
              : ""}
          </td>
          <td>${safe(record.borrower)}</td>
          <td>${safe(record.studentId)}</td>
          <td>${safe(record.issueDate)}</td>
          <td>${safe(record.dueDate)}</td>
          <td>
            <span class="pill ${
              record.status === "Issued" ? "unavailable" : ""
            }">${safe(record.status)}</span>
          </td>
        </tr>
      `).join("")
    : '<tr><td colspan="6">No matching records found.</td></tr>';
}

document.getElementById("recordSearch").addEventListener(
  "input", renderRecords
);

document.getElementById("recordStatus").addEventListener(
  "change", renderRecords
);

/* EXPORT RECORDS AS CSV */

document.getElementById("exportRecords").addEventListener("click", () => {
  const rows = [
    ["Book", "Borrower", "Student ID", "Issue Date",
      "Due Date", "Status", "Return Date"],
    ...records.map(record => [
      record.bookTitle,
      record.borrower,
      record.studentId,
      record.issueDate,
      record.dueDate,
      record.status,
      record.returnDate
    ])
  ];

  const csv = rows.map(row =>
    row.map(value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`
    ).join(",")
  ).join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "library-issue-records.csv";
  link.click();

  URL.revokeObjectURL(url);
});

/* UPDATE ALL PAGES */

function renderAll() {
  renderStats();
  renderBooks();
  renderIssueOptions();
  renderRecords();
}

setDefaultDates();
renderAll();