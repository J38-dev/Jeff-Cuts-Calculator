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
  }
};

// ===============================
// DOM ELEMENTS (ONLY ONCE)
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

// ===============================
// TIME SYSTEM
// ===============================
const timeSlots = [
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00"
];

let bookings = JSON.parse(localStorage.getItem("bookings")) || {};

// Prevent past dates
bookingDateEl.min = new Date().toISOString().split("T")[0];

// ===============================
// LOAD SAVED ENTRIES
// ===============================
let entries = JSON.parse(localStorage.getItem("cuts")) || [];

// ===============================
// SET TODAY DATE
// ===============================
dateEl.textContent = new Date().toDateString();

// ===============================
// POPULATE CATEGORY
// ===============================
Object.keys(PRICING).forEach(category => {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categoryEl.appendChild(option);
});

// ===============================
// LOAD SERVICES
// ===============================
function loadServices() {
  serviceEl.innerHTML = "";
  const services = PRICING[categoryEl.value];

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
  priceEl.value = PRICING[categoryEl.value][serviceEl.value];
}

// ===============================
// LOAD TIME SLOTS
// ===============================
function loadTimeSlots() {
  bookingTimeEl.innerHTML = "";

  const date = bookingDateEl.value;

  if (!date) {
    bookingTimeEl.innerHTML = '<option disabled selected>Select date first</option>';
    return;
  }

  const bookedTimes = bookings[date] || [];
  let available = 0;

  timeSlots.forEach(time => {
    if (!bookedTimes.includes(time)) {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      bookingTimeEl.appendChild(option);
      available++;
    }
  });

  if (available === 0) {
    bookingTimeEl.innerHTML = '<option disabled>Fully Booked</option>';
  }
}

// ===============================
// EVENTS
// ===============================
categoryEl.addEventListener("change", loadServices);
serviceEl.addEventListener("change", updatePrice);
bookingDateEl.addEventListener("change", loadTimeSlots);

// ===============================
// ADD ENTRY
// ===============================
addBtn.addEventListener("click", () => {
  const price = PRICING[categoryEl.value][serviceEl.value];

  entries.push({
    category: categoryEl.value,
    service: serviceEl.value,
    price
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
// RENDER
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
// BOOK APPOINTMENT (MERGED)
// ===============================
const barberNumber = "27671107595";

bookBtn.addEventListener("click", () => {
  const date = bookingDateEl.value;
  const time = bookingTimeEl.value;

  if (!date) return alert("Select a date first");
  if (!time) return alert("Select a time");
  if (entries.length === 0) return alert("Add at least one service");

  // Prevent double booking
  if (!bookings[date]) bookings[date] = [];
  if (bookings[date].includes(time)) {
    return alert("Time already taken");
  }

  // Save booking
  bookings[date].push(time);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // WhatsApp message
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

  // Reset
  entries = [];
  render();
  loadTimeSlots();
});

// ===============================
// INIT
// ===============================
loadServices();
render();
bookingTimeEl.innerHTML = '<option disabled selected>Select date first</option>';
