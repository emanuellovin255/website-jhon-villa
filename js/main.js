const WHATSAPP = "34600903300";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// Cabecera al hacer scroll
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menú móvil
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const closeMenu = () => {
  nav.classList.remove("open");
  burger.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
};
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

// Formulario → WhatsApp
const form = document.getElementById("form");
const errorBox = document.getElementById("formError");
const chips = form.querySelector(".chips");

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const errors = [];

  ["nombre", "telefono", "localidad"].forEach(name => {
    const el = form.elements[name];
    const bad = !el.value.trim();
    el.classList.toggle("invalid", bad);
    if (bad) errors.push(el);
  });

  const phone = form.elements.telefono;
  if (phone.value.trim() && !/^\+?[\d\s]{9,15}$/.test(phone.value.trim())) {
    phone.classList.add("invalid");
    errors.push(phone);
  }

  chips.classList.toggle("invalid", !data.averia);
  if (!data.averia) errors.push(chips.querySelector("input"));

  const consent = form.elements.consent;
  consent.classList.toggle("invalid", !consent.checked);
  if (!consent.checked) errors.push(consent);

  if (errors.length) {
    errorBox.textContent = !consent.checked && errors.length === 1
      ? "Debes aceptar el uso de tus datos para enviar la solicitud."
      : "Revisa los campos marcados para continuar.";
    errors[0].focus();
    return;
  }
  errorBox.textContent = "";

  const text = [
    "*Nueva solicitud de servicio*",
    `Nombre: ${data.nombre.trim()}`,
    `Teléfono: ${data.telefono.trim()}`,
    `Dirección: ${data.localidad.trim()}`,
    `Servicio: ${data.averia}`,
    `Prioridad: ${data.prioridad}`,
    data.mensaje.trim() ? `Descripción: ${data.mensaje.trim()}` : ""
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  form.reset();
});

form.addEventListener("input", e => {
  e.target.classList.remove("invalid");
  if (e.target.name === "averia") chips.classList.remove("invalid");
});

// Aparición con perspectiva
const revealEls = document.querySelectorAll(".section__head, .svc, .more, .why__media, .why__text, .gallery figure, details, .contact__info, .form, .stats__inner > div");
revealEls.forEach(el => {
  el.classList.add("reveal");
  const siblings = [...el.parentElement.children];
  el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 6) * 0.07}s`);
});
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    io.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
revealEls.forEach(el => io.observe(el));

// Inclinación 3D al pasar el ratón
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".tilt").forEach(card => {
    const max = card.classList.contains("why__media") ? 6 : 9;
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add("is-tilting");
      card.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(10px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    });
  });
}

// Contadores
const counters = document.querySelectorAll("[data-count]");
const countIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    countIO.unobserve(el);
    if (reduceMotion) return;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });
counters.forEach(el => countIO.observe(el));
