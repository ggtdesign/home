document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle_btn");
  const toggleBtnIcon = document.querySelector(".toggle_btn i");
  const offCanvasMenu = document.getElementById("offcanvasMenu");
  const closeBtn = document.querySelector(".close_btn i");

  const minute = document.querySelectorAll('.minutenzeiger1, .minutenzeiger2, .minutenzeiger3');
  const stunde = document.querySelectorAll('.stundenzeiger1, .stundenzeiger2, .stundenzeiger3');
  const totalisatorLinks = document.querySelectorAll('.totalisator-links, .sekundenzeiger');
  const messschieber = document.querySelectorAll('.messschieber1, .messschieber2');

  const totalisatorLinks1 = document.querySelectorAll('.totalisator-links1');
  const totalisatorLinks2 = document.querySelectorAll('.totalisator-links2');
  const totalisatorRechts1 = document.querySelectorAll('.totalisator-rechts1');
  const totalisatorRechts2 = document.querySelectorAll('.totalisator-rechts2');
  const totalisatorUnten1 = document.querySelectorAll('.totalisator-unten1');
  const mondphaseDial = document.querySelectorAll('.mondphase-dial');

  let sekundenVerlauf = 0;
  let minutenVerlauf = 0;
  let stundenVerlauf = 0;

  let isDragging = false;
  let currentAngle = 0;

  const predefinedAnglesWeekday = [
    0.0, 54.0, 104.0, 154.0, 208.0, 254.0, 310.0
  ];

  const predefinedAnglesMonthDay = [
    0.0,   11.0,  23.0,  35.0,  48.0,  60.0,  72.0,  85.0,
    95.0,  106.0, 118.0, 130.0, 140.0, 153.0, 163.0, 175.0,
    186.0, 197.0, 208.0, 220.0, 232.0, 242.0, 253.0, 266.0,
    277.0, 290.0, 301.0, 313.0, 324.0, 336.0, 349.0
  ];

  const predefinedAnglesMonth = [
    0.0,  30.0,  60.0,  90.0,  120.0, 150.0,
    180.0, 210.0, 240.0, 270.0, 301.0, 330.0
  ];

  const predefinedAnglesQuarter = [45.0, 135.0, 225.0, 315.0];

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

    const weekdayIdx = date.getDay();
    const dayIdx     = date.getDate() - 1;
    const monthIdx   = date.getMonth();
    const quarterIdx = Math.floor(monthIdx / 3);

    const tag = date.getDay();
    const tagImMonat = date.getDate();
    const monat = date.getMonth();

    const sGenau = sekunden + millisekunden / 1000;
    const mGenau = minuten + sGenau / 60;
    const hGenau = stunden + minuten / 60 + sekunden / 3600;

    const links1Rotation = 180 + hGenau * 15;
    const links2Rotation  = predefinedAnglesWeekday[weekdayIdx];

    const tageImMonat = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const rechts1Rotation = predefinedAnglesQuarter[quarterIdx];
    const rechts2Rotation = predefinedAnglesMonth[monthIdx];

    const unten1Rotation  = predefinedAnglesMonthDay[dayIdx];

    const newMoonRef  = Date.UTC(2000, 0, 6, 18, 14);
    const synodicMs   = 29.530588853 * 86400000;
    const phaseMs     = (((date.getTime() - newMoonRef) % synodicMs) + synodicMs) % synodicMs;
    const mondRotation = 90 + (phaseMs / synodicMs) * 360;

    minute.forEach(el => {
      el.style.transform = `rotate(${minutenVerlauf}deg)`;
    });
    stunde.forEach(el => {
      el.style.transform = `rotate(${stundenVerlauf}deg)`;
    });
    totalisatorLinks.forEach(el => {
      el.style.transform = `rotate(${sekundenVerlauf}deg)`;
    });
    totalisatorLinks1.forEach(el => {
      el.style.transform = `rotate(${links1Rotation}deg)`;
    });
    totalisatorLinks2.forEach(el => {
      el.style.transform = `rotate(${links2Rotation}deg)`;
    });
    totalisatorRechts1.forEach(el => {
      el.style.transform = `rotate(${rechts1Rotation}deg)`;
    });
    totalisatorRechts2.forEach(el => {
      el.style.transform = `rotate(${rechts2Rotation}deg)`;
    });
    totalisatorUnten1.forEach(el => {
      el.style.transform = `rotate(${unten1Rotation}deg)`;
    });
    mondphaseDial.forEach(el => {
      el.style.transform = `rotate(${mondRotation}deg)`;
    });

    if (typeof isRunning !== "undefined" && isRunning) {
      updateStoppuhr();
    }
    requestAnimationFrame(updateClock);
  }
  updateClock();

  messschieber.forEach((el) => {
    el.addEventListener('mousedown', startDrag);
    el.addEventListener('touchstart', startDrag);
  });

  function startDrag(e) {
    e.preventDefault();

    if (isDragging) return;
    isDragging = true;
    const el = e.currentTarget;
    el.style.transition = 'none';

    const event = e.touches ? e.touches[0] : e;

    const rect = el.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    const transform = window.getComputedStyle(el).transform;
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
      el.style.transform = `rotate(${newAngle}rad)`;
    }

    function onEnd() {
      isDragging = false;
      currentAngle = parseFloat(el.style.transform.match(/rotate\(([^)]+)rad\)/)[1]);
      el.style.transition = 'transform 0.5s ease';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  }
});

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let valid = true;
    const requiredFields = ["title", "name", "email", "message", "dpa-consent"];
    const form = this;

    requiredFields.forEach(function(id) {
      const field = document.getElementById(id);
      if (!field) return;

      const container = field.closest(".form-group") || field.closest(".form-checkbox");
      const errorMessage = container ? container.querySelector(".error-message") : null;

      let error = "";
      if (field.type === "checkbox") {
        if (!field.checked) error = "Dieses Feld ist erforderlich";
      } else {
        const value = field.value.trim();
        if (value === "") {
          error = "Dieses Feld ist erforderlich";
        } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Bitte geben Sie eine gültige E-Mail-Adresse ein";
        }
      }

      if (error) {
        if (errorMessage) errorMessage.textContent = error;
        field.classList.add("error-border");
        valid = false;
      } else {
        if (errorMessage) errorMessage.textContent = "";
        field.classList.remove("error-border");
      }
    });

    if (valid) {
      const formData = new FormData(this);
      fetch(this.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      }).then(response => {
        if (response.ok) {
          alert("Danke! Ihre Nachricht wurde erfolgreich gesendet.");
          form.reset();
        } else {
          alert("Es gab ein Problem. Bitte versuchen Sie es erneut.");
        }
      }).catch(() => alert("Es gab ein Problem. Bitte versuchen Sie es erneut."));
    }
  });
}
