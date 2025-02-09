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
        // Remove "selected" class from all buttons
        markerButtons.forEach(btn => btn.classList.remove('selected'));

        // Add "selected" class to the clicked button
        this.classList.add('selected');

        // Update selected color based on button's dataset
        selectedColor = this.dataset.color;
    });
});
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

// Event listener for clicking on the map
map.on('click', function (event) {
    selectedCoordinates = {
        lat: event.latlng.lat.toFixed(6),
        lng: event.latlng.lng.toFixed(6)
    };
    let message = document.querySelector('.message-box').value.trim(); // Get user message
    console.log("📍 Marker placed at:", selectedCoordinates);

    // Remove any existing markers before adding a new one
    map.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Add a new custom circle marker at the clicked position
    L.circleMarker([selectedCoordinates.lat, selectedCoordinates.lng], {
        radius: 8, // Small dot size
        fillColor: getColor(selectedColor), // Get the selected button color
        color: 'white', // White outline
        weight: 2, // Outline thickness
        fillOpacity: 1 // Solid fill
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

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzJCJPW8hR94ufFarxo8JAQYfXOLDquQ4Kaqtu4N_CZzTeDpYXld997IJevkhDJxG8/exec";
let selectedOpinion = ""; // Store the selected opinion

// Select all marker buttons
document.querySelectorAll(".marker-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        // Remove 'selected' class from all buttons
        document.querySelectorAll(".marker-btn").forEach(btn => btn.classList.remove("selected"));

        // Add 'selected' class to clicked button
        event.target.classList.add("selected");

        // Store the opinion from the clicked button
        selectedOpinion = event.target.getAttribute("data-color");

        console.log("Opinion selected:", selectedOpinion); // Debugging
    });
});

// Send button event listener
document.querySelector(".send-btn").addEventListener("click", async () => {
    console.log("Send button clicked!");
    map.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });
    const message = document.querySelector(".message-box").value;

    if (!selectedOpinion) {
        alert("Please select an opinion before submitting!");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Sending data:", { latitude, longitude, message, opinion: selectedOpinion });

        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({ latitude, longitude, message, opinion: selectedOpinion }),
        });

        console.log("Data sent successfully!");

        // Show confirmation popup
        showNotification("Thank you! Your feedback has been submitted.");




    }, () => {
        alert("Unable to retrieve your location");
    });
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
