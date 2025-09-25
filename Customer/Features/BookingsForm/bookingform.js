
const modalOverlay = document.getElementById("modal-overlay");
const modalCard = document.getElementById("modal-card");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

// Modal texts
const modalData = {
    terms: {
        title: "Terms & Conditions",
        content: `
Welcome to our Meeting Hall Booking service. Please read carefully:
<br><br>
1. Bookings must be confirmed with valid details.<br>
2. Cancellation is allowed up to 24 hours before check-in.<br>
3. Guests are responsible for damages caused during the booking.<br>
4. Management reserves the right to refuse service.<br>
5. By proceeding, you agree to comply with all listed policies.
`
    },
    privacy: {
        title: "Privacy Policy",
        content: `
We value your privacy and ensure:<br><br>
- Your personal data is securely stored.<br>
- We never share information with third parties.<br>
- Data is used only for booking confirmation and communication.<br>
- By booking, you consent to our data usage policies.
`
    }
};

// Open modal
document.getElementById("open-terms").addEventListener("click", (e) => {
    e.preventDefault();
    modalTitle.innerHTML = modalData.terms.title;
    modalContent.innerHTML = modalData.terms.content;
    modalOverlay.classList.remove("hidden");
});

document.getElementById("open-privacy").addEventListener("click", (e) => {
    e.preventDefault();
    modalTitle.innerHTML = modalData.privacy.title;
    modalContent.innerHTML = modalData.privacy.content;
    modalOverlay.classList.remove("hidden");
});

// Close modal
modalClose.addEventListener("click", () => modalOverlay.classList.add("hidden"));

// Close when clicking outside the modal card
modalOverlay.addEventListener("click", (e) => {
    if (!modalCard.contains(e.target)) {
        modalOverlay.classList.add("hidden");
    }
});

