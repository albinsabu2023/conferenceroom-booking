function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("collapsed");
}

function getCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateBookingId() {
  // If no booking ID exists, generate a random one for demo purposes
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "BK-";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function calculateCost(booking) {
  // Calculate a basic cost based on capacity and duration
  // This is just for display purposes
  const baseRate = 25; // per seat
  const snackCost = booking.snacks ? 5 * booking.capacity : 0;

  const fromTime = new Date(`2023-01-01T${booking.fromTime}`);
  const toTime = new Date(`2023-01-01T${booking.toTime}`);
  const durationHours = (toTime - fromTime) / (1000 * 60 * 60);

  const roomCost = baseRate * booking.capacity * durationHours;

  return {
    roomCost: roomCost,
    snackCost: snackCost,
    tax: (roomCost + snackCost) * 0.1,
    total: (roomCost + snackCost) * 1.1, // Adding 10% tax
  };
}

// Fetch Booking Data
document.addEventListener("DOMContentLoaded", function () {
  const bookingData = localStorage.getItem("bookings");

  if (bookingData) {
    const bookings = JSON.parse(bookingData);
    const booking = bookings[bookings?.length - 1];

    // Generate booking ID if not present
    if (!booking.id) {
      booking.id = generateBookingId();
    }

    // Calculate costs
    const costs = calculateCost(booking);

    // Format the snacks value properly
    const snacksValue =
      typeof booking.snacks === "boolean"
        ? booking.snacks
          ? "Yes"
          : "No"
        : booking.snacks === "true" || booking.snacks === true
        ? "Yes"
        : "No";

    document.getElementById("receipt").innerHTML = `
                    <div class="receipt-header">
                        <img src="../assets/tata.png" class="receipt-logo" alt="Logo">
                        <h2 class="receipt-title">Booking Confirmation</h2>
                        <p class="receipt-subtitle">Thank you for your reservation</p>
                    </div>
                    
                    <div class="receipt-body">
                        <div class="receipt-metadata">
                            <div>
                                <p><strong>Booking ID:</strong> ${booking.id}</p>
                                <p><strong>Date Issued:</strong> ${booking.date}</p>
                            </div>
                            <div>
                                <p class="booking-status">Confirmed</p>
                            </div>
                        </div>
                        
                        <div class="receipt-section">
                            <h3>Reservation Details</h3>
                            
                            <div class="receipt-detail">
                                <div class="receipt-label"><i class="fas fa-map-marker-alt"></i> Location:</div>
                                <div class="receipt-value">${booking.location}</div>
                            </div>
                            
                            <div class="receipt-detail">
                                <div class="receipt-label"><i class="fas fa-door-open"></i> Room:</div>
                                <div class="receipt-value">${booking.roomName}</div>
                            </div>
                            
                            <div class="receipt-detail">
                                <div class="receipt-label"><i class="fas fa-calendar-day"></i> Date:</div>
                                <div class="receipt-value">${booking.date}</div>
                            </div>
                            
                            <div class="receipt-detail">
                                <div class="receipt-label"><i class="fas fa-clock"></i> Time:</div>
                                <div class="receipt-value">${booking.fromTime} - ${booking.toTime}</div>
                            </div>
                            
                            <div class="receipt-detail">
                                <div class="receipt-label"><i class="fas fa-users"></i> Capacity:</div>
                                <div class="receipt-value">${booking.capacity} seats</div>
                            </div>
                            
                            <div class="receipt-detail">
                                <div class="receipt-label"><i class="fas fa-utensils"></i> Snacks:</div>
                                <div class="receipt-value">${snacksValue}</div>
                            </div>
                        </div>
                        
                        
                        
                        
                    </div>
                    
                    <div class="receipt-footer">
                        <div class="action-buttons no-print">
                            <button class="btn-print" onclick="window.print()">
                                <i class="fas fa-print"></i> Print Receipt
                            </button>
                            <button class="btn-download" onclick="downloadPDF()">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                        </div>
                        
                        <div class="terms-conditions">
                            <p>Terms & Conditions: This booking is subject to our standard booking policies. Cancellations made less than 24 hours before the scheduled time may incur a fee.</p>
                        </div>
                    </div>
                `;
  } else {
    document.getElementById("receipt").innerHTML = `
                    <div class="receipt-header">
                        <h2 class="receipt-title">No Booking Found</h2>
                    </div>
                    <div class="receipt-body">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> No booking data is available. Please create a booking first.
                        </div>
                        <div class="text-center mt-4">
                            <a href="index.html" class="btn btn-primary">
                                <i class="fas fa-calendar-plus"></i> Create New Booking
                            </a>
                        </div>
                    </div>
                `;
  }
});

function downloadPDF() {
  // This is a placeholder function since we can't actually generate PDFs in this environment
  alert(
    "Download PDF functionality would be implemented here with a library like jsPDF or by using a server-side solution."
  );
}
