const API_URL = "http://localhost:3000";
let currentBookingForReschedule = null;
let currentBookingForReview = null;
let allBookings = [];
let currentPage = 1;
let currentFilter = "all";
const rowsPerPage = 8;

class ProfileManager {
  constructor() {
    this.apiUrl = `${API_URL}/users`;
    this.currentUserId = localStorage.getItem("userId");
    this.currentUser = null;

    this.initializeElements();
    this.setupEventListeners();
    if (this.currentUserId) {
      this.loadCurrentUser();
    } else {
      this.showError("Please log in to view your profile.");
      setTimeout(() => {
        window.location.href = "../login.html";
      }, 2000);
    }
  }

  initializeElements() {
    this.profileBtn = document.getElementById("profileBtn");
    this.modal = document.getElementById("profileModal");
    this.closeModalBtn = document.getElementById("closeModalBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.saveBtn = document.getElementById("saveBtn");
    this.profileForm = document.getElementById("profileForm");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.errorMessage = document.getElementById("errorMessage");
    this.successMessage = document.getElementById("successMessage");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.passwordInput = document.getElementById("password");
    this.eyeIcon = document.getElementById("eyeIcon");
    this.inputs = {
      firstName: document.getElementById("firstName"),
      lastName: document.getElementById("lastName"),
      email: document.getElementById("email"),
      phone: document.getElementById("phone"),
      password: document.getElementById("password"),
    };
  }

  setupEventListeners() {
    // Prevent multiple event listener attachments
    this.profileBtn.removeEventListener("click", this.openModal);
    this.profileBtn.addEventListener("click", () => this.openModal());
    this.closeModalBtn.removeEventListener("click", this.closeModal);
    this.closeModalBtn.addEventListener("click", () => this.closeModal());
    this.cancelBtn.removeEventListener("click", this.closeModal);
    this.cancelBtn.addEventListener("click", () => this.closeModal());
    this.modal.removeEventListener("click", this.handleModalClick);
    this.modal.addEventListener("click", (e) => this.handleModalClick(e));
    this.saveBtn.removeEventListener("click", this.saveChanges);
    this.saveBtn.addEventListener("click", () => this.saveChanges());
    this.togglePasswordBtn.removeEventListener("click", this.togglePassword);
    this.togglePasswordBtn.addEventListener("click", () =>
      this.togglePassword()
    );
    Object.values(this.inputs).forEach((input) => {
      input.removeEventListener("input", this.validateForm);
      input.addEventListener("input", () => this.validateForm());
    });
    document.removeEventListener("keydown", this.handleEscapeKey);
    document.addEventListener("keydown", (e) => this.handleEscapeKey(e));
  }

  handleModalClick(e) {
    if (e.target === this.modal) this.closeModal();
  }

  handleEscapeKey(e) {
    if (e.key === "Escape" && !this.modal.classList.contains("hidden")) {
      this.closeModal();
    }
  }

  async loadCurrentUser() {
    try {
      const response = await fetch(`${this.apiUrl}/${this.currentUserId}`, {
        timeout: 5000,
      });
      if (!response.ok) {
        throw new Error("User not found");
      }
      this.currentUser = await response.json();
      this.populateForm();
    } catch (error) {
      console.error("Error loading user:", error);
      this.showError("Failed to load user data. Please try again.");
    }
  }

  openModal() {
    if (!this.currentUserId) {
      this.showError("Please log in to view your profile.");
      setTimeout(() => {
        window.location.href = "../login.html";
      }, 2000);
      return;
    }
    this.modal.classList.remove("hidden");
    this.modal.classList.add("show");
    document.body.style.overflow = "hidden";
    this.populateForm();
    this.hideMessages();
    setTimeout(() => {
      this.inputs.firstName.focus();
    }, 300);
  }

  closeModal() {
    this.modal.classList.remove("show");
    this.modal.classList.add("hidden");
    document.body.style.overflow = "auto";
    this.resetForm();
    this.hideMessages();
  }

  populateForm() {
    if (this.currentUser) {
      this.inputs.firstName.value = this.currentUser.firstName || "";
      this.inputs.lastName.value = this.currentUser.lastName || "";
      this.inputs.email.value = this.currentUser.email || "";
      this.inputs.phone.value = this.currentUser.phone || "";
      this.inputs.password.value = this.currentUser.password || "";
      this.validateForm();
    }
  }

  resetForm() {
    this.profileForm.reset();
    this.validateForm();
  }

  validateForm() {
    const isValid = Object.values(this.inputs).every((input) => {
      return input.value.trim() !== "" && input.checkValidity();
    });
    this.saveBtn.disabled = !isValid;
    return isValid;
  }

  async saveChanges() {
    if (!this.validateForm()) {
      this.showError("Please fill in all required fields correctly.");
      return;
    }

    this.showLoading(true);
    this.hideMessages();

    try {
      const updatedUser = {
        firstName: this.inputs.firstName.value.trim(),
        lastName: this.inputs.lastName.value.trim(),
        email: this.inputs.email.value.trim(),
        phone: this.inputs.phone.value.trim(),
        password: this.inputs.password.value,
      };

      if (!this.isValidEmail(updatedUser.email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (!this.isValidPhone(updatedUser.phone)) {
        throw new Error("Please enter a valid phone number.");
      }

      const response = await fetch(`${this.apiUrl}/${this.currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        this.currentUser = await response.json();
        this.showSuccess();
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      } else {
        throw new Error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  togglePassword() {
    const isPassword = this.passwordInput.type === "password";
    this.passwordInput.type = isPassword ? "text" : "password";
    this.eyeIcon.innerHTML = isPassword
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  }

  showLoading(show) {
    this.loadingSpinner.classList.toggle("hidden", !show);
    this.saveBtn.disabled = show || !this.validateForm();
  }

  showError(message) {
    this.errorMessage.querySelector("p").textContent = message;
    this.errorMessage.classList.remove("hidden");
    this.successMessage.classList.add("hidden");
  }

  showSuccess() {
    this.successMessage.classList.remove("hidden");
    this.errorMessage.classList.add("hidden");
  }

  hideMessages() {
    this.errorMessage.classList.add("hidden");
    this.successMessage.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Please log in to view your bookings.");
    window.location.href = "../login.html";
    return;
  }

  new ProfileManager();

  try {
    const response = await fetch(`${API_URL}/bookings?userId=${userId}`);
    allBookings = await response.json();
    allBookings.sort((a, b) => b.id - a.id);
    renderTable(1);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    document.getElementById("bookings-table").innerHTML =
      '<tr><td colspan="8" class="p-4 text-center text-red-500">Error loading bookings. Please try again.</td></tr>';
  }

  document.getElementById("filter-bookings").addEventListener("change", (e) => {
    currentFilter = e.target.value;
    renderTable(1);
  });

  setupActions();
  setupModal();
  setupRescheduleModal();
  setupReviewModal();
  setupReportModal();

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    });
  }

  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function (e) {
      if (
        this.textContent.includes("Cancel") ||
        this.textContent.includes("Check Availability") ||
        this.textContent.includes("Confirm Reschedule") ||
        this.textContent.includes("Submit Review")
      ) {
        const ripple = document.createElement("span");
        ripple.className =
          "absolute inset-0 rounded-full bg-white/30 scale-0 animate-ping";
        this.style.position = "relative";
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
    });
  });
});

function renderTable(page) {
  currentPage = page;
  const filteredBookings =
    currentFilter === "all"
      ? allBookings
      : allBookings.filter((booking) => booking.status === currentFilter);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageBookings = filteredBookings.slice(start, end);
  populateBookingsTable(pageBookings);
  renderPagination(filteredBookings.length);
}

function populateBookingsTable(bookings) {
  const tbody = document.getElementById("bookings-table");
  if (!Array.isArray(bookings) || bookings.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="p-4 text-center text-gray-500">No bookings found.</td></tr>';
    return;
  }

  const categoryMap = {
    compact: "Compact Room",
    classic: "Classic Hall",
    grand: "Grand Hall",
  };

  tbody.innerHTML = bookings
    .map((booking) => {
      const categoryName =
        categoryMap[booking.venueCategory] || booking.venueCategory;
      const formattedDate = booking.date
        ? new Date(booking.date).toLocaleDateString("en-GB")
        : "-";
      const formattedBookedDate = booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB");
      const statusClass =
        booking.status === "booked"
          ? "bg-blue-100 text-blue-600"
          : booking.status === "completed"
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-600";
      const statusText = booking.status
        ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
        : "Unknown";
      const updatedBadge = booking.updated
        ? '<span class="updated-badge ml-2">Rescheduled</span>'
        : "";

      return `
            <tr class="border-t hover:bg-gray-50 transition-colors table-row" 
                data-status="${booking.status}" data-booking-id="${booking.id}">
                <td class="p-3 sm:p-4 text-gray-900 text-sm sm:text-base">${categoryName}${updatedBadge}</td>
                <td class="p-3 sm:p-4 text-gray-900 text-sm sm:text-base">${
                  booking.roomId || "-"
                }</td>
                <td class="p-3 sm:p-4 text-gray-900 text-sm sm:text-base">${formattedDate}</td>
                <td class="p-3 sm:p-4 text-gray-900 text-sm sm:text-base">${
                  booking.checkInTime || "-"
                }</td>
                <td class="p-3 sm:p-4 text-gray-900 text-sm sm:text-base">${
                  booking.checkOutTime || "-"
                }</td>
                <td class="p-3 sm:p-4 text-sm sm:text-base"><span class="inline-flex items-center px-2.5 py-1 rounded-full font-semibold ${statusClass}">${statusText}</span></td>
                <td class="p-3 sm:p-4 text-gray-900 text-sm sm:text-base">${formattedBookedDate}</td>
                <td class="p-3 sm:p-4 relative">
                    <button class="actions-btn text-black-900 hover:text-black-700 text-base" 
                            data-booking-id="${
                              booking.id
                            }" aria-haspopup="true" aria-expanded="false">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                        </svg>
                    </button>
                    <div class="actions-dropdown" id="dropdown-${
                      booking.id
                    }" aria-hidden="true"></div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function renderPagination(totalBookings) {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(totalBookings / rowsPerPage);
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `
            <button onclick="renderTable(${i})"
                class="px-3 py-1 rounded ${
                  i === currentPage
                    ? "bg-primary-blue text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-primary-blue hover:text-white transition">
                ${i}
            </button>
        `;
  }
  pagination.innerHTML = html;
}

function setupActions() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".actions-btn");

    if (btn) {
      e.preventDefault();
      e.stopPropagation();

      const bookingId = btn.dataset.bookingId;
      if (!bookingId) return;

      const dropdown = document.getElementById(`dropdown-${bookingId}`);
      if (!dropdown) return;

      const isOpen = dropdown.classList.contains("show");

      // Close all other dropdowns
      document.querySelectorAll(".actions-dropdown").forEach((dd) => {
        dd.classList.remove("show");
        dd.setAttribute("aria-hidden", "true");
      });

      if (isOpen) return;

      dropdown.innerHTML = "";

      try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`);
        const booking = await response.json();

        // View Details
        const viewDetails = document.createElement("a");
        viewDetails.href = "#";
        viewDetails.className = "view-details";
        viewDetails.textContent = "View Details";
        viewDetails.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          showBookingModal(booking);
          dropdown.classList.remove("show");
          dropdown.setAttribute("aria-hidden", "true");
        });
        dropdown.appendChild(viewDetails);

        // If booking is active
        if (booking.status === "booked") {
          // Reschedule
          const reschedule = document.createElement("button");
          reschedule.className = "reschedule";
          reschedule.textContent = "Reschedule";
          reschedule.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            openRescheduleModal(booking);
            dropdown.classList.remove("show");
            dropdown.setAttribute("aria-hidden", "true");
          });
          dropdown.appendChild(reschedule);

          // Cancel Booking
          const cancel = document.createElement("button");
          cancel.className = "cancel-booking danger";
          cancel.textContent = "Cancel Booking";
          cancel.addEventListener("click", async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            if (!confirm("Are you sure you want to cancel this booking?")) return;

            try {
              const updateResponse = await fetch(
                `${API_URL}/bookings/${bookingId}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "cancelled" }),
                }
              );

              if (updateResponse.ok) {
                alert("Booking cancelled successfully!");
                location.reload();
              } else {
                alert("Error cancelling booking. Please try again.");
              }
            } catch (error) {
              console.error("Error cancelling booking:", error);
              alert("An error occurred. Please try again.");
            }

            dropdown.classList.remove("show");
            dropdown.setAttribute("aria-hidden", "true");
          });
          dropdown.appendChild(cancel);
        } 
        // If booking is completed
        else if (booking.status === "completed") {
          const addReview = document.createElement("button");
          addReview.className = "add-review";
          addReview.textContent = "Add Review";
          addReview.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            openReviewModal(booking);
            dropdown.classList.remove("show");
            dropdown.setAttribute("aria-hidden", "true");
          });
          dropdown.appendChild(addReview);
        }

        // Report button (always available)
        const report = document.createElement("button");
        report.className = "report";
        report.textContent = "Report";
        report.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          openReportModal(booking);
          dropdown.classList.remove("show");
          dropdown.setAttribute("aria-hidden", "true");
        });
        dropdown.appendChild(report);

        // Show dropdown
        dropdown.classList.add("show");
        dropdown.setAttribute("aria-hidden", "false");
      } catch (error) {
        console.error("Error fetching booking:", error);
        alert("Error loading booking details.");
      }

      return;
    }

    // Close dropdown if clicking outside
    if (!e.target.closest(".actions-dropdown")) {
      document.querySelectorAll(".actions-dropdown").forEach((dd) => {
        dd.classList.remove("show");
        dd.setAttribute("aria-hidden", "true");
      });
    }
  });
}


function setupModal() {
  const modal = document.getElementById("booking-modal");
  const closeBtn = modal.querySelector(".modal-close");
  function hideModal() {
    modal.classList.remove("show");
    modal.classList.add("hidden");
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hideModal();
    });
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) hideModal();
  });
}

function setupRescheduleModal() {
  const form = document.getElementById("reschedule-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await confirmReschedule();
  });
}

function setupReviewModal() {
  const form = document.getElementById("review-form");
  const stars = document.querySelectorAll(".star");
  const ratingContainer = document.querySelector(".star-rating");
  let selectedRating = 0;
  let hoverRating = 0;

  function updateStarsDisplay() {
    const effectiveRating = hoverRating || selectedRating;
    stars.forEach((s) => {
      s.classList.toggle(
        "selected",
        parseInt(s.dataset.value) <= effectiveRating
      );
    });
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);
      updateStarsDisplay();
    });

    star.addEventListener("mouseover", () => {
      hoverRating = parseInt(star.dataset.value);
      updateStarsDisplay();
    });
  });

  ratingContainer.addEventListener("mouseout", () => {
    hoverRating = 0;
    updateStarsDisplay();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitReview(selectedRating);
  });
}

// Add this to the end of the script tag or in mybbooking.js

let currentBookingForReport = null;

function setupReportModal() {
  const form = document.getElementById("report-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitReport();
  });
}

function openReportModal(booking) {
  currentBookingForReport = booking;
  document.getElementById("report-description").value = "";
  document.getElementById("report-error").classList.add("hidden");
  document.getElementById("report-success").classList.add("hidden");
  const modal = document.getElementById("report-modal");
  modal.classList.remove("hidden");
  requestAnimationFrame(() => modal.classList.add("show"));
}

function closeReportModal() {
  const modal = document.getElementById("report-modal");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 200);
  currentBookingForReport = null;
}

async function submitReport() {
  if (!currentBookingForReport) return;
  const description = document
    .getElementById("report-description")
    .value.trim();
  if (!description) {
    document.getElementById("report-error").querySelector("p").textContent =
      "Please enter a description.";
    document.getElementById("report-error").classList.remove("hidden");
    return;
  }
  try {
    const reportData = {
      ...currentBookingForReport,
      reportDescription: description,
      reportDate: new Date().toISOString(),
    };
    const response = await fetch(`${API_URL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    if (response.ok) {
      document.getElementById("report-success").classList.remove("hidden");
      document.getElementById("report-error").classList.add("hidden");
      setTimeout(() => {
        closeReportModal();
      }, 2000);
    } else {
      throw new Error("Failed to submit report. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting report:", error);
    document.getElementById("report-error").querySelector("p").textContent =
      error.message;
    document.getElementById("report-error").classList.remove("hidden");
  }
}

async function openReviewModal(booking) {
  currentBookingForReview = booking;
  let existingReview = null;
  try {
    const response = await fetch(`${API_URL}/reviews?bookingId=${booking.id}`);
    const reviews = await response.json();
    if (reviews.length > 0) {
      existingReview = reviews[0];
    }
  } catch (error) {
    console.error("Error fetching review:", error);
  }

  const modal = document.getElementById("review-modal");
  const title = modal.querySelector("h3");
  const submitBtn = document.getElementById("submit-review-btn");
  const successMsg = document
    .getElementById("review-success")
    .querySelector("p");
  const stars = document.querySelectorAll(".star");
  let selectedRating = 0;

  document.getElementById("review-comment").value = "";
  stars.forEach((star) => star.classList.remove("selected"));
  document.getElementById("review-error").classList.add("hidden");
  document.getElementById("review-success").classList.add("hidden");

  if (existingReview) {
    title.textContent = "Edit Review";
    submitBtn.textContent = "Update Review";
    successMsg.textContent = "Review updated successfully!";
    selectedRating = existingReview.rating;
    document.getElementById("review-comment").value = existingReview.comment;
    stars.forEach((s) =>
      s.classList.toggle(
        "selected",
        parseInt(s.dataset.value) <= selectedRating
      )
    );
    currentBookingForReview.existingReview = existingReview;
  } else {
    title.textContent = "Add Review";
    submitBtn.textContent = "Submit Review";
    successMsg.textContent = "Review submitted successfully!";
    currentBookingForReview.existingReview = null;
  }

  modal.classList.remove("hidden");
  requestAnimationFrame(() => modal.classList.add("show"));
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 200);
  currentBookingForReview = null;
}

async function submitReview(rating) {
  if (!currentBookingForReview) return;
  if (rating < 1 || rating > 5) {
    document.getElementById("review-error").querySelector("p").textContent =
      "Please select a rating.";
    document.getElementById("review-error").classList.remove("hidden");
    return;
  }
  const comment = document.getElementById("review-comment").value.trim();
  if (!comment) {
    document.getElementById("review-error").querySelector("p").textContent =
      "Please enter a comment.";
    document.getElementById("review-error").classList.remove("hidden");
    return;
  }
  try {
    let response;
    const reviewData = {
      bookingId: currentBookingForReview.id,
      userId: localStorage.getItem("userId"),
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    if (currentBookingForReview.existingReview) {
      response = await fetch(
        `${API_URL}/reviews/${currentBookingForReview.existingReview.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        }
      );
    } else {
      response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
    }
    if (response.ok) {
      document.getElementById("review-success").classList.remove("hidden");
      document.getElementById("review-error").classList.add("hidden");
      setTimeout(() => {
        closeReviewModal();
      }, 2000);
    } else {
      throw new Error("Failed to submit review. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    document.getElementById("review-error").querySelector("p").textContent =
      error.message;
    document.getElementById("review-error").classList.remove("hidden");
  }
}

function openRescheduleModal(booking) {
  currentBookingForReschedule = booking;
  document.getElementById("new-date").value = booking.date;
  document.getElementById("new-checkin").value = booking.checkInTime;
  document.getElementById("new-checkout").value = booking.checkOutTime;
  const availabilityDiv = document.getElementById("availability-check");
  availabilityDiv.classList.add("hidden");
  document.getElementById("confirm-reschedule").classList.add("hidden");
  const modal = document.getElementById("reschedule-modal");
  modal.classList.remove("hidden");
  requestAnimationFrame(() => modal.classList.add("show"));
}

function closeRescheduleModal() {
  const modal = document.getElementById("reschedule-modal");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 200);
  currentBookingForReschedule = null;
}

async function checkAvailability() {
  if (!currentBookingForReschedule) return;
  const newDate = document.getElementById("new-date").value;
  const newCheckin = document.getElementById("new-checkin").value;
  const newCheckout = document.getElementById("new-checkout").value;
  const availabilityDiv = document.getElementById("availability-check");
  if (!newDate || !newCheckin || !newCheckout) {
    alert("Please fill in all fields");
    return;
  }
  if (newCheckin >= newCheckout) {
    alert("Check-out time must be after check-in time");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/bookings`);
    const allBookings = await response.json();
    const hasConflict = allBookings.some((booking) => {
      if (booking.id === currentBookingForReschedule.id) return false;
      if (booking.status === "cancelled") return false;
      return (
        booking.date === newDate &&
        booking.venueCategory === currentBookingForReschedule.venueCategory &&
        booking.roomId === currentBookingForReschedule.roomId &&
        timeOverlaps(
          booking.checkInTime,
          booking.checkOutTime,
          newCheckin,
          newCheckout
        )
      );
    });
    availabilityDiv.classList.remove("hidden");
    if (hasConflict) {
      availabilityDiv.innerHTML =
        "<strong>Unavailable:</strong> This time slot is already booked for the selected room.";
      availabilityDiv.className = "availability-status unavailable";
      document.getElementById("confirm-reschedule").classList.add("hidden");
    } else {
      availabilityDiv.innerHTML =
        "<strong>Available:</strong> This time slot is free for booking.";
      availabilityDiv.className = "availability-status available";
      document.getElementById("confirm-reschedule").classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    alert("Error checking availability. Please try again.");
  }
}

function timeOverlaps(start1, end1, start2, end2) {
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  return start1Min < end2Min && start2Min < end1Min;
}

async function confirmReschedule() {
  if (!currentBookingForReschedule) return;
  const newDate = document.getElementById("new-date").value;
  const newCheckin = document.getElementById("new-checkin").value;
  const newCheckout = document.getElementById("new-checkout").value;
  try {
    const updateResponse = await fetch(
      `${API_URL}/bookings/${currentBookingForReschedule.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          checkInTime: newCheckin,
          checkOutTime: newCheckout,
          updated: true,
        }),
      }
    );
    if (updateResponse.ok) {
      alert("Booking rescheduled successfully!");
      closeRescheduleModal();
      location.reload();
    } else {
      alert("Error rescheduling booking. Please try again.");
    }
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    alert("An error occurred. Please try again.");
  }
}

async function showBookingModal(booking) {
  const modal = document.getElementById("booking-modal");
  const modalBody = document.getElementById("modal-body");
  if (!modal || !modalBody) return;
  const categoryMap = {
    compact: "Compact Room",
    classic: "Classic Hall",
    grand: "Grand Hall",
  };
  const categoryName =
    categoryMap[booking.venueCategory] || booking.venueCategory;
  const beveragesList =
    booking.beverages && typeof booking.beverages === "object"
      ? Object.entries(booking.beverages)
          .map(([item, qty]) => `${item} x${qty}`)
          .join(", ")
      : Array.isArray(booking.beverages)
      ? booking.beverages.join(", ")
      : "None";
  modalBody.innerHTML = `
        <!-- Header Section -->
        <div class="bg-primary-blue -mx-6 -mt-6 px-6 py-6 mb-6 rounded-t-xl">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="bg-white/20 rounded-full p-2">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">${categoryName}</h3>
                        <p class="text-blue-100 text-sm">Booking Details</p>
                    </div>
                </div>
                <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === "booked"
                    ? "bg-blue-100 text-blue-800"
                    : booking.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }">
                    <div class="w-2 h-2 rounded-full mr-2 ${
                      booking.status === "booked"
                        ? "bg-blue-500"
                        : booking.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }"></div>
                    ${
                      booking.status
                        ? booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)
                        : "Unknown"
                    }
                </div>
            </div>
        </div>

        <!-- Venue & Schedule Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Venue Details -->
            <div class="bg-white/95 backdrop-blur-lg rounded-xl p-5 shadow-sm">
                <div class="flex items-center mb-4">
                    <div class="bg-primary-blue rounded-lg p-2 mr-3">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800">Venue Details</h4>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 font-medium">Room</span>
                        <span class="text-gray-900 font-semibold bg-white px-3 py-1 rounded-lg shadow-sm">${
                          booking.roomId || "-"
                        }</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-gray-600 font-medium">Purpose</span>
                        <span class="text-gray-900 font-semibold">${
                          booking.purpose || "-"
                        }</span>
                    </div>
                </div>
            </div>

            <!-- Schedule Details -->
            <div class="bg-white/95 backdrop-blur-lg rounded-xl p-5 shadow-sm">
                <div class="flex items-center mb-4">
                    <div class="bg-purple-500 rounded-lg p-2 mr-3">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800">Schedule</h4>
                </div>
                <div class="space-y-4">
                    <div class="bg-white rounded-lg p-3 shadow-sm">
                        <div class="text-sm text-gray-600 mb-1">Event Date</div>
                        <div class="text-lg font-bold text-primary-blue">${
                          booking.date
                            ? new Date(booking.date).toLocaleDateString(
                                "en-GB",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "-"
                        }</div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-center bg-white rounded-lg p-3 shadow-sm">
                            <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Check In</div>
                            <div class="font-bold text-green-600">${
                              booking.checkInTime || "-"
                            }</div>
                        </div>
                        <div class="text-center bg-white rounded-lg p-3 shadow-sm">
                            <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Check Out</div>
                            <div class="font-bold text-red-600">${
                              booking.checkOutTime || "-"
                            }</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Customer Information -->
        <div class="bg-white/95 backdrop-blur-lg rounded-xl p-5 shadow-sm">
<div class="flex items-center mb-4">
<div class="bg-green-500 rounded-lg p-2 mr-3">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
</div>
<h4 class="text-lg font-semibold text-gray-800">Customer Information</h4>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="space-y-4">
    <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            ${(booking.firstName?.[0] || "") + (booking.lastName?.[0] || "")}
        </div>
        <div>
            <div class="font-semibold text-gray-900">${
              booking.firstName || "-"
            } ${booking.lastName || ""}</div>
            <div class="text-sm text-gray-600">Customer Name</div>
        </div>
    </div>
    <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        </div>
        <div>
            <div class="font-semibold text-gray-900 break-all">${
              booking.email || "-"
            }</div>
            <div class="text-sm text-gray-600">Email Address</div>
        </div>
    </div>
</div>
<div class="space-y-4">
    <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
        </div>
        <div>
            <div class="font-semibold text-gray-900">${
              booking.mobileNumber || "-"
            }</div>
            <div class="text-sm text-gray-600">Phone Number</div>
        </div>
    </div>
    <div class="flex items-start space-x-3">
        <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
        </div>
        <div>
            <div class="font-semibold text-gray-900 break-words">${
              booking.address || "-"
            }</div>
            <div class="text-sm text-gray-600">Address</div>
        </div>
    </div>
</div>
</div>
</div>

<!-- Services & Billing -->
<div class="bg-white/95 backdrop-blur-lg rounded-xl p-5 shadow-sm">
<div class="flex items-center mb-4">
<div class="bg-yellow-500 rounded-lg p-2 mr-3">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
    </svg>
</div>
<h4 class="text-lg font-semibold text-gray-800">Services & Billing</h4>
</div>
<div class="space-y-4">
<div class="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
    <div class="flex items-center space-x-3">
        <div class="w-8 h-8 ${
          booking.beverage === "yes"
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-500"
        } rounded-full flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        </div>
        <div>
            <div class="font-medium text-gray-900">Beverage Service</div>
            ${
              booking.beverage === "yes"
                ? `<div class="text-sm text-gray-600">Items: ${beveragesList}</div>`
                : ""
            }
        </div>
    </div>
    <div class="text-right">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          booking.beverage === "yes"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }">
            ${booking.beverage === "yes" ? "Included" : "Not Included"}
        </span>
    </div>
</div>
<div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
            </div>
            <div>
                <div class="font-medium text-gray-900">Total Amount</div>
                <div class="text-sm text-gray-600">All taxes included</div>
            </div>
        </div>
        <div class="text-right">
            <div class="text-2xl font-bold text-green-600">₹${
              booking.totalCost ?? "-"
            }</div>
        </div>
    </div>
</div>
</div>
</div>
    `;
  modal.classList.remove("hidden");
  requestAnimationFrame(() => modal.classList.add("show"));
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (nav && window.scrollY > 100) {
    nav.classList.add("bg-white/95", "backdrop-blur-sm", "shadow-md");
  } else if (nav) {
    nav.classList.remove("bg-white/95", "backdrop-blur-sm", "shadow-md");
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("opacity-100", "translate-y-0");
      entry.target.classList.remove("opacity-0", "translate-y-10");
    }
  });
}, observerOptions);
document.querySelectorAll(".animate-fadeInUp").forEach((el) => {
  el.classList.add(
    "opacity-0",
    "translate-y-10",
    "transition-all",
    "duration-600",
    "ease-out"
  );
  observer.observe(el);
});
