// Declare global variables
let selectedCoordinates = null;
let selectedColor = 'green'; // Default marker color

// Initialize the map
const map = L.map('map').setView([59.332273, 18.033438], 13);

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
    .bindPopup(`<b>Selected Color:</b> ${selectedColor}<br><b>Message:</b> ${message}`)
    .openPopup();
});

// Function to map button colors to actual hex values
function getColor(color) {
    const colors = {
        'green': '#66bb6a',
        'yellow': '#ffca28',
        'red': '#ef5350'
    };
    return colors[color] || '#000';
}

// Ensure Send button reads the correct value
document.querySelector('.send-btn').addEventListener('click', function () {
    console.log("🔄 Checking selectedCoordinates before sending:", selectedCoordinates);

    if (!selectedCoordinates) {
        console.error("❌ ERROR: No coordinates selected before sending.");
        return;
    }

    fetch('/save-marker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lat: selectedCoordinates.lat,
            lng: selectedCoordinates.lng,
            color: selectedColor
        })
    })
    .then(response => response.json())
    .then(data => console.log("✅ Data sent successfully:", data))
    .catch(error => console.error("❌ Error:", error));
});
