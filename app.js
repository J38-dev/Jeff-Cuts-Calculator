// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://qrqgwhmsbodvminpfrus.supabase.co";

// PASTE YOUR SUPABASE PUBLISHABLE KEY BETWEEN THE QUOTES BELOW
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lIiwPuX_4IdxqciNfHea5Q_G7-ykX2X";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


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
// CUSTOMER CART STORAGE
// ===============================

// This stays in localStorage.
// It only stores the customer's current services.
// It does NOT store bookings.

let entries = JSON.parse(localStorage.getItem("cuts")) || {};


// ===============================
// TIME SLOTS
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


// ===============================
// INIT
// ===============================

if (dateEl) {
  dateEl.textContent = new Date().toDateString();
}

if (bookingDateEl) {
  bookingDateEl.min = new Date().toISOString().split("T")[0];
}


// ===============================
// CATEGORY LOAD
// ===============================

function loadCategories() {
  if (!categoryEl) return;

  categoryEl.innerHTML = "";

  Object.keys(PRICING).forEach(cat => {
    const option = document.createElement("option");

    option.value = cat;
    option.textContent = cat;

    categoryEl.appendChild(option);
  });
}


// ===============================
// SERVICE LOAD
// ===============================

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


// ===============================
// UPDATE PRICE
// ===============================

function updatePrice() {
  if (!priceEl) return;

  priceEl.value =
    PRICING?.[categoryEl?.value]?.[serviceEl?.value] ?? 0;
}


// ===============================
// EVENTS
// ===============================

categoryEl?.addEventListener("change", loadServices);

serviceEl?.addEventListener("change", updatePrice);


// ===============================
// LOAD BOOKED TIMES FROM SUPABASE
// ===============================

async function loadTimeSlots() {

  if (!bookingTimeEl) return;

  bookingTimeEl.innerHTML = "";

  const date = bookingDateEl?.value;

  if (!date) {

    bookingTimeEl.innerHTML =
      '<option disabled selected>Select date first</option>';

    return;
  }


  // Get all bookings for the selected date
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("booking_time")
    .eq("booking_date", date);


  // Database error
  if (error) {

    console.error("Could not load bookings:", error);

    bookingTimeEl.innerHTML =
      '<option disabled selected>Unable to load times</option>';

    return;
  }


  // Create list of booked times
  const bookedTimes = data.map(
    booking => booking.booking_time
  );


  let available = false;


  // Show only available times
  timeSlots.forEach(time => {

    if (!bookedTimes.includes(time)) {

      const option = document.createElement("option");

      option.value = time;
      option.textContent = time;

      bookingTimeEl.appendChild(option);

      available = true;
    }

  });


  // No times available
  if (!available) {

    bookingTimeEl.innerHTML =
      '<option disabled selected>Fully Booked</option>';

  }

}


// Reload times whenever date changes
bookingDateEl?.addEventListener(
  "change",
  loadTimeSlots
);


// ===============================
// ADD ENTRY
// ===============================

addBtn?.addEventListener("click", () => {

  const price =
    PRICING?.[categoryEl?.value]?.[serviceEl?.value] ?? 0;


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
      <span>
        ${item.category} • ${item.service} — R${item.price}
      </span>

      <button onclick="removeEntry(${index})">
        X
      </button>
    `;


    listEl.appendChild(li);

  });


  if (totalEl) {
    totalEl.textContent = "R" + total;
  }


  if (countEl) {
    countEl.textContent = entries.length;
  }


  // Keep customer cart in localStorage
  localStorage.setItem(
    "cuts",
    JSON.stringify(entries)
  );

}


// ===============================
// BOOKING
// ===============================

const barberNumber = "27671107595";


bookBtn?.addEventListener("click", async () => {

  const date = bookingDateEl?.value;

  const time = bookingTimeEl?.value;


  // ===============================
  // BASIC VALIDATION
  // ===============================

  if (!date) {

    return alert("Select a date first");

  }


  if (!time) {

    return alert("Select a time");

  }


  if (entries.length === 0) {

    return alert("Add a service");

  }


  // ===============================
  // DISABLE BUTTON
  // ===============================

  bookBtn.disabled = true;

  const originalButtonText =
    bookBtn.textContent;

  bookBtn.textContent =
    "Checking availability...";


  try {


    // ===============================
    // FINAL DATABASE CHECK
    // ===============================

    const { data: existingBooking, error: checkError } =
      await supabaseClient
        .from("bookings")
        .select("id")
        .eq("booking_date", date)
        .eq("booking_time", time)
        .limit(1);


    if (checkError) {

      console.error(
        "Booking check failed:",
        checkError
      );

      alert(
        "We couldn't check that time. Please try again."
      );

      return;

    }


    // ===============================
    // TIME ALREADY BOOKED
    // ===============================

    if (
      existingBooking &&
      existingBooking.length > 0
    ) {

      alert(
        "Sorry, that time has just been booked. Please choose another time."
      );


      // Refresh available times
      await loadTimeSlots();

      return;

    }


    // ===============================
    // CREATE BOOKING
    // ===============================

    const { error: insertError } =
      await supabaseClient
        .from("bookings")
        .insert({

          booking_date: date,

          booking_time: time

        });


    // ===============================
    // DATABASE REJECTED BOOKING
    // ===============================

    if (insertError) {

      console.error(
        "Booking insert failed:",
        insertError
      );


      // This specifically handles
      // the UNIQUE date + time protection

      if (
        insertError.code === "23505"
      ) {

        alert(
          "Sorry, that time was just booked by someone else. Please choose another time."
        );

      } else {

        alert(
          "We couldn't complete the booking. Please try again."
        );

      }


      await loadTimeSlots();

      return;

    }


    // ===============================
    // BUILD WHATSAPP MESSAGE
    // ===============================

    const services =
      entries
        .map(
          i => `${i.service} (R${i.price})`
        )
        .join(", ");


    const total =
      entries.reduce(
        (sum, i) => sum + i.price,
        0
      );


    const message =
      encodeURIComponent(`

Hi Jeff Cuts, I would like to book an appointment.

Date: ${date}
Time: ${time}
Services: ${services}
Total: R${total}

`);


    // ===============================
    // OPEN WHATSAPP
    // ===============================

    window.open(
      `https://wa.me/${barberNumber}?text=${message}`,
      "_blank"
    );


    // ===============================
    // CLEAR CUSTOMER CART
    // ===============================

    entries = [];

    render();


    // Refresh available times
    await loadTimeSlots();


    alert(
      "Your appointment has been reserved successfully!"
    );


  } finally {

    // ===============================
    // RESTORE BUTTON
    // ===============================

    bookBtn.disabled = false;

    bookBtn.textContent =
      originalButtonText;

  }

});


// ===============================
// START
// ===============================

loadCategories();

loadServices();

render();


// Initial time message
if (bookingTimeEl) {

  bookingTimeEl.innerHTML =
    '<option disabled selected>Select date first</option>';

}


// ===============================
// SUNDAY CLOSURE
// ===============================

(() => {

  const jcBookingDateField =
    document.getElementById("bookingDate");


  if (!jcBookingDateField) return;


  jcBookingDateField.addEventListener(
    "change",
    function () {

      if (!this.value) return;


      const jcSelectedDate =
        new Date(
          this.value + "T00:00:00"
        );


      const jcDay =
        jcSelectedDate.getDay();


      // Sunday = 0
      if (jcDay === 0) {

        alert(
          "Sorry, Jeff Cuts is closed on Sundays. Please choose another day."
        );


        this.value = "";


        if (bookingTimeEl) {

          bookingTimeEl.innerHTML =
            '<option disabled selected>Select date first</option>';

        }

      }

    }

  );

})();
