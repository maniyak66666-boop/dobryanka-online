class Game {
    constructor() {
        this.map = null;
        this.playerMarker = null;
        this.multiplayer = new Multiplayer();
        this.currentPlayerId = 'player_' + Math.random().toString(36).substr(2, 9);
        this.playerName = '';
    }

    login() {
        const nameInput = document.getElementById('player-name');
        this.playerName = nameInput.value.trim() || 'Аноним';
        
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('current-player').textContent = `👤 ${this.playerName}`;

        this.initMap();
        this.initMultiplayer();
    }

    initMap() {
        this.map = L.map('map').setView([CONFIG.center.lat, CONFIG.center.lng], CONFIG.zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(this.map);

        // Добавляем маркеры мест
        CONFIG.locations.forEach(loc => {
            L.marker([loc.lat, loc.lng])
                .addTo(this.map)
                .bindPopup(`<b>${loc.name}</b><br>${loc.description}`);
        });

        // Следим за геопозицией
        this.map.locate({setView: true, maxZoom: 16, watch: true});
        this.map.on('locationfound', (e) => this.onPositionUpdate(e.latlng));
        this.map.on('locationerror', () => this.onPositionUpdate(CONFIG.center));
    }

    onPositionUpdate(position) {
        if (this.playerMarker) this.map.removeLayer(this.playerMarker);

        this.playerMarker = L.marker([position.lat, position.lng])
            .addTo(this.map)
            .bindPopup('Вы здесь');

        this.multiplayer.updatePosition(position);
        this.updateLocationInfo(position);
    }

    updateLocationInfo(position) {
        const location = this.multiplayer.getLocationName(position);
        document.getElementById('location-info').textContent = `📍 ${location}`;
    }

    initMultiplayer() {
        this.multiplayer.registerPlayer(this.currentPlayerId, this.playerName, CONFIG.center);
        
        this.multiplayer.subscribeToChat((msg) => this.addChatMessage(msg));

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChat();
        });
    }

    sendChat() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (message) {
            const location = document.getElementById('location-info').textContent;
            this.multiplayer.sendMessage(message, location);
            input.value = '';
        }
    }

    addChatMessage(msg) {
        const chatDiv = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = 'chat-message';
        div.innerHTML = `<strong>${msg.playerName}</strong>: ${msg.message}`;
        chatDiv.appendChild(div);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    updatePlayersList() {
        const nearby = this.multiplayer.getNearbyPlayers();
        const listDiv = document.getElementById('nearby-players');
        listDiv.innerHTML = nearby.map(p => `<li>👤 ${p.name}</li>`).join('');
        
        const online = this.multiplayer.getOnlinePlayers().length;
        document.getElementById('online-count').textContent = `👥 Онлайн: ${online}`;
    }
}

const game = new Game();