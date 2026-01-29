// ===============================
// PRICING STRUCTURE
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
// DOM ELEMENTS
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

// Prevent past dates
bookingDateEl.min = new Date().toISOString().split("T")[0];

// ===============================
// LOAD SAVED ENTRIES
// ===============================
let entries = JSON.parse(localStorage.getItem("cuts")) || [];

// ===============================
// SET TODAY'S DATE
// ===============================
dateEl.textContent = new Date().toDateString();

// ===============================
// POPULATE CATEGORY DROPDOWN
// ===============================
Object.keys(PRICING).forEach(category => {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categoryEl.appendChild(option);
});

// ===============================
// LOAD SERVICES BASED ON CATEGORY
// ===============================
function loadServices() {
  serviceEl.innerHTML = "";
  const selectedCategory = categoryEl.value;
  const services = PRICING[selectedCategory];

  Object.keys(services).forEach(service => {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    serviceEl.appendChild(option);
  });

  updatePrice();
}

// ===============================
// UPDATE PRICE
// ===============================
function updatePrice() {
  const category = categoryEl.value;
  const service = serviceEl.value;
  priceEl.value = PRICING[category][service];
}

// ===============================
// EVENTS
// ===============================
categoryEl.addEventListener("change", loadServices);
serviceEl.addEventListener("change", updatePrice);

// ===============================
// ADD ENTRY
// ===============================
addBtn.addEventListener("click", () => {
  const category = categoryEl.value;
  const service = serviceEl.value;
  const price = PRICING[category][service];

  entries.push({
    category,
    service,
    price,
    time: new Date().toLocaleTimeString()
  });

  render();
});

// ===============================
// REMOVE ENTRY
// ===============================
function removeEntry(index) {
  entries.splice(index, 1);
  render();
}

// ===============================
// RENDER LIST
// ===============================
function render() {
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

  totalEl.textContent = "R" + total;
  countEl.textContent = entries.length;

  localStorage.setItem("cuts", JSON.stringify(entries));
}

// ===============================
// INITIAL LOAD
// ===============================
loadServices();
render();

// ===============================
// BOOK APPOINTMENT (WHATSAPP)
// ===============================
const barberNumber = "27671107595"; // Barber's WhatsApp

bookBtn.addEventListener("click", () => {
  if (!bookingDateEl.value) {
    alert("Please select a booking date");
    return;
  }

  if (!bookingTimeEl.value) {
    alert("Please select a booking time");
    return;
  }

  if (entries.length === 0) {
    alert("Please add at least one service");
    return;
  }

  const bookingTime = bookingTimeEl.value;
  const services = entries.map(item => `${item.service} (R${item.price})`).join(", ");
  const total = entries.reduce((sum, item) => sum + item.price, 0);

  const message = encodeURIComponent(`
Hi Jeff Cuts, I would like to book an appointment.

Date: ${bookingDateEl.value}
Time: ${bookingTime}
Services: ${services}
Total: R${total}
  `);

  const whatsappLink = `https://wa.me/${barberNumber}?text=${message}`;
  window.open(whatsappLink, "_blank");

  entries = [];
  render();
});
