const WHATSAPP = "34600903300";

const PUEBLOS = [
  "Ciudad Real", "Puertollano", "Tomelloso", "Valdepeñas", "Alcázar de San Juan",
  "Manzanares", "Daimiel", "La Solana", "Miguelturra", "Campo de Criptana",
  "Socuéllamos", "Bolaños de Calatrava", "Almadén", "Argamasilla de Alba", "Herencia",
  "Almagro", "Villarrubia de los Ojos", "Malagón", "Pedro Muñoz", "Membrilla",
  "Moral de Calatrava", "Torralba de Calatrava", "Carrión de Calatrava", "Fernán Caballero",
  "Poblete", "Aldea del Rey", "Almodóvar del Campo", "Argamasilla de Calatrava",
  "Villanueva de los Infantes", "Santa Cruz de Mudela", "Piedrabuena", "Porzuna",
  "Calzada de Calatrava", "Alcolea de Calatrava", "Corral de Calatrava", "Picón",
  "Valverde", "Las Casas", "Villarta de San Juan", "Arenas de San Juan",
  "Pozuelo de Calatrava", "Granátula de Calatrava", "Valenzuela de Calatrava",
  "Ballesteros de Calatrava", "Cañada de Calatrava", "Los Pozuelos de Calatrava",
  "Villamayor de Calatrava", "Abenójar", "Almuradiel", "Viso del Marqués",
  "Torrenueva", "Castellar de Santiago", "Moral de Calatrava", "Alhambra",
  "Villahermosa", "Fuenllana", "Carrizosa", "Cózar", "Torre de Juan Abad",
  "Almedina", "Montiel", "Terrinches", "Puebla del Príncipe", "Albaladejo",
  "Villamanrique", "Santa Cruz de los Cáñamos", "San Carlos del Valle",
  "Alcubillas", "Villanueva de la Fuente", "Retuerta del Bullaque",
  "Horcajo de los Montes", "Navalpino", "Fontanarejo", "Arroba de los Montes",
  "Luciana", "Alcoba", "El Robledo", "Los Cortijos", "Fuente el Fresno",
  "Puerto Lápice", "Llanos del Caudillo", "Ruidera", "Chillón", "Almodóvar del Campo",
  "Brazatortas", "Hinojosas de Calatrava", "Mestanza", "Solana del Pino",
  "Fuencaliente", "Cabezarados", "Villamayor de Calatrava", "Guadalmez",
  "Saceruela", "Agudo", "Valdemanco del Esteras", "Alamillo", "Puebla de Don Rodrigo",
  "Anchuras", "Villar del Pozo"
];

const unique = [...new Set(PUEBLOS)];

// Lista de zonas
const towns = document.getElementById("towns");
towns.innerHTML = unique.map(p => `<li>${p}</li>`).join("");

// Selector del formulario
const select = document.getElementById("localidad");
const sorted = [unique[0], ...unique.slice(1).sort((a, b) => a.localeCompare(b, "es"))];
select.insertAdjacentHTML("beforeend",
  sorted.map(p => `<option>${p}</option>`).join("") + `<option>Otra localidad</option>`);

// Menú móvil
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  burger.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}));

// Formulario → WhatsApp
const form = document.getElementById("contacto");
const errorBox = document.getElementById("formError");
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const missing = [];
  form.querySelectorAll("[required]").forEach(el => {
    const empty = !el.value.trim();
    el.classList.toggle("invalid", empty);
    if (empty) missing.push(el);
  });
  const phoneOk = /^[+\d][\d\s]{8,14}$/.test(data.telefono.trim());
  if (!phoneOk) form.telefono.classList.add("invalid");

  if (missing.length || !phoneOk) {
    errorBox.textContent = missing.length
      ? "Por favor, rellena todos los campos obligatorios."
      : "Introduce un número de teléfono válido.";
    (missing[0] || form.telefono).focus();
    return;
  }
  errorBox.textContent = "";

  const text = [
    "🚨 *URGENCIA FONTANERÍA*",
    `*Nombre:* ${data.nombre.trim()}`,
    `*Teléfono:* ${data.telefono.trim()}`,
    `*Localidad:* ${data.localidad}`,
    `*Avería:* ${data.averia}`,
    data.mensaje.trim() ? `*Mensaje:* ${data.mensaje.trim()}` : ""
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  form.reset();
});

// Animaciones al hacer scroll
const revealEls = document.querySelectorAll(".service, .why__img, .why__text, .gallery img, details, .section__head");
revealEls.forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));
