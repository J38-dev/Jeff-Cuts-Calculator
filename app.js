// ===============================
// PRICING
// ===============================
const PRICING = {
  "Adult Pricing": {
    "Normal Haircut": 85,
    "Haircut & Shave": 100,
    "Enhancer": 140,
    "Beard Enhancer": 150,
    "Head Shave Blade & Hot Towel": 100,
    "Enhancer, Haircut & Wash": 160,
    "Line-Design": 50,
    "Haircut & Wash": 95,
    "Eyebrows": 0
  },
  "Student Pricing": {
    "Haircut": 75,
    "Enhancer": 110,
    "Line Up": 20,
    "Line Up Enhancer": 25,
    "Eyebrows": 0,
    "Line-Design": 30,
    "Haircut & Wash": 85
  },
  "Kids Pricing": {
    "Normal Haircut": 60,
    "Line-Designs": 25,
    "Enhancer": 80,
    "Haircut & Wash": 70,
    "Eyebrows": 80
  },
  "Papa's At The Jeff's": {
    "Wave Butter (Pomade)": 140,
    "Razor Bump": 100,
    "Beard Oil": 140,
    "Beard Butter": 110,
    "All in One Wash": 120
  }
};

// ===============================
// SAFE DOM CHECK
// ===============================
const dateEl = document.getElementById("date");
const categoryEl = document.getElementById("category");
const serviceEl = document.getElementById("service");
const priceEl = document.getElementById("price");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const totalEl = document.getElementById("total");
const countEl = document.getElementById("count");
const bookingDateEl = document.getElementById("bookingDate");
const bookingTimeEl = document.getElementById("bookingTime");
const bookBtn = document.getElementById("bookBtn");

if (!categoryEl || !serviceEl || !addBtn) {
  console.error("Missing required DOM elements");
}

// ===============================
// STORAGE
// ===============================
let entries = JSON.parse(localStorage.getItem("cuts")) || [];
let bookings = JSON.parse(localStorage.getItem("bookings")) || {};

// ===============================
// TIME SLOTS
// ===============================
const timeSlots = ["11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

// ===============================
// INIT
// ===============================
if (dateEl) dateEl.textContent = new Date().toDateString();
if (bookingDateEl) bookingDateEl.min = new Date().toISOString().split("T")[0];

// ===============================
// CATEGORY LOAD
// ===============================
function loadCategories() {
  if (!categoryEl) return;

  Object.keys(PRICING).forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryEl.appendChild(option);
  });
}

function loadServices() {
  if (!categoryEl || !serviceEl) return;

  serviceEl.innerHTML = "";
  const services = PRICING[categoryEl.value];

  if (!services) return;

  Object.keys(services).forEach(service => {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    serviceEl.appendChild(option);
  });

  updatePrice();
}

function updatePrice() {
  if (!priceEl) return;
  priceEl.value = PRICING?.[categoryEl?.value]?.[serviceEl?.value] ?? 0;
}

// ===============================
// EVENTS
// ===============================
categoryEl?.addEventListener("change", loadServices);
serviceEl?.addEventListener("change", updatePrice);

// ===============================
// TIME SLOTS
// ===============================
function loadTimeSlots() {
  if (!bookingTimeEl) return;

  bookingTimeEl.innerHTML = "";

  const date = bookingDateEl?.value;
  if (!date) {
    bookingTimeEl.innerHTML = '<option disabled selected>Select date first</option>';
    return;
  }

  const booked = bookings[date] || [];

  let available = false;

  timeSlots.forEach(time => {
    if (!booked.includes(time)) {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      bookingTimeEl.appendChild(option);
      available = true;
    }
  });

  if (!available) {
    bookingTimeEl.innerHTML = '<option disabled>Fully Booked</option>';
  }
}

bookingDateEl?.addEventListener("change", loadTimeSlots);

// ===============================
// ADD ENTRY
// ===============================
addBtn?.addEventListener("click", () => {
  const price = PRICING?.[categoryEl?.value]?.[serviceEl?.value] ?? 0;

  entries.push({
    category: categoryEl.value,
    service: serviceEl.value,
    price
  });

  render();
});

// ===============================
// REMOVE (FIXED FOR GLOBAL ACCESS)
// ===============================
window.removeEntry = function(index) {
  entries.splice(index, 1);
  render();
};

// ===============================
// RENDER
// ===============================
function render() {
  if (!listEl) return;

  listEl.innerHTML = "";
  let total = 0;

  entries.forEach((item, index) => {
    total += item.price;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.category} • ${item.service} — R${item.price}</span>
      <button onclick="removeEntry(${index})">X</button>
    `;
    listEl.appendChild(li);
  });

  if (totalEl) totalEl.textContent = "R" + total;
  if (countEl) countEl.textContent = entries.length;

  localStorage.setItem("cuts", JSON.stringify(entries));
}

// ===============================
// BOOKING
// ===============================
const barberNumber = "27671107595";

bookBtn?.addEventListener("click", () => {
  const date = bookingDateEl?.value;
  const time = bookingTimeEl?.value;

  if (!date) return alert("Select a date first");
  if (!time) return alert("Select a time");
  if (entries.length === 0) return alert("Add a service");

  if (!bookings[date]) bookings[date] = [];

  if (bookings[date].includes(time)) {
    return alert("Time already taken");
  }

  bookings[date].push(time);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  const services = entries.map(i => `${i.service} (R${i.price})`).join(", ");
  const total = entries.reduce((sum, i) => sum + i.price, 0);

  const message = encodeURIComponent(`
Hi Jeff Cuts, I would like to book an appointment.

Date: ${date}
Time: ${time}
Services: ${services}
Total: R${total}
  `);

  window.open(`https://wa.me/${barberNumber}?text=${message}`, "_blank");

  entries = [];
  render();
  loadTimeSlots();
});

// ===============================
// START
// ===============================
loadCategories();
loadServices();
render();

if (bookingTimeEl) {
  bookingTimeEl.innerHTML = '<option disabled selected>Select date first</option>';
}
