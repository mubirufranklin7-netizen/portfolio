// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

nav.querySelectorAll("a").forEach(link =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

// Dark mode (remembers choice where storage is available)
const themeBtn = document.getElementById("themeBtn");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.innerHTML = theme === "dark" ? "&#9728;" : "&#9790;";
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// Project filter
const filterButtons = document.querySelectorAll(".filter");
const cards = document.querySelectorAll("#projectGrid .card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    cards.forEach(card => {
      const categories = card.dataset.cat.split(" ");
      const show = filter === "all" || categories.includes(filter);
      card.classList.toggle("hide", !show);
    });
  });
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Highlight active nav link while scrolling
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll("nav a");

const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link =>
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id)
      );
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach(section => spy.observe(section));

// Contact form: sends the message through Formspree
const form = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");
const submitBtn = document.getElementById("submitBtn");

function showMessage(text, ok) {
  formMsg.textContent = text;
  formMsg.classList.toggle("ok", ok);
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  // Clear old error highlighting
  form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

  // Validation
  if (!name || !email || !message) {
    [form.name, form.email, form.message].forEach(el => {
      if (!el.value.trim()) el.classList.add("invalid");
    });
    showMessage("Please fill in all required fields.", false);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.classList.add("invalid");
    showMessage("Please enter a valid email address.", false);
    return;
  }

  // Send
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  showMessage("", false);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      showMessage("Thank you! Your message has been sent. I will reply soon.", true);
      form.reset();
    } else {
      showMessage("Something went wrong. Please email me directly instead.", false);
    }
  } catch (error) {
    showMessage("Network error. Please check your connection and try again.", false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
