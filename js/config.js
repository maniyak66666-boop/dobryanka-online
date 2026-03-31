const CONFIG = {
    center: { lat: 58.47048, lng: 56.42323 },
    zoom: 15,
    locations: [
        {
            id: 'dk-ladugina',
            name: 'ДК им. Ладугина',
            type: 'events',
            lat: 58.462566,
            lng: 56.404884,
            description: 'Площадь с фонтаном - место мероприятий'
        },
        {
            id: 'naberezhnaya',
            name: 'Набережная',
            type: 'landmark',
            lat: 58.4685,
            lng: 56.4150,
            description: 'Набережная Камы'
        }
    ]
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDchQvziVVbplcpCf3DxbblzIstgMn302M",
  authDomain: "dobryanka-game.firebaseapp.com",
  projectId: "dobryanka-game",
  storageBucket: "dobryanka-game.firebasestorage.app",
  messagingSenderId: "284921901802",
  appId: "1:284921901802:web:bcf92b6fad2cbf7c805d93",
  measurementId: "G-MWB689C5BN"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const database = firebase.database();