const categorySelect = document.getElementById("category");
const roomSelect = document.getElementById("room");

const rooms = {
    compact: ["Room #001", "Room #002", "Room #003", "Room #004"],
    classic: ["Room #005", "Room #006", "Room #007", "Room #008"],
    grand: ["Room #009", "Room #010", "Room #011", "Room #012"]
};

categorySelect.addEventListener("change", function () {
const selected = this.value;
roomSelect.innerHTML = '<option value="">Select a room</option>'; // reset options

if (rooms[selected]) {
    rooms[selected].forEach(room => {
        const option = document.createElement("option");
        option.value = room;
        option.textContent = room;
        roomSelect.appendChild(option);
    });
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
        target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
        });
    }
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
});
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 100) {
            nav.classList.add('bg-white/95', 'backdrop-blur-sm', 'shadow-md');
        } else {
            nav.classList.remove('bg-white/95', 'backdrop-blur-sm', 'shadow-md');
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

// Observe elements for animation
document.querySelectorAll('.animate-fade-in, .animate-slide-up').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-600', 'ease-out');
    observer.observe(el);
});

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      alert("⚠ Please fill all required fields before submitting.");
      return;
    }
    alert("✅ Thank you for your message! We will get back to you soon.");
    contactForm.reset();
  });
}
