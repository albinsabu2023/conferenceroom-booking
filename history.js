// DOM Elements
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const allBookingsTable = document.querySelector("#allBookings tbody");
const activeBookingsTable = document.querySelector("#activeBookings tbody");
const cancelledBookingsTable = document.querySelector(
  "#cancelledBookings tbody"
);
const editModal = document.getElementById("editModal");
const closeBtn = document.getElementById("close");
const saveEditBtn = document.getElementById("saveEdit");
const searchInput = document.getElementById("searchBooking");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const editFromTime = document.getElementById("editFromTime");
const editToTime = document.getElementById("editToTime");

// Custom popup elements
const customPopup = document.getElementById("customPopup");
const popupMessage = document.getElementById("popupMessage");
const closePopup = document.getElementById("closePopup");
const popupConfirm = document.getElementById("popupConfirm");
const popupCancel = document.getElementById("popupCancel");

// Current booking being edited
let currentBookingId = null;
let filteredBookings = null;
let confirmCallback = null;
let bookings = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadBookingsFromLocalStorage();
  renderAllTables();
  setupTabSwitching();
  setupModalEvents();
  setupSearchFunctionality();
  setupTimeValidation();
  setupPopupEvents();
});

// Load bookings from localStorage
function loadBookingsFromLocalStorage() {
  const storedBookings = localStorage.getItem("bookings");

  if (storedBookings) {
    try {
      // Parse the stored bookings
      const parsedBookings = JSON.parse(storedBookings);

      // Map the bookings to ensure they have the expected structure
      bookings = parsedBookings.map((booking, index) => {
        return {
          id: booking.id || 1000 + index + 1, // Generate ID if not present
          roomName: booking.roomName || "",
          location: booking.location || "",
          capacity: parseInt(booking.capacity) || 0,
          date: booking.date || "",
          fromTime: booking.fromTime || "",
          toTime: booking.toTime || "",
          snacks: booking.snacks || false,
          status: booking.cancelled ? "cancelled" : "active", // Map cancelled to status
        };
      });
    } catch (e) {
      console.error("Error parsing bookings from localStorage:", e);
      bookings = [];
      showPopup(
        "Error loading bookings from localStorage. Using empty booking list."
      );
    }
  } else {
    console.log("No bookings found in localStorage. Using empty booking list.");
    bookings = [];
  }
}

// Save bookings to localStorage
function saveBookingsToLocalStorage() {
  // Convert bookings to the format expected by your application
  const bookingsToSave = bookings.map((booking) => {
    return {
      id: booking.id,
      roomName: booking.roomName,
      location: booking.location,
      capacity: booking.capacity.toString(),
      date: booking.date,
      fromTime: booking.fromTime,
      toTime: booking.toTime,
      snacks: booking.snacks,
      cancelled: booking.status === "cancelled",
    };
  });

  localStorage.setItem("bookings", JSON.stringify(bookingsToSave));
}

// Setup custom popup functionality
function setupPopupEvents() {
  // Close popup when clicking X
  closePopup.addEventListener("click", () => {
    customPopup.style.display = "none";
  });

  // OK button functionality
  popupConfirm.addEventListener("click", () => {
    customPopup.style.display = "none";
    if (confirmCallback && typeof confirmCallback === "function") {
      confirmCallback();
    }
  });

  // Cancel button functionality
  popupCancel.addEventListener("click", () => {
    customPopup.style.display = "none";
    confirmCallback = null;
  });

  // Close when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === customPopup) {
      customPopup.style.display = "none";
      confirmCallback = null;
    }
  });
}

// Show popup message (alert replacement)
function showPopup(message, needConfirmation = false, onConfirm = null) {
  popupMessage.textContent = message;

  // Show/hide cancel button based on if confirmation is needed
  if (needConfirmation) {
    popupCancel.style.display = "inline-block";
    confirmCallback = onConfirm;
  } else {
    popupCancel.style.display = "none";
    confirmCallback = null;
  }

  customPopup.style.display = "block";
}

// Setup time validation for duration limit
function setupTimeValidation() {
  // Add change event listeners to both time inputs
  editFromTime.addEventListener("change", validateTimeRange);
  editToTime.addEventListener("change", validateTimeRange);
}

// Validate time range to ensure it's within 3 hours
function validateTimeRange() {
  const fromTime = editFromTime.value;
  const toTime = editToTime.value;

  // Only validate if both values are set
  if (fromTime && toTime) {
    const fromMinutes = convertTimeToMinutes(fromTime);
    const toMinutes = convertTimeToMinutes(toTime);

    // Calculate duration in minutes
    const durationMinutes = toMinutes - fromMinutes;

    // Maximum duration: 3 hours = 180 minutes
    const maxDuration = 180;

    // Check if the duration exceeds the limit or is negative
    if (durationMinutes > maxDuration) {
      // Calculate the valid end time (3 hours from start)
      const validEndTime = calculateEndTime(fromTime, maxDuration);

      showPopup(
        `The booking duration cannot exceed 3 hours. The maximum end time for this booking is ${validEndTime}.`
      );

      // Set the to-time to the maximum allowed
      editToTime.value = validEndTime;
    } else if (durationMinutes <= 0) {
      showPopup("The end time must be after the start time.");
      // Reset to the previous valid value or leave empty for user to correct
      editToTime.value = "";
    }
  }
}

// Convert time string (HH:MM) to minutes for easy comparison
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString
    .split(":")
    .map((num) => parseInt(num, 10));
  return hours * 60 + minutes;
}

// Calculate the end time given a start time and duration in minutes
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(":").map((num) => parseInt(num, 10));

  let totalMinutes = hours * 60 + minutes + durationMinutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  // Format hours and minutes with leading zeros if needed
  return `${newHours.toString().padStart(2, "0")}:${newMinutes
    .toString()
    .padStart(2, "0")}`;
}

// Setup search functionality
function setupSearchFunctionality() {
  searchBtn.addEventListener("click", performSearch);
  clearSearchBtn.addEventListener("click", clearSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });
}

// Perform search based on booking ID
function performSearch() {
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    showPopup("Please enter a booking ID to search");
    return;
  }

  try {
    const bookingId = parseInt(searchTerm);
    filteredBookings = bookings.filter((booking) => booking.id === bookingId);

    if (filteredBookings.length === 0) {
      showPopup(`No booking found with ID: ${bookingId}`);
      return;
    }

    renderAllTables(filteredBookings);

    // Show the clear search button
    clearSearchBtn.style.display = "inline-block";

    // Switch to all bookings tab to show the result
    tabButtons[0].click();
  } catch (e) {
    showPopup("Please enter a valid booking ID (numbers only)");
  }
}

// Clear search results
function clearSearch() {
  searchInput.value = "";
  filteredBookings = null;
  renderAllTables();
  clearSearchBtn.style.display = "none";
}

// Render all tables
function renderAllTables(bookingsToShow = null) {
  const bookingsData = bookingsToShow || bookings;

  renderBookingsTable(allBookingsTable, bookingsData);
  renderBookingsTable(
    activeBookingsTable,
    bookingsData.filter((booking) => booking.status === "active")
  );
  renderBookingsTable(
    cancelledBookingsTable,
    bookingsData.filter((booking) => booking.status === "cancelled")
  );
}

// Render a specific table with given bookings
function renderBookingsTable(tableBody, bookingsToShow) {
  tableBody.innerHTML = "";

  if (bookingsToShow.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="8" class="empty-message">No bookings found</td>`;
    tableBody.appendChild(emptyRow);
    return;
  }

  bookingsToShow.forEach((booking) => {
    const row = document.createElement("tr");

    // Calculate duration
    const fromMinutes = convertTimeToMinutes(booking.fromTime);
    const toMinutes = convertTimeToMinutes(booking.toTime);
    const durationHours = ((toMinutes - fromMinutes) / 60).toFixed(1);

    row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.roomName}</td>
            <td>${booking.location}</td>
            <td>${booking.capacity}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${booking.fromTime} - ${booking.toTime} (${durationHours}h)</td>
            <td>${booking.snacks ? "Yes" : "No"}</td>
            <td class="actions">
                <button class="edit-btn" data-id="${booking.id}">Edit</button>
                ${
                  booking.status === "active"
                    ? `<button class="cancel-btn" data-id="${booking.id}">Cancel</button>`
                    : ""
                }
                ${
                  !booking.snacks
                    ? `<button class="add-snacks-btn" data-id="${booking.id}">Add Snacks</button>`
                    : ""
                }
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Add event listeners to all buttons
  addButtonEventListeners(tableBody);
}

// Add event listeners to buttons in a table
function addButtonEventListeners(tableBody) {
  // Edit buttons
  tableBody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bookingId = parseInt(e.target.dataset.id);
      openEditModal(bookingId);
    });
  });

  // Cancel buttons
  tableBody.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bookingId = parseInt(e.target.dataset.id);
      const booking = bookings.find((b) => b.id === bookingId);

      console.log(booking.fromTime);
      // Check if booking is more than 24 hours away
      if (isMoreThan24HoursAway(booking.date, booking.fromTime)) {
        showCancelConfirmation(bookingId);
      } else {
        showPopup(
          "Bookings can only be cancelled if they are more than 24 hours away."
        );
      }
    });
  });

  // Add Snacks buttons
  tableBody.querySelectorAll(".add-snacks-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bookingId = parseInt(e.target.dataset.id);
      addSnacksToBooking(bookingId);
    });
  });
}

// Check if booking is more than 24 hours away
// function isMoreThan24HoursAway(bookingDate, bookingTime) {
//   const now = new Date();

//   // Validate bookingDate and bookingTime
//   if (!bookingDate || !bookingTime) {
//     console.error("Invalid booking date or time:", bookingDate, bookingTime);
//     return false;
//   }

//   const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);

//   // Calculate the difference in milliseconds
//   const diffMs = bookingDateTime - now;
//   // console.log(diffMs);

//   // Check if the difference is greater than or equal to 24 hours (in milliseconds)
//   return diffMs >= 24 * 60 * 60 * 1000;
// }
function isMoreThan24HoursAway(bookingDate, bookingTime) {
  // Get current date (without time)
  const now = new Date();
  const currentDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Parse the booking date
  const bookingDateObj = new Date(bookingDate);

  // Normalize booking date to remove time component
  const normalizedBookingDate = new Date(
    bookingDateObj.getFullYear(),
    bookingDateObj.getMonth(),
    bookingDateObj.getDate()
  );

  // Log for debugging
  console.log("Current date:", currentDate);
  console.log("Booking date:", normalizedBookingDate);

  // Check if booking date is after current date
  return normalizedBookingDate > currentDate;
}

// Format date for display
function formatDate(dateString) {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Open the edit modal with booking details
function openEditModal(bookingId) {
  currentBookingId = bookingId;
  const booking = bookings.find((b) => b.id === bookingId);

  document.getElementById("editRoomName").value = booking.roomName;
  document.getElementById("editLocation").value = booking.location;
  document.getElementById("editCapacity").value = booking.capacity;
  document.getElementById("editDate").value = booking.date;
  document.getElementById("editFromTime").value = booking.fromTime;
  document.getElementById("editToTime").value = booking.toTime;
  document.getElementById("editSnacks").checked = booking.snacks;

  editModal.style.display = "block";
}

// Set up modal events (close, save)
function setupModalEvents() {
  // Close modal when clicking X or outside the modal
  closeBtn.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      editModal.style.display = "none";
    }
  });

  // Save changes button
  saveEditBtn.addEventListener("click", saveBookingChanges);
}

// Save booking changes from edit modal
function saveBookingChanges() {
  if (!currentBookingId) return;

  const fromTime = document.getElementById("editFromTime").value;
  const toTime = document.getElementById("editToTime").value;

  // Double-check duration before saving
  const fromMinutes = convertTimeToMinutes(fromTime);
  const toMinutes = convertTimeToMinutes(toTime);
  const durationMinutes = toMinutes - fromMinutes;

  if (durationMinutes <= 0) {
    showPopup("The end time must be after the start time.");
    return;
  }

  if (durationMinutes > 180) {
    showPopup("The booking duration cannot exceed 3 hours.");
    return;
  }

  const booking = bookings.find((b) => b.id === currentBookingId);
  if (booking) {
    booking.roomName = document.getElementById("editRoomName").value;
    booking.location = document.getElementById("editLocation").value;
    booking.capacity = parseInt(document.getElementById("editCapacity").value);
    booking.date = document.getElementById("editDate").value;
    booking.fromTime = fromTime;
    booking.toTime = toTime;
    booking.snacks = document.getElementById("editSnacks").checked;

    // Save changes to localStorage
    saveBookingsToLocalStorage();

    renderAllTables(filteredBookings);
    editModal.style.display = "none";
    showPopup("Booking updated successfully!");
  }
}

// Show confirmation popup for cancellation
function showCancelConfirmation(bookingId) {
  showPopup("Are you sure you want to cancel this booking?", true, function () {
    cancelBooking(bookingId);
  });
}

// Cancel a booking
function cancelBooking(bookingId) {
  const booking = bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.status = "cancelled";

    // Save changes to localStorage
    saveBookingsToLocalStorage();

    renderAllTables(filteredBookings);
    showPopup("Booking cancelled successfully!");
  }
}

// Add snacks to a booking
function addSnacksToBooking(bookingId) {
  const booking = bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.snacks = true;

    // Save changes to localStorage
    saveBookingsToLocalStorage();

    renderAllTables(filteredBookings);
    showPopup("Snacks added to booking successfully!");
  }
}

// Set up tab switching functionality
function setupTabSwitching() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });
}
