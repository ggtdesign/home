document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle_btn");
  const toggleBtnIcon = document.querySelector(".toggle_btn i");
  const offCanvasMenu = document.getElementById("offcanvasMenu");
  const closeBtn = document.querySelector(".close_btn i");

  const minute = document.querySelectorAll('.minutenzeiger1, .minutenzeiger2');
  const stunde = document.querySelectorAll('.stundenzeiger1, .stundenzeiger2');
  const totalisatorLinks = document.querySelectorAll('.totalisator-links, .sekundenzeiger');
  const messschieber = document.querySelectorAll('.messschieber1, .messschieber2');

  let sekundenVerlauf = 0;
  let minutenVerlauf = 0;
  let stundenVerlauf = 0;

  let isDragging = false;
  let currentAngle = 0;

  function toggleOffCanvas() {
    offCanvasMenu.classList.toggle('open');

    const isOpen = offCanvasMenu.classList.contains("open");
    toggleBtnIcon.classList = isOpen ? "fa-solid fa-xmark": "fa-solid fa-bars";
  }
  
  function closeOffCanvas() {
    offCanvasMenu.classList.remove('open');
    toggleBtnIcon.classList = "fa-solid fa-bars";
  }

  toggleBtn.addEventListener("click", toggleOffCanvas);
  closeBtn.addEventListener("click", closeOffCanvas);

  function updateClock() {
    const date = new Date;
    const millisekunden = date.getMilliseconds();
    const sekunden = date.getSeconds();
    const minuten = date.getMinutes();
    const stunden = date.getHours();
    
    sekundenVerlauf = (sekunden * 6) + (millisekunden / 166.67);
    minutenVerlauf = (minuten * 6) + (sekunden / 10);
    stundenVerlauf = (stunden * 30) + (minuten / 2);

    minute.forEach(el => {
      el.style.transform = `rotate(${minutenVerlauf}deg)`;
    });
    stunde.forEach(el => {
      el.style.transform = `rotate(${stundenVerlauf}deg)`;
    });
    totalisatorLinks.forEach(el => {
      el.style.transform = `rotate(${sekundenVerlauf}deg)`;
    });  

    if (typeof isRunning !== "undefined" && isRunning) {
      updateStoppuhr();
    }
    requestAnimationFrame(updateClock);
  }
  updateClock();

  messschieber.addEventListener('mousedown', startDrag);
  messschieber.addEventListener('touchstart', startDrag);

  function startDrag(e) {
    e.preventDefault();

    if (isDragging) return;
    isDragging = true;
    messschieber.style.transition = 'none';

    const event = e.touches ? e.touches[0] : e;

    const rect = messschieber.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    const transform = window.getComputedStyle(messschieber).transform;
    let matrix = transform.match(/matrix\(([^]+)\)/);

    if (matrix) {
      let values = matrix[1].split(', ');
      let a = parseFloat(values[0]);
      let b = parseFloat(values[1]);
      currentAngle = Math.atan2(b, a);
    } else {
      currentAngle = 0;
    }

    const startAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x) - currentAngle;

    function onMove(e) {
      if (!isDragging) return;
      const moveEvent = e.touches ? e.touches[0] : e;
      let newAngle = Math.atan2(moveEvent.clientY - center.y, moveEvent.clientX - center.x) - startAngle;
      messschieber.style.transform = `rotate(${newAngle}rad)`;
    }

    function onEnd() {
      isDragging = false;
      currentAngle = parseFloat(messschieber.style.transform.match(/rotate\(([^)]+)rad\)/)[1]);
      messschieber.style.transition = 'transform 0.5s ease';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  }
});

document.getElementById("contactForm").addEventListener("submit", function(event) {
  let valid = true;
  let requiredFields = ["title", "name", "email", "message", "dpa-consent"];
  let form = this;

  requiredFields.forEach(function(id) {
    let field = document.getElementById(id);
    let errorMessage = field.nextElementSibling;
    if ((field.type === "checkbox" && !field.checked) || (field.value.trim() === "")) {
      errorMessage.textContent = "Dieses Feld ist erforderlich";
      field.classList.add("error-border");
      valid = false;
    } else {
      errorMessage.textContent = "";
      field.classList.remove("error-border");
    }
  });

  if (valid) {
    // Daten an Formspree senden
    let formData = new FormData(this);
    fetch(this.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    }).then(response => {
      if (response.ok) {
        alert("Danke! Ihre Nachricht wurde erfolgreich gesendet.");
        form.reset(); // 🔄 Formular zurücksetzen
      } else {
        alert("Es gab ein Problem. Bitte versuchen Sie es erneut.");
      }
    }).catch(() => alert("Es gab ein Problem. Bitte versuchen Sie es erneut."));
  }

  event.preventDefault();
});