document.addEventListener("DOMContentLoaded", function () {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const editModal = document.getElementById("editModal");
  const closeModal = document.getElementById("close");
  const saveEditButton = document.getElementById("saveEdit");
  let editIndex = null;

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));
      document
        .querySelectorAll(".tab-btn")
        .forEach((btn) => btn.classList.remove("active"));
      document.getElementById(this.dataset.tab).classList.add("active");
      this.classList.add("active");
      loadBookings();
    });
  });

  function categorizeBookings() {
    let now = new Date();
    return {
      active: bookings.filter(
        (booking) => new Date(booking.date) >= now && !booking.cancelled
      ),
      cancelled: bookings.filter((booking) => booking.cancelled),
    };
  }

  function loadBookings() {
    ["allBookings", "activeBookings", "cancelledBookings"].forEach((id) => {
      document.getElementById(id).querySelector("tbody").innerHTML = "";
    });

    let categorized = categorizeBookings();
    addBookingsToDOM("allBookings", [
      ...categorized.active,
      ...categorized.cancelled,
    ]);
    addBookingsToDOM("activeBookings", categorized.active, true);
    addBookingsToDOM("cancelledBookings", categorized.cancelled);
  }

  function addBookingsToDOM(tableId, bookingList, isActive = false) {
    const tbody = document.getElementById(tableId).querySelector("tbody");

    bookingList.forEach((booking, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${booking.roomName}</td>
                <td>${booking.location}</td>
                <td>${booking.capacity}</td>
                <td>${booking.date}</td>
                <td>${booking.fromTime} - ${booking.toTime}</td>
                <td>${booking.snacks ? "Yes" : "No"}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    ${
                      isActive
                        ? `<button class="cancel-btn" data-index="${index}">Cancel</button>`
                        : ""
                    }
                    <button class="snacks-btn" data-index="${index}">${
        booking.snacks ? "Remove Snacks" : "Add Snacks"
      }</button>
                </td>
            `;

      tbody.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", editBooking);
    });

    document.querySelectorAll(".cancel-btn").forEach((button) => {
      button.addEventListener("click", confirmCancel);
    });

    document.querySelectorAll(".snacks-btn").forEach((button) => {
      button.addEventListener("click", toggleSnacks);
    });
  }

  function editBooking(event) {
    document.getElementById("editModal").style.display = "block";
    editIndex = event.target.getAttribute("data-index");
    const booking = bookings[editIndex];

    document.getElementById("editRoomName").value = booking.roomName;
    document.getElementById("editLocation").value = booking.location;
    document.getElementById("editCapacity").value = booking.capacity;
    document.getElementById("editDate").value = booking.date;
    document.getElementById("editFromTime").value = booking.fromTime;
    document.getElementById("editToTime").value = booking.toTime;
    document.getElementById("editSnacks").checked = booking.snacks;

    editModal.classList.remove("hidden");
  }

  saveEditButton.addEventListener("click", function () {
    if (editIndex !== null) {
      bookings[editIndex] = {
        ...bookings[editIndex],
        roomName: document.getElementById("editRoomName").value,
        location: document.getElementById("editLocation").value,
        capacity: document.getElementById("editCapacity").value,
        date: document.getElementById("editDate").value,
        fromTime: document.getElementById("editFromTime").value,
        toTime: document.getElementById("editToTime").value,
        snacks: document.getElementById("editSnacks").checked,
      };

      localStorage.setItem("bookings", JSON.stringify(bookings));
      editModal.classList.add("hidden");
      loadBookings();
    }
  });

  function confirmCancel(event) {
    const index = event.target.getAttribute("data-index");
    if (confirm("Are you sure you want to cancel this booking?")) {
      bookings[index].cancelled = true;
      localStorage.setItem("bookings", JSON.stringify(bookings));
      loadBookings();
    }
  }

  function toggleSnacks(event) {
    const index = event.target.getAttribute("data-index");
    bookings[index].snacks = !bookings[index].snacks;
    localStorage.setItem("bookings", JSON.stringify(bookings));
    loadBookings();
  }

  closeModal.addEventListener(
    "click",
    () => (editModal.style.display = "hidden")
  );

  loadBookings();
});
