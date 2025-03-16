localStorage.setItem(
  "rooms",
  JSON.stringify([
    {
      name: "TR1",
      location: "TCS Kochi",
      capacity: 10,
      specifications: ["Light", "Chair", "AC", "Mike", "Projector"],
      status: "Active",
    },
    {
      name: "TR2",
      location: "TCS Mumbai",
      capacity: 8,
      specifications: ["Light", "Chair", "AC", "Mike"],
      status: "Under Maintenance",
    },
    {
      name: "ODC",
      location: "TCS TVM",
      capacity: 20,
      specifications: ["Light", "Chair", "AC"],
      status: "Active",
    },
    {
      name: "ConferenceRoom",
      location: "TCS Chennai",
      capacity: 15,
      specifications: ["Light", "Chair", "AC", "Mike", "Projector"],
      status: "Active",
    },
    {
      name: "TR3",
      location: "TCS Kochi",
      capacity: 12,
      specifications: ["Light", "Chair", "AC", "Projector"],
      status: "Under Maintenance",
    },
    {
      name: "Cubicle1",
      location: "TCS Mumbai",
      capacity: 2,
      specifications: ["Light", "Chair"],
      status: "Active",
    },
    {
      name: "Cubicle2",
      location: "TCS TVM",
      capacity: 2,
      specifications: ["Light", "Chair", "AC"],
      status: "Active",
    },
    {
      name: "ODC",
      location: "TCS Chennai",
      capacity: 25,
      specifications: ["Light", "Chair", "AC", "Projector"],
      status: "Under Maintenance",
    },
    {
      name: "ConferenceRoom",
      location: "TCS Kochi",
      capacity: 18,
      specifications: ["Light", "Chair", "AC", "Mike", "Projector"],
      status: "Active",
    },
    {
      name: "TR1",
      location: "TCS TVM",
      capacity: 10,
      specifications: ["Light", "Chair", "AC", "Mike"],
      status: "Under Maintenance",
    },
  ])
);
/*
document.addEventListener("DOMContentLoaded", function () {
  const statusFilterCheckbox = document.getElementById("status-filter");

  function loadRooms() {
    const storedRooms = localStorage.getItem("rooms");
    if (!storedRooms) return;

    let rooms = JSON.parse(storedRooms);
    const roomListDiv = document.getElementById("roomList");
    roomListDiv.innerHTML = ""; // Clear previous data

    // Check if checkbox is checked
    const showActiveOnly = statusFilterCheckbox.checked;

    // Filter rooms based on status
    if (showActiveOnly) {
      rooms = rooms.filter((room) => room.status.toLowerCase() === "active");
    }

    // Display filtered rooms
    rooms.forEach((room, index) => {
      const roomDiv = document.createElement("div");
      roomDiv.classList.add("room");
      roomDiv.classList.add(
        room.status === "Active" ? "active" : "maintenance"
      );

      roomDiv.innerHTML = `
                <h3>${room.name}</h3>
                <p><strong>Location:</strong> ${room.location}</p>
                <p><strong>Capacity:</strong> ${room.capacity}</p>
                <p><strong>Status:</strong> ${room.status}</p>
                <button class="book-btn" data-index="${index}" ${
        room.status === "Active" ? "" : "disabled"
      }>
                    ${room.status === "Active" ? "Book Now" : "Unavailable"}
                </button>
            `;

      roomListDiv.appendChild(roomDiv);
    });
  }

  // Event listener for the checkbox filter
  statusFilterCheckbox.addEventListener("change", loadRooms);

  // Load rooms initially
  loadRooms();
});

*/
document.addEventListener("DOMContentLoaded", function () {
  const roomListDiv = document.getElementById("roomList");
  const locationFilter = document.getElementById("location");
  const statusFilterCheckbox = document.getElementById("status-filter");

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
          room.status === "Active" ? "active" : "maintenance"
        );

        roomDiv.innerHTML = `
          <h3>${room.name}</h3>
          <p><strong>Location:</strong> ${room.location}</p>
          <p><strong>Capacity:</strong> ${room.capacity}</p>
          <p><strong>Specifications:</strong> ${room.specifications.join(
            ", "
          )}</p>
          <p><strong>Status:</strong> ${room.status}</p>
          <button class="edit-btn" data-index="${index}">Edit</button>
          ${
            room.status === "Active"
              ? `<button class="book-btn" data-index="${index}">Book Now</button>`
              : ""
          }
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

  loadRooms(); // Load all rooms initially

  function openBookingForm(index) {
    const rooms = JSON.parse(localStorage.getItem("rooms"));
    const room = rooms[index];

    document.getElementById("bookRoomName").value = room.name;
    document.getElementById("bookLocation").value = room.location;
    document.getElementById("bookCapacity").value = room.capacity;
    document.getElementById("bookIndex").value = index;

    document.getElementById("bookingModal").style.display = "block";
  }

  document.getElementById("saveBooking").addEventListener("click", function () {
    const index = document.getElementById("bookIndex").value;
    const roomName = document.getElementById("bookRoomName").value;
    const location = document.getElementById("bookLocation").value;
    const capacity = parseInt(document.getElementById("bookCapacity").value);
    const date = document.getElementById("bookDate").value;
    const fromTime = document.getElementById("bookFromTime").value;
    const duration = document.getElementById("bookDuration").value;
    const toTime = calculateEndTime(fromTime, duration);

    if (!date || !fromTime || !duration) {
      alert("Please fill all fields.");
      return;
    }

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    // Check if the same slot is already booked
    let existingBooking = bookings.find(
      (b) =>
        b.date === date && b.roomName === roomName && b.fromTime === fromTime
    );

    if (existingBooking) {
      alert("This time slot is already booked!");
      return;
    }

    // Add booking
    bookings.push({
      roomName,
      location,
      date,
      fromTime,
      toTime,
      capacity,
    });

    localStorage.setItem("bookings", JSON.stringify(bookings));
    document.getElementById("bookingModal").style.display = "none";
    alert("Booking Confirmed!");
  });

  function calculateEndTime(fromTime, duration) {
    const timeMap = {
      "9:00 AM": 9,
      "11:00 AM": 11,
      "1:00 PM": 13,
      "3:00 PM": 15,
    };

    let startHour = timeMap[fromTime];
    let endHour = startHour + parseInt(duration);

    return endHour > 17 ? "5:00 PM" : `${endHour}:00`;
  }

  document
    .getElementById("closeBooking")
    .addEventListener("click", function () {
      document.getElementById("bookingModal").style.display = "none";
    });

  loadRooms();
});
