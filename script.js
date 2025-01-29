var btn = document.getElementById('btn');
document.addEventListener("DOMContentLoaded", function () {
    const compassBtn = document.getElementById("btn-compass");
    const toggleBtns = document.querySelectorAll(".toggle-btn");
    const slider = document.getElementById("btn"); // The moving slider
  
    // Clicking the compass button
    compassBtn.addEventListener("click", function () {
      compassBtn.classList.add("active"); // Add white border
      slider.style.background = "transparent"; // Make slider transparent
    });
  
    // Clicking toggle buttons
    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        compassBtn.classList.remove("active"); // Remove white border from compass
        slider.style.background = "white"; // Restore slider background
      });
    });
  });

function moveToTop() {
    btn.style.transform = 'translateY(0px)'; // Moves slider to first button
}

function moveToBottom() {
    btn.style.transform = 'translateY(125%)'; // Moves slider to second button
}

  