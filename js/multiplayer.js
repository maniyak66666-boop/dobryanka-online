class Multiplayer {
    constructor() {
        this.playersRef = database.ref('players');
        this.chatRef = database.ref('chat');
        this.currentPlayer = null;
        this.players = {};
    }

    registerPlayer(playerId, name, position) {
        this.currentPlayer = {
            id: playerId,
            name: name,
            position: position,
            location: 'Добрянка',
            lastSeen: Date.now(),
            online: true
        };
        this.playersRef.child(playerId).set(this.currentPlayer);

        setInterval(() => {
            this.playersRef.child(playerId).update({ lastSeen: Date.now() });
        }, 5000);

        this.subscribeToPlayers();
    }

    updatePosition(position) {
        if (!this.currentPlayer) return;
        const location = this.getLocationName(position);
        this.playersRef.child(this.currentPlayer.id).update({ position, location });
        this.currentPlayer.position = position;
    }

    getLocationName(position) {
        for (let loc of CONFIG.locations) {
            const dist = this.getDistance(position, {lat: loc.lat, lng: loc.lng});
            if (dist < 100) return loc.name;
        }
        return 'Улицы Добрянки';
    }

    getDistance(coord1, coord2) {
        const R = 6371e3;
        const φ1 = coord1.lat * Math.PI / 180;
        const φ2 = coord2.lat * Math.PI / 180;
        const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
        const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    subscribeToPlayers() {
        this.playersRef.on('value', (snapshot) => {
            this.players = snapshot.val() || {};
            // Удаляем старых игроков
            const now = Date.now();
            Object.keys(this.players).forEach(id => {
                if (now - this.players[id].lastSeen > 15000) {
                    this.playersRef.child(id).remove();
                }
            });
            game.updatePlayersList();
        });
    }

    sendMessage(message, location) {
        if (!this.currentPlayer) return;
        this.chatRef.push({
            playerId: this.currentPlayer.id,
            playerName: this.currentPlayer.name,
            message,
            location,
            timestamp: Date.now()
        });
    }

    subscribeToChat(callback) {
        this.chatRef.limitToLast(50).on('child_added', (s) => callback(s.val()));
    }

    getOnlinePlayers() { return Object.values(this.players); }
    
    getNearbyPlayers(radius = 500) {
        if (!this.currentPlayer) return [];
        return Object.values(this.players).filter(p => {
            if (p.id === this.currentPlayer.id) return false;
            return this.getDistance(this.currentPlayer.position, p.position) <= radius;
        });
    }
}