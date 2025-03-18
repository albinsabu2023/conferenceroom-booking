localStorage.setItem(
  "rooms",
  JSON.stringify([
    {
      name: "TR1",
      location: "TCS Kochi",
      capacity: 1000,
      specifications: ["Light", "Chair", "AC", "Mike", "Projector"],
      status: "Active",
    },
    {
      name: "TR2",
      location: "TCS Mumbai",
      capacity: 800,
      specifications: ["Light", "Chair", "AC", "Mike"],
      status: "Under Maintenance",
    },
    {
      name: "ODC",
      location: "TCS TVM",
      capacity: 2000,
      specifications: ["Light", "Chair", "AC"],
      status: "Active",
    },
    {
      name: "ConferenceRoom",
      location: "TCS Chennai",
      capacity: 105,
      specifications: ["Light", "Chair", "AC", "Mike", "Projector"],
      status: "Active",
    },
    {
      name: "TR3",
      location: "TCS Kochi",
      capacity: 120,
      specifications: ["Light", "Chair", "AC", "Projector"],
      status: "Under Maintenance",
    },
    {
      name: "Cubicle1",
      location: "TCS Mumbai",
      capacity: 2000,
      specifications: ["Light", "Chair"],
      status: "Active",
    },
    {
      name: "Cubicle2",
      location: "TCS TVM",
      capacity: 200,
      specifications: ["Light", "Chair", "AC"],
      status: "Active",
    },
    {
      name: "ODC",
      location: "TCS Chennai",
      capacity: 205,
      specifications: ["Light", "Chair", "AC", "Projector"],
      status: "Under Maintenance",
    },
    {
      name: "ConferenceRoom",
      location: "TCS Kochi",
      capacity: 180,
      specifications: ["Light", "Chair", "AC", "Mike", "Projector"],
      status: "Active",
    },
    {
      name: "TR1",
      location: "TCS TVM",
      capacity: 100,
      specifications: ["Light", "Chair", "AC", "Mike"],
      status: "Under Maintenance",
    },
  ])
);

document.addEventListener("DOMContentLoaded", function () {
  const roomListDiv = document.getElementById("roomList");
  const locationFilter = document.getElementById("location");
  const statusFilterCheckbox = document.getElementById("status-filter");
  const bookDurationSelect = document.getElementById("bookDuration");
  const bookFromTimeSelect = document.getElementById("bookFromTime");
  const bookEndTimeInput = document.getElementById("bookEndTime");
  // const bookDateInput = document.getElementById("bookDate");
  const snacksCheckbox = document.getElementById("snacksRequired");
  const bookingIdDisplay = document.getElementById("bookingIdDisplay");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");
  const popupClose = document.getElementById("popup-close");
  const overlay = document.getElementById("overlay");

  let currentBookingId = "";

  // Function to show popup
  function showPopup(message, isError = false) {
    popupContent.textContent = message;
    popup.className = "popup " + (isError ? "popup-error" : "popup-success");
    popup.style.display = "block";
    overlay.style.display = "block";
  }

  // Close popup event
  popupClose.addEventListener("click", function () {
    popup.style.display = "none";
    overlay.style.display = "none";
  });

  // Generate random 4-digit booking ID
  function generateBookingId() {
    const min = 1000;
    const max = 9999;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return "BOOK-" + randomNum;
  }

  function loadRooms(selectedLocation = "all-loc") {
    const storedRooms = localStorage.getItem("rooms");
    if (storedRooms) {
      var rooms = JSON.parse(storedRooms);
      roomListDiv.innerHTML = ""; // Clear previous data

      // Check if checkbox is checked
      var showActiveOnly = statusFilterCheckbox.checked;
      if (showActiveOnly) {
        rooms = rooms.filter((room) => room.status.toLowerCase() === "active");
      }
      // Filter rooms based on selected location
      const filteredRooms = rooms.filter((room) => {
        if (selectedLocation === "all-loc") return true;
        return (
          room.location.toLowerCase().replace(/\s/g, "-") === selectedLocation
        );
      });

      // Display rooms
      filteredRooms.forEach((room, index) => {
        const roomDiv = document.createElement("div");
        roomDiv.classList.add("room");
        roomDiv.classList.add(
          room.status === "Active" ? "active-room" : "maintenance"
        );

        roomDiv.innerHTML = `
          <div class="room-header">
            <div class="room-header-first">
             <h3>${room.name}</h3>
            <p >[ ${room.status} ]</p></div>
            <p><img src="https://cdn-icons-png.flaticon.com/128/2838/2838912.png" heght="20" width="20"> ${
              room.location
            }</p>
          </div>
         
          
          <div class="room-card-body">
          
          <p ><strong>Specifications:</strong> ${room.specifications.join(
            ", "
          )}</p></div>
         
          <div class="room-footer">
            
            <p ><img src="https://cdn-icons-png.flaticon.com/128/6151/6151135.png"  heght="20" width="20" > ${
              room.capacity
            }</p>
            ${
              room.status === "Active"
                ? `<button class="book-btn" data-index="${index}">Book Now</button>`
                : ""
            }
          </div>
        `;

        roomListDiv.appendChild(roomDiv);
      });

      // Add event listeners for edit & book buttons
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          openEditForm(index);
        });
      });

      document.querySelectorAll(".book-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          openBookingForm(index);
        });
      });
    }
  }

  // Event listener for location filter
  locationFilter.addEventListener("change", function () {
    const selectedLocation = this.value;
    loadRooms(selectedLocation);
  });

  statusFilterCheckbox.addEventListener("change", function () {
    loadRooms(locationFilter.value); // Pass current location filter
  });

  // Update end time when duration or start time changes
  function updateEndTime() {
    const fromTime = bookFromTimeSelect.value;
    const duration = bookDurationSelect.value;
    bookEndTimeInput.value = calculateEndTime(fromTime, duration);
  }

  bookDurationSelect.addEventListener("change", updateEndTime);
  bookFromTimeSelect.addEventListener("change", updateEndTime);

  function openBookingForm(index) {
    const rooms = JSON.parse(localStorage.getItem("rooms"));
    const room = rooms[index];

    // Generate new booking ID
    currentBookingId = generateBookingId();
    bookingIdDisplay.textContent = `Booking ID: ${currentBookingId}`;

    document.getElementById("bookRoomName").value = room.name;
    document.getElementById("bookLocation").value = room.location;
    document.getElementById("bookMaxCapacity").value = room.capacity;
    document.getElementById("bookCapacity").value = ""; // Clear for user input
    document.getElementById("bookIndex").value = index;

    // Reset snacks checkbox
    snacksCheckbox.checked = false;

    // Set initial end time
    updateEndTime();

    document.getElementById("bookingModal").style.display = "block";
  }

  document.getElementById("saveBooking").addEventListener("click", function () {
    const index = document.getElementById("bookIndex").value;
    const rooms = JSON.parse(localStorage.getItem("rooms"));
    const room = rooms[index];

    const roomName = document.getElementById("bookRoomName").value;
    const location = document.getElementById("bookLocation").value;
    const maxCapacity = parseInt(
      document.getElementById("bookMaxCapacity").value
    );
    const requestedCapacity = parseInt(
      document.getElementById("bookCapacity").value
    );
    const date = document.getElementById("bookDate").value;
    const fromTime = document.getElementById("bookFromTime").value;
    const duration = document.getElementById("bookDuration").value;
    const toTime = document.getElementById("bookEndTime").value;
    const snacksRequired = snacksCheckbox.checked;

    // Validation checks
    if (!date || !fromTime || !duration || !requestedCapacity) {
      showPopup("Please fill all fields.", true);
      return;
    }

    if (requestedCapacity > maxCapacity) {
      showPopup(
        `Requested capacity exceeds room capacity of ${maxCapacity}.`,
        true
      );
      return;
    }

    if (requestedCapacity <= 0) {
      showPopup("Capacity must be greater than zero.", true);
      return;
    }

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    // Check if the same slot is already booked
    let existingBooking = bookings.find(
      (b) =>
        b.date === date &&
        b.roomName === roomName &&
        b.location === location &&
        b.fromTime === fromTime
    );

    if (existingBooking) {
      showPopup("This time slot is already booked!", true);
      return;
    }

    // Add booking with booking ID
    bookings.push({
      bookingId: currentBookingId,
      roomName,
      location,
      date,
      fromTime,
      toTime,
      capacity: requestedCapacity,
      maxCapacity,
      duration,
      snacksRequired,
      bookingDate: new Date().toISOString(),
    });

    localStorage.setItem("bookings", JSON.stringify(bookings));
    document.getElementById("bookingModal").style.display = "none";
    showPopup(
      `Booking Confirmed Successfully! Your booking ID is ${currentBookingId}`
    );
    setTimeout(() => {
      window.location.href = "preview.html";
    }, 2500);
  });

  function calculateEndTime(fromTime, duration) {
    const timeMap = {
      "9:00 AM": 9,
      "11:00 AM": 11,
      "1:00 PM": 13,
      "3:00 PM": 15,
    };

    let startHour = timeMap[fromTime];
    let durationFloat = parseFloat(duration);

    // Calculate total hours and minutes
    let totalHours = Math.floor(startHour + durationFloat);
    let totalMinutes = (durationFloat % 1) * 60;

    // Format time
    let period = totalHours >= 12 ? "PM" : "AM";
    let formattedHour = totalHours > 12 ? totalHours - 12 : totalHours;
    formattedHour = formattedHour === 0 ? 12 : formattedHour; // Handle 12 AM/PM
    let formattedMinutes = totalMinutes > 0 ? ":" + totalMinutes : ":00";

    return `${formattedHour}${formattedMinutes} ${period}`;
  }

  document
    .getElementById("closeBooking")
    .addEventListener("click", function () {
      document.getElementById("bookingModal").style.display = "none";
    });

  loadRooms();
});
