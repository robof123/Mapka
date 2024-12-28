const mapElement = document.getElementById('map');
const adminPanel = document.getElementById('admin-panel');
const adminPanelBtn = document.getElementById('admin-panel-btn');
const closeAdminPanel = document.getElementById('close-admin-panel');
const addPinButton = document.getElementById('add-pin-btn');
const deletePinButton = document.getElementById('delete-pin-btn');
let addingPin = false;
let deletingPin = false;
let pins = [];
let isAdminPanelVisible = false;

function toggleAdminPanel() {
    if (isAdminPanelVisible) {
        adminPanel.style.display = 'none';
    } else {
        adminPanel.style.display = 'block';
    }
    isAdminPanelVisible = !isAdminPanelVisible;
}

function createPin(x, y) {
    const pin = document.createElement('div');
    pin.classList.add('pin');
    pin.style.left = `${x}%`;
    pin.style.top = `${y}%`;

    const infoBox = document.createElement('div');
    infoBox.classList.add('info-box');
    infoBox.innerHTML = `
        <label>
            <input type="checkbox" id="occupied" onchange="toggleOccupied(this)"> Zajęte
        </label>
        <br>
        <label>
            Do której godziny: <input type="time" id="end-time">
        </label>
        <br>
        <button onclick="releaseSpot(this)">Zwolnij stanowisko</button>
        <button onclick="refreshSpot(this)">Odśwież stanowisko</button>
        <div>Ostatnie odświeżenie: <span class="last-refresh">Brak</span></div>
    `;

    pin.addEventListener('click', (event) => {
        if (deletingPin) {
            if (confirm("Czy na pewno chcesz usunąć tę pinezkę?")) {
                mapElement.removeChild(pin);
                pins = pins.filter(p => p !== pin);
            }
        } else {
            event.stopPropagation();
            closeAllInfoBoxes();
            infoBox.classList.add('active');
        }
    });

    infoBox.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from closing the box
    });

    pin.appendChild(infoBox);
    mapElement.appendChild(pin);
    pins.push(pin);
}

function toggleOccupied(checkbox) {
    const infoBox = checkbox.parentElement.parentElement;

    if (checkbox.checked) {
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 1);
        const endTimeInput = infoBox.querySelector('#end-time');
        endTimeInput.value = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

function refreshSpot(button) {
    const infoBox = button.parentElement;
    updateLastRefresh(infoBox);
    alert("Stanowisko zostało odświeżone.");
}

function releaseSpot(button) {
    const infoBox = button.parentElement;
    const isOccupied = infoBox.querySelector('#occupied');

    if (isOccupied.checked) {
        isOccupied.checked = false;
        alert("Stanowisko zostało zwolnione.");
    } else {
        alert("Stanowisko jest już wolne.");
    }

    updateLastRefresh(infoBox);
}

function updateLastRefresh(infoBox) {
    const lastRefresh = infoBox.querySelector('.last-refresh');
    const currentTime = new Date().toLocaleString();
    lastRefresh.textContent = currentTime;
}

function closeAllInfoBoxes() {
    const infoBoxes = document.querySelectorAll('.info-box');
    infoBoxes.forEach(box => box.classList.remove('active'));
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.info-box')) {
        closeAllInfoBoxes();
    }
});

function startAddingPin() {
    addingPin = true;
    alert("Kliknij na mapę, aby dodać pinezkę.");
    
    // Upewnijmy się, że przypisujemy tylko raz event listener
    mapElement.removeEventListener('click', handleMapClick); // Usuwamy poprzednie przypisania
    mapElement.addEventListener('click', handleMapClick);
}

function handleMapClick(event) {
    if (!addingPin) return;

    const rect = mapElement.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    const confirmAdd = confirm("Czy na pewno chcesz dodać pinezkę w tym miejscu?");

    if (confirmAdd) {
        createPin(xPercent, yPercent);
    }

    // Zatrzymujemy dodawanie po kliknięciu
    addingPin = false;
    mapElement.removeEventListener('click', handleMapClick);
}

function startDeletingPin() {
    deletingPin = true;
    alert("Kliknij na pinezkę, aby ją usunąć.");
    
    mapElement.removeEventListener('click', handleMapClickDelete); // Usuwamy poprzednie przypisania
    mapElement.addEventListener('click', handleMapClickDelete);
}

function handleMapClickDelete(event) {
    if (!deletingPin) return;

    const rect = mapElement.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    const pinToDelete = pins.find(pin => {
        const pinRect = pin.getBoundingClientRect();
        return xPercent >= (pinRect.left / rect.width) * 100 &&
            xPercent <= (pinRect.right / rect.width) * 100 &&
            yPercent >= (pinRect.top / rect.height) * 100 &&
            yPercent <= (pinRect.bottom / rect.height) * 100;
    });

    if (pinToDelete) {
        if (confirm("Czy na pewno chcesz usunąć tę pinezkę?")) {
            mapElement.removeChild(pinToDelete);
            pins = pins.filter(p => p !== pinToDelete);
        }
    }

    deletingPin = false;
    mapElement.removeEventListener('click', handleMapClickDelete);
}

// Panel Administratora
adminPanelBtn.addEventListener('click', toggleAdminPanel);
closeAdminPanel.addEventListener('click', () => adminPanel.style.display = 'none');
addPinButton.addEventListener('click', startAddingPin);
deletePinButton.addEventListener('click', startDeletingPin);
