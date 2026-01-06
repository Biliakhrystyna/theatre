<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import axios from 'axios';
import Swal from 'sweetalert2';
import TheSeatMap from './TheSeatMap.vue';
import ThePaymentModal from './ThePaymentModal.vue';

const route = useRoute();
const router = useRouter(); 
const show = ref(null);
const selectedSeats = ref([]);
const user = ref(null); 
const selectedSessionIndex = ref(0);
const isPaymentOpen = ref(false);
//Перетворення місяців в цифри
const monthMap = {
  'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3, 'травня': 4, 'червня': 5,
  'липня': 6, 'серпня': 7, 'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11
};

// Перевірка часу
const isSessionExpired = (dateString) => {
    try {
        if (!dateString) return false;
        const now = new Date();
        const parts = dateString.split(' '); 
        const day = parseInt(parts[0]);
        const month = monthMap[parts[1].replace(',', '')];
        const timeParts = parts[2].split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1] || 0);
        const sessionDate = new Date(now.getFullYear(), month, day, hour, minute);

        return sessionDate < now; // True, якщо дата в минулому
    } catch (e) {
        return false;
    }
};
//Зававнтаження даних
onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) user.value = JSON.parse(userData);
  //Дані про виставу з бекенду по ID
  try {
    const showId = route.params.id;
    const response = await axios.get(`https://theatre-n8rc.onrender.com/api/shows/${showId}`);
    show.value = response.data;
    if (show.value.schedule && show.value.schedule.length > 0) {
        selectedSessionIndex.value = 0;
    }
  } catch (error) {
    console.error('Помилка:', error);
  }
});
const currentSession = computed(() => {
    if (!show.value || !show.value.schedule) return null;
    return show.value.schedule[selectedSessionIndex.value];
});
const goToShowInfo = () => router.push(`/show/${show.value._id}`);
const handleSelection = (seats) => selectedSeats.value = seats;

// Ціни
const basePrice = computed(() => show.value?.basePrice || 200);
const vipPrice = computed(() => basePrice.value + 100);
const standardPrice = computed(() => basePrice.value);

//Ціна залежно від ряду
const getSeatPrice = (row) => {
    const base = basePrice.value;
    if (row <= 2) return base + 100;
    return base;
};

const totalPrice = computed(() => {
  return selectedSeats.value.reduce((sum, seat) => sum + getSeatPrice(seat.row), 0);
});

// Оплата
const openPaymentModal = async () => {
  //Перевірка чи авторизований користувач
  if (!user.value) {
    await Swal.fire({ 
      icon: 'warning', 
      title: 'Увійдіть в акаунт', 
      confirmButtonText: 'Увійти',
      confirmButtonColor: '#5c0017', 
      background: 'rgb(181, 38, 38)', 
      color: 'rgba(247, 226, 173, 0.955)' 
    });
    const seatsWithPrice = selectedSeats.value.map(s => `Ряд ${s.row} (${getSeatPrice(s.row)} грн)`);
    const ticketData = {
        showTitle: show.value.title, image: show.value.image,
        seats: seatsWithPrice, totalPrice: totalPrice.value, date: currentSession.value.date
    };
    localStorage.setItem('pendingTicket', JSON.stringify(ticketData));
    router.push('/auth'); 
    return;
  }
  isPaymentOpen.value = true;
};

const processPayment = async () => {
  isPaymentOpen.value = false; 
  Swal.fire({ 
    title: 'Обробка...', 
    didOpen: () => Swal.showLoading(), 
    background: '#fff8e1', 
    color: '#5c0017' 
  });
  const seatsFormatted = selectedSeats.value.map(s => `Ряд ${s.row}, Місце ${s.number} (${getSeatPrice(s.row)} грн)`);
 //Для історії квитків
  const ticketData = {
    showTitle: show.value.title, image: show.value.image,
    seats: seatsFormatted, totalPrice: totalPrice.value,
    date: currentSession.value ? currentSession.value.date : new Date().toLocaleString()
  };

  try {
    const response = await axios.post('https://theatre-n8rc.onrender.com/api/user/buy', {
      email: user.value.email, ticket: ticketData,
      showId: show.value._id, date: currentSession.value.date,
      seatsToBlock: selectedSeats.value.map(s => `${s.row}-${s.number}`)
    });
    
    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        user.value = response.data.user;
    }
    
    await Swal.fire({ 
      icon: 'success', 
      title: 'Оплата успішна!', 
      confirmButtonColor: '#5c0017',
      background: 'rgb(181, 38, 38)',
      color: 'rgba(247, 226, 173, 0.955)', 
    });
    router.push('/profile'); 
  } catch (error) {
    Swal.fire({ 
      icon: 'error', 
      title: 'Помилка оплати', 
      confirmButtonColor: '#5c0017', 
      background: 'rgb(181, 38, 38)', 
      color: 'rgba(247, 226, 173, 0.955)'
     });
  }
};
</script>

<template>
  <div class="details-wrapper">
    <div v-if="show" class="content-block">
      
      <ThePaymentModal :is-open="isPaymentOpen" :total-price="totalPrice" @close="isPaymentOpen = false" @confirm="processPayment" />

      <div class="details-container">
        <div class="image-section"><img :src="show.image" :alt="show.title"></div>
        <div class="info-section">
          <span class="genre-badge">{{ show.genre }}</span>
          <h1>{{ show.title }} <span class="price-from">від {{ standardPrice }} грн</span></h1>
          <span @click="goToShowInfo" class="details-link">(детальніше)</span>
          
          <div class="schedule-block" v-if="show.schedule && show.schedule.length > 0">
             <p class="schedule-label">Оберіть дату сеансу:</p>
             <div class="dates-list">
                <button 
                  v-for="(session, index) in show.schedule" 
                  :key="index" 
                  @click="selectedSessionIndex = index"
                  :class="[
                    'date-btn', 
                    { active: selectedSessionIndex === index },
                    { expired: isSessionExpired(session.date) }
                  ]"
                >
                   {{ session.date }}
                </button>
             </div>
          </div>
          <p class="description">{{ show.description }}</p>
        </div>
      </div>

      <div class="booking-section">
        <h2>Оберіть найкращі місця</h2>
        <p class="session-info" v-if="currentSession">
            Дата вистави: <span>{{ currentSession.date }}</span>
        </p>
        
        <div v-if="currentSession && isSessionExpired(currentSession.date)" class="session-expired-msg">
            <h3>Продаж закрито</h3>
            <p>Ця подія вже відбулася </p>
            <p>Будь ласка, оберіть іншу дату вище.</p>
        </div>

        <div v-else>
            <div class="price-legend">
                <div class="price-item vip"><span class="dot"></span> 1-2 ряд: <strong>{{ vipPrice }} грн</strong></div>
                <div class="price-item std"><span class="dot"></span> 3-5 ряд: <strong>{{ standardPrice }} грн</strong></div>
            </div>

            <TheSeatMap :occupied="currentSession ? currentSession.occupied : []" :base-price="basePrice" @update:selected="handleSelection" />
            
            <div class="summary" v-if="selectedSeats.length > 0">
              <div class="summary-info"><p>Обрано: <strong>{{ selectedSeats.length }}</strong></p><p>Сума: <strong class="total">{{ totalPrice }} грн</strong></p></div>
              <button @click="openPaymentModal" class="confirm-btn">Оформити замовлення</button>
            </div>
        </div>
        </div>
    </div>
    <div v-else class="loading">Завантаження...</div>
  </div>
</template>

<style scoped>
.session-expired-msg {
    text-align: center;
    background:rgb(181, 38, 38);
    color: rgba(247, 226, 173, 0.955);
    padding: 40px;
    border-radius: 10px;
    border: 2px dashed rgba(247, 226, 173, 0.955);
    font-family: 'Century Schoolbook', serif;
}
.session-expired-msg h3 {
    margin: 0 0 10px;
    font-family: 'Century Schoolbook', serif;
    color: rgba(247, 226, 173, 0.955);
}
.details-wrapper { padding: 40px 0; }
.content-block { 
  max-width: 1000px; 
  margin: 0 auto; 
}
.details-container { 
  display: flex; 
  gap: 40px; 
  margin-bottom: 40px; 
}
.image-section img { 
  width: 300px; 
  height: 420px; 
  object-fit: cover; 
  border-radius: 10px; 
  box-shadow: 0 10px 20px rgba(176, 31, 31, 0.637); 
}
.info-section { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: flex-start; 
}
.genre-badge { 
  background: rgba(247, 226, 173, 0.955); 
  color: #68011bf5; border: 1px solid #68011bf5; 
  border-radius: 6px; 
  font-family:'Century Schoolbook',serif; 
  font-weight: bold; 
  padding: 5px 15px; 
  font-size: 0.9rem; 
  margin-bottom: 15px; 
  text-transform: uppercase; 
  align-self: flex-start; 
}
h1 { 
  font-size: 3rem; 
  margin: 0 0 10px; 
  font-family:'Century Schoolbook',serif; 
  color: rgba(247, 226, 173, 0.955); 
  background-color: #5c0017; 
  padding: 5px 20px; 
  display: inline-block; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.5); 
  border-radius: 5px; 
}
.price-from { 
  display: block; 
  font-size: 1rem; 
  font-weight: normal; 
  margin-top: 5px; 
  text-align: right; 
  color: rgba(247, 226, 173, 0.955); 
}
.details-link { 
  font-size: 0.9rem; 
  margin-bottom: 20px; 
  text-decoration: underline; 
  cursor: pointer; 
  font-weight: normal; 
  color: rgba(247, 226, 173, 0.955); 
  font-weight: bold;
  font-family: 'Georgia', serif; 
  font-style: italic; 
}
.schedule-block { 
  margin-bottom: 25px; 
  width: 100%; 
}
.schedule-label { 
  font-family: 'Georgia', serif; 
  font-weight: bold; 
  color: rgba(247, 226, 173, 0.955);; 
  margin-bottom: 10px; 
  font-size: 1.1rem; 
}
.dates-list { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 10px; 
}
.date-btn { 
  background: rgba(247, 226, 173, 0.955); 
  border: 2px solid #5c0017; 
  padding: 8px 16px; 
  border-radius: 20px; 
  cursor: pointer; 
  transition: 0.3s; 
  font-weight: bold; 
  font-family: 'Century Schoolbook', serif; 
  color: #5c0017; 
  font-size: 0.95rem; 
}
.date-btn:hover { 
  background: #7a0020; 
  color: rgba(247, 226, 173, 0.955); 
  border-color: rgba(247, 226, 173, 0.955); 
}
.date-btn.active { 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
  border-color: #5c0017; 
  transform: scale(1.05); 
  box-shadow: 0 3px 10px rgba(0,0,0,0.2); 
}
.date-btn.expired { 
  background: #e0e0e0; 
  color: #999; 
  border-color: #5c0017; 
}
.date-btn.expired:hover { 
  background: #e0e0e0; 
  color: #999; 
  cursor: not-allowed; 
}
.description { 
  font-size: 1.1rem; 
  line-height: 1.6; 
  font-weight: bold; 
  font-family:'Georgia',serif; 
  color: #5c0017; 
  background-color:rgba(247, 226, 173, 0.955); 
  padding: 10px 25px; 
}
.booking-section { 
  background: rgb(181, 38, 38); 
  padding: 30px; 
  border-radius: 15px; 
  box-shadow: 0 5px 20px rgba(196, 62, 62, 0.05); 
}
h2 { 
  text-align: center; 
  margin-bottom: 20px; 
  font-family:'Georgia',serif; 
  color: rgba(247, 226, 173, 0.955); 
}
.session-info { 
  text-align: center; 
  color: rgba(247, 226, 173, 0.8); 
  margin-bottom: 20px; 
  font-family: 'Georgia', serif; 
}
.session-info span { 
  color: rgba(247, 226, 173, 0.955); 
  font-weight: bold; 
  text-decoration: underline; 
}
.price-legend { 
  display: flex; 
  justify-content: center; 
  gap: 20px; 
  margin-bottom: 20px; 
  flex-wrap: wrap; 
  background: rgba(0,0,0,0.1); 
  padding: 10px; 
  border-radius: 10px; 
}
.price-item { 
  font-family: 'Georgia', serif; 
  color: rgba(247, 226, 173, 0.955); 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 1rem; 
}
.price-item strong { 
  color: rgba(247, 226, 173, 0.955); 
  text-decoration: underline; 
}
.dot { 
  width: 12px; 
  height: 12px; 
  border-radius: 50%; 
  display: inline-block; 
}
.summary { 
  margin-top: 30px;
  padding-top: 20px; 
  border-top: 2px dashed rgba(247, 226, 173, 0.955); 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.summary-info { 
  color: rgba(247, 226, 173, 0.955); 
  font-family: 'Georgia', serif; 
  font-size: 1.1rem; 
}
.total { 
  font-size: 1.5rem; 
  color: rgba(247, 226, 173, 0.955); 
  margin-left: 10px; 
}
.confirm-btn { 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
  border: 2px solid rgba(247, 226, 173, 0.955); 
  padding: 15px 30px; 
  font-size: 1.1rem; 
  border-radius: 8px; 
  cursor: pointer; 
  transition: 0.2s; 
}
.confirm-btn:hover { 
  background: rgba(247, 226, 173, 0.955); 
  border: 1px solid #5c0017; 
  transform: scale(1.05); 
  color: #5c0017; 
}
.loading { 
  text-align: center; 
  font-size: 1.5rem; 
  margin-top: 50px; 
  }
</style>