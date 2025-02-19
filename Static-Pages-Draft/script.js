
// FOR NAV BAR
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
};

function moveToBottom() {
    btn.style.transform = 'translateY(125%)'; // Moves slider to second button
};
function toggleRoster() {
  let submenu = document.getElementById("roster-menu");
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
};
// MENU WILL USE FRAMER MOTION LATER
document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".menu > ul > li");

  menuItems.forEach(item => {
      item.addEventListener("click", function (e) {
          if (e.target.closest('.sub-menu')) {
              e.stopPropagation();
              // Handle submenu item activation
              const clickedSubItem = e.target.closest('.sub-menu li');
              if (clickedSubItem) {
                  // Remove active class from all submenu siblings
                  clickedSubItem.parentElement.querySelectorAll('li').forEach(subSibling => {
                      subSibling.classList.remove('active');
                  });
                  // Add active class to clicked submenu item
                  clickedSubItem.classList.add('active');
              }
              return;
          }

          // Existing code for main menu items
          this.parentElement.querySelectorAll("li").forEach(sibling => {
              if (sibling !== this) {
                  sibling.classList.remove("active");
                  const submenu = sibling.querySelector("ul");
                  if (submenu) submenu.style.display = "none";
              }
          });

          this.classList.toggle("active");
          const submenu = this.querySelector("ul");
          if (submenu) {
              submenu.style.display = submenu.style.display === "block" ? "none" : "block";
          }
      });
  });
});