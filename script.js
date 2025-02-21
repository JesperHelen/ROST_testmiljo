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

// Event listener for clicking on the map (adds marker & stores coordinates)
map.on("click", function (event) {
    selectedCoordinates = {
        lat: parseFloat(event.latlng.lat.toFixed(6)), // Ensure decimal format
        lng: parseFloat(event.latlng.lng.toFixed(6))
    };

    let message = document.querySelector('.message-box').value.trim(); 

    console.log("📍 Marker placed at:", selectedCoordinates); // Debugging: Check if this logs correctly

    // Remove existing markers
    map.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Add a new marker
    L.circleMarker([selectedCoordinates.lat, selectedCoordinates.lng], {
        radius: 8,
        fillColor: getColor(selectedColor),
        color: 'white',
        weight: 2,
        fillOpacity: 1
    }).addTo(map)
    .bindPopup(`<b>Opinion:</b> ${selectedColor}<br><b>Message:</b> ${message}`)
    .openPopup();
});

// Function to map button colors to actual hex values
function getColor(color) {
    const colors = {
        'Positive': '#66bb6a',
        'Neutral': '#ffca28',
        'Negative': '#ef5350'
    };
    return colors[color] || '#fff';
}

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

    // ✅ Remove all markers after submission
    map.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    selectedCoordinates = null; // Reset selection

    // ✅ Show confirmation popup
    showNotification("Thank you! Your feedback has been submitted.");

    // ✅ Reset input fields
    document.querySelector(".message-box").value = "";
    // selectedOpinion = "";
    // document.querySelectorAll(".marker-btn").forEach(btn => btn.classList.remove("selected"));
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
