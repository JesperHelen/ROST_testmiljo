// Function to update favicon based on theme
function updateFavicon() {
    const favicon = document.getElementById("favicon");
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (darkMode) {
        favicon.href = "icons/favicon_white.png"; // Dark mode favicon
    } else {
        favicon.href = "icons/favicon_black.png"; // Light mode favicon
    }
}

// Run function on page load
updateFavicon();

// Detect theme changes and update favicon
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateFavicon);


// Declare global variables
let selectedCoordinates = null;
let selectedColor = 'Other'; // Default marker color

// Initialize the map
const map = L.map('map').setView([13.8426193, 100.5756792], 20);

// Add tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Select all marker buttons and set event listeners
const markerButtons = document.querySelectorAll('.marker-btn');
markerButtons.forEach(button => {
    button.addEventListener('click', function () {
        markerButtons.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
    });
});

// Help icon hover event
document.addEventListener("DOMContentLoaded", function() {
    const helpIcon = document.querySelector(".help-icon");
    const tooltip = document.querySelector(".tooltip");

    helpIcon.addEventListener("mouseover", function() {
        tooltip.style.display = "block";
    });

    helpIcon.addEventListener("mouseout", function() {
        tooltip.style.display = "none";
    });
});

// Global variable to store the current marker
let currentMarker = null;

// Helper function to determine the opinion color
function getOpinionColor(opinion) {
  if (opinion === "Neutral") return "#ffca28";
  if (opinion === "Negative") return "#ef5350";
  return "#66bb6a"; // Default to Positive color
}

// When the map is clicked to add a marker:
map.on('click', function(e) {
  // Set the selected coordinates
  selectedCoordinates = e.latlng;

  // If no opinion is selected, default to "Positive" and update the UI:
  if (!selectedOpinion) {
    selectedOpinion = "Positive";
    document.querySelectorAll('.marker-btn').forEach(btn => btn.classList.remove("selected"));
    const positiveBtn = document.querySelector('.marker-btn.green');
    if (positiveBtn) positiveBtn.classList.add("selected");
  }

  // Determine the opinion color
  const opinionColor = getOpinionColor(selectedOpinion);

  // Remove any existing marker (if only one is allowed)
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  // Get the current text from the message box
  const messageBox = document.querySelector(".message-box");
  const commentText = messageBox.value.trim() || "No comment provided";

  // Build the popup content with bold labels using the opinion's color
  const popupContent = "<strong style='color: " + opinionColor + ";'>Opinion:</strong> " 
                       + selectedOpinion + "<br><strong style='color: " + opinionColor + ";'>Comment:</strong> " 
                       + commentText;

  // Add a new marker with a white border and fill color based on the opinion
  currentMarker = L.circleMarker(e.latlng, {
    radius: 8,
    color: "#fff",      // White border
    weight: 2,
    fillColor: opinionColor,
    fillOpacity: 1
  }).addTo(map);
  currentMarker.bindPopup(popupContent).openPopup();
});

// Listen for input changes in the message box to update the marker's popup
document.querySelector(".message-box").addEventListener("input", function() {
  if (currentMarker && currentMarker.getPopup()) {
    const newComment = this.value.trim() || "No comment provided";
    const opinionColor = getOpinionColor(selectedOpinion);
    const updatedContent = "<strong style='color: " + opinionColor + ";'>Opinion:</strong> " 
                           + selectedOpinion + "<br><strong style='color: " + opinionColor + ";'>Comment:</strong> " 
                           + newComment;
    currentMarker.getPopup().setContent(updatedContent);
  }
});



// Google Sheets URL
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzJCJPW8hR94ufFarxo8JAQYfXOLDquQ4Kaqtu4N_CZzTeDpYXld997IJevkhDJxG8/exec";

let selectedOpinion = ""; // Store the selected opinion

// Select all marker buttons
document.querySelectorAll(".marker-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        document.querySelectorAll(".marker-btn").forEach(btn => btn.classList.remove("selected"));
        event.target.classList.add("selected");
        selectedOpinion = event.target.getAttribute("data-color");
        console.log("Opinion selected:", selectedOpinion);
    });
});

// ✅ FIXED: Now sends the pinned location instead of user's geolocation
document.querySelector(".send-btn").addEventListener("click", async () => {
    console.log("Send button clicked!");

    if (!selectedOpinion) {
        alert("Please select an opinion before submitting!");
        return;
    }

    if (!selectedCoordinates) {
        alert("Please place a marker on the map before submitting!");
        return;
    }

    // Show the loading indicator immediately
    const loader = document.getElementById("loadingIndicator");
    loader.style.display = "flex";

    try {
        const { lat, lng } = selectedCoordinates;
        const message = document.querySelector(".message-box").value.trim();

        console.log("Sending data:", { latitude: lat, longitude: lng, message, opinion: selectedOpinion });

        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({ latitude: lat, longitude: lng, message, opinion: selectedOpinion }),
        });

        console.log("Data sent successfully!");

        // Remove all markers after submission
        map.eachLayer(function (layer) {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });
        selectedCoordinates = null; // Reset selection

        // Show confirmation popup
        showNotification("Thank you! Your feedback has been submitted.");

        // Reset input field
        document.querySelector(".message-box").value = "";
    } catch (error) {
        console.error("Error sending data:", error);
    } finally {
        // Remove the loading indicator regardless of success or error
        loader.style.display = "none";
    }
});


// Function to show a popup notification
function showNotification(text) {
    console.log("Showing notification:", text);
    const notification = document.getElementById("notification");

    if (!notification) {
        console.error("Notification element not found!");
        return;
    }

    notification.innerText = text;
    notification.style.display = "block";
    notification.style.opacity = "1";

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.style.display = "none", 500);
    }, 3000);
}
