<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const user = ref(null);
const allShows = ref([]);
const router = useRouter();
//Місяці у числах
const monthMap = {
  'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3, 'травня': 4, 'червня': 5,
  'липня': 6, 'серпня': 7, 'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11
};

// Перевірка дати (чи минула подія)
const isDatePast = (dateString) => {
  try {
    if (!dateString) return false;
    //Розбиття рядка
    const parts = dateString.split(' '); 
    const day = parseInt(parts[0]);
    const monthName = parts[1].replace(',', '').toLowerCase();
    const timeParts = parts[2].split(':');
    //Перетворення в числах
    const month = monthMap[monthName];
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1] || 0);

    const now = new Date();
    let year = now.getFullYear();
    
    if (month < now.getMonth() && (now.getMonth() - month) > 6) {
        year++;
    }
    
    const eventDate = new Date(year, month, day, hour, minute);
    return eventDate < now; 
  } catch (e) {
    return false;
  }
};
//Завантаження даних
onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push('/auth');
    return;
  }
  //Завантаження афіші для побудови рекомендацій
  try {
    const response = await axios.get('http://https://theatre-n8rc.onrender.com:3000/api/shows');
    allShows.value = response.data;
  } catch (error) {
    console.error("Не вдалося завантажити афішу", error);
  }
});

// Список квитків
const activeTickets = computed(() => { //Активні квитки
  if (!user.value || !user.value.tickets) return [];
  return user.value.tickets.filter(t => !isDatePast(t.date)).reverse();
});

const archivedTickets = computed(() => { //Архівні квитки
  if (!user.value || !user.value.tickets) return [];
  return user.value.tickets.filter(t => isDatePast(t.date)).reverse();
});

// Рекомендації
const recommendedShows = computed(() => { 
  // Тільки майбутні вистави
  const futureShows = allShows.value.filter(s => !isDatePast(s.date));
  // Якщо квитків немає або база пуста — просто перші 2 майбутні
  if (!user.value || !user.value.tickets || user.value.tickets.length === 0) {
      return futureShows.slice(0, 2);
  }
  // Список куплених вистав 
  const boughtTitles = user.value.tickets.map(t => t.showTitle);
  // Сет, щоб не було повторів
  const myGenres = new Set();
  
  user.value.tickets.forEach(ticket => {
    let genre = ticket.genre;
    if (!genre) {
        const originalShow = allShows.value.find(s => s.title === ticket.showTitle);
        if (originalShow) genre = originalShow.genre;
    }
    if (genre) myGenres.add(genre);
  });
  // Пошук жанрів які є в списку myGenres 
  const personalRecs = futureShows.filter(show => {
    const matchesGenre = myGenres.has(show.genre); // Перевірка на даний жанр серед глядацьких
    const notBoughtYet = !boughtTitles.includes(show.title); // Перевірка чи куплена вистава
    return matchesGenre && notBoughtYet;
  });

  // Фінальний список
  if (personalRecs.length >= 2) {
      return personalRecs.slice(0, 2);
  }
  const otherShows = futureShows.filter(show => 
      !boughtTitles.includes(show.title) && !myGenres.has(show.genre)
  );
  
  // Спочатку йдуть персональні, потім інші
  return [...personalRecs, ...otherShows].slice(0, 2);
});
//Вихід з акаунту
const logout = () => {
  Swal.fire({
    title: 'Вихід', 
    text: "Вийти з особистого кабінету?", 
    icon: 'warning',
    showCancelButton: true, 
    confirmButtonColor: '#5c0017', 
    cancelButtonColor: '#d33',
    confirmButtonText: 'Так, вийти',
    cancelButtonText: 'Скасувати',
    background: 'rgb(181, 38, 38)', 
    color: 'rgba(247, 226, 173, 0.955)'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  });
};

const goToShow = (id) => router.push(`/show/${id}`);
const goToPoster = () => router.push('/');
</script>

<template>
  <div class="profile-page" v-if="user">
    
    <aside class="sidebar">
      <div class="avatar-placeholder">{{ user.fullName ? user.fullName[0].toUpperCase() : '👤' }}</div>
      <h2>{{ user.fullName }}</h2>
      <p class="email">{{ user.email }}</p>
      
      <div class="stats">
         <p>Активні квитки: <strong>{{ activeTickets.length }}</strong></p>
         <p>Історія: <strong>{{ archivedTickets.length }}</strong></p>
      </div>

      <button @click="logout" class="logout-btn">Вийти</button>
    </aside>

    <main class="content-area">
      
      <section class="recommendations-section" v-if="recommendedShows.length > 0">
        <div class="rec-header">
            <h3>Рекомендовано для вас</h3>
            <p class="rec-subtitle">Найкращі події з жанрів, які ви любите</p>
        </div>
        
        <div class="rec-grid">
          <div v-for="show in recommendedShows" :key="show._id" class="rec-card" @click="goToShow(show._id)">
            <div class="rec-img-wrapper">
                <img :src="show.image" :alt="show.title">
                <span class="rec-genre-tag">{{ show.genre }}</span>
            </div>
            <div class="rec-info">
              <h4>{{ show.title }}</h4>
              <span class="rec-date">{{ show.date }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="tickets-section">
        <h1>Мої квитки</h1>
        
        <div v-if="activeTickets.length > 0" class="tickets-list">
          <div v-for="(ticket, index) in activeTickets" :key="index" class="ticket-card active-card">
            <div class="ticket-image">
              <img :src="ticket.image" alt="Poster">
            </div>
            <div class="ticket-info">
              <div class="ticket-header">
                <h3>{{ ticket.showTitle }}</h3>
                <span class="status-badge">АКТИВНИЙ</span>
              </div>
              <div class="ticket-details">
                <div class="detail-item">
                  <span class="label">Дата:</span>
                  <span class="value date-value">{{ ticket.date }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Місця:</span>
                  <div class="seats-tags">
                     <span v-for="seat in ticket.seats" :key="seat" class="seat-tag">{{ seat }}</span>
                  </div>
                </div>
              </div>
              <div class="ticket-footer">
                <p class="price">{{ ticket.totalPrice }} грн</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Актуальних квитків немає.</p>
          <button @click="goToPoster" class="go-to-poster">Перейти до Афіші</button>
        </div>
      </section>

      <section class="archive-section" v-if="archivedTickets.length > 0">
        <h2>Минулі події</h2>
        <div class="tickets-list archive-list">
          <div v-for="(ticket, index) in archivedTickets" :key="index" class="ticket-card archive-card">
            <div class="ticket-image grayscale">
              <img :src="ticket.image" alt="Poster">
            </div>
            <div class="ticket-info">
              <div class="ticket-header">
                <h3>{{ ticket.showTitle }}</h3>
                <span class="status-badge completed">ВІДБУЛОСЯ</span>
              </div>
              <div class="ticket-details">
                <span class="label">Дата:</span> {{ ticket.date }}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.profile-page { 
  display: flex; 
  max-width: 1100px; 
  margin: 40px auto; 
  gap: 30px; 
  padding: 0 20px; 
  font-family: 'Georgia', serif; 
  align-items: flex-start; 
}
.sidebar { 
  flex: 0 0 280px; 
  background: rgba(247, 226, 173, 0.955); 
  padding: 30px; 
  border-radius: 10px; 
  text-align: center; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
  border: 2px solid #5c0017; 
  position: sticky; 
  top: 20px; 
}
.avatar-placeholder { 
  width: 100px; 
  height: 100px; 
  background: rgb(181, 38, 38); 
  color: rgba(247, 226, 173, 0.955); 
  font-size: 3rem; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin: 0 auto 15px; 
  border: 3px solid #5c0017; 
}
h2 { 
  color: rgb(181, 38, 38); 
  font-family: 'Georgia', serif; 
  margin-bottom: 5px; 
  font-size: 1.5rem; 
}
.email { 
  color: #5c0017;
  margin-bottom: 20px; 
  font-family: 'Georgia', serif; 
  word-break: break-all; 
}
.stats { 
  background:rgb(181, 38, 38,0.955); 
  padding: 10px; 
  border-radius: 5px; 
  margin-bottom: 20px; 
  color:rgba(247, 226, 173, 0.955);
  font-family: 'Georgia', serif; 
  border: 1px dashed #5c0017; 
}
.logout-btn { 
  border: 1px solid #5c0017; 
  background: transparent; 
  font-family: 'Georgia', serif; 
  color: #5c0017; 
  padding: 10px 20px; 
  border-radius: 5px; 
  cursor: pointer; 
  width: 100%; 
  transition: 0.3s; 
  font-weight: bold; 
}
.logout-btn:hover { 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
}
.content-area { 
  flex: 1; 
  width: 100%; 
}
.recommendations-section { 
    background: #5c0017; 
    padding: 25px; 
    border-radius: 12px; 
    margin-bottom: 40px; 
    color: rgba(247, 226, 173, 0.955); 
    box-shadow: 0 8px 20px rgba(92, 0, 23, 0.3); 
    overflow: hidden; 
}
.recommendations-section h3 { 
  margin: 0; 
  color: rgba(247, 226, 173, 0.955); 
  font-family: 'Century Schoolbook', serif;
  font-size: 1.6rem; 
}
.rec-img-wrapper { 
    position: relative; 
    width: 100%; 
    height: 320px;
    overflow: hidden;
}
.rec-subtitle { 
  margin: 5px 0 0; 
  font-size: 0.9rem; 
  opacity: 0.8; 
  font-style: italic; 
}
.rec-grid { 
   display: grid;
    grid-template-columns: repeat(2, 1fr); 
    gap: 15px; 
    margin-top: 15px; 
    width: 100%;
}
.rec-card { 
  background: transparent; 
  box-shadow: none;       
  border-radius: 0;        
  cursor: pointer; 
  transition: all 0.3s ease; 
  width: 75%;
  height: 50%;
}
.rec-img-wrapper img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  object-position: center;
  background: none; 
}
.rec-genre-tag { 
  position: absolute; 
  top: 10px; 
  right: 10px; 
  background: rgba(92, 0, 23, 0.9); 
  color: rgba(247, 226, 173, 0.955); 
  padding: 2px 8px; 
  border-radius: 12px; 
  font-size: 0.75rem; 
  font-weight: bold; 
}
.rec-info { 
  padding: 12px; 
  text-align: center; 
}
.rec-info h4 { 
  font-size: 1.1rem; 
  margin: 0 0 5px; 
  font-weight: bold; 
}
.rec-date { 
  font-size: 0.9rem; 
  color: rgb(181, 38, 38); 
  display: block; 
}
.tickets-section {
  background: rgb(181, 38, 38); 
  padding: 30px;      
  border-radius: 15px; 
  margin-bottom: 40px; 
  border: 1px solid rgba(247, 226, 173, 0.3); 
}
.tickets-section h1 { 
  margin-bottom: 25px; 
  color: rgba(247, 226, 173, 0.955); 
  font-family: 'Century Schoolbook', serif; 
  border-bottom: 2px solid rgba(247, 226, 173, 0.955); 
  display: inline-block; 
  padding-bottom: 5px; 
}
.ticket-card { 
  background: rgba(247, 226, 173, 0.955) ; 
  border-radius: 10px; 
  overflow: hidden; 
  display: flex; 
  margin-bottom: 25px; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
  border: 1px solid  rgba(247, 226, 173, 0.955); 
  position: relative; 
}
.active-card::before { 
  content: ''; 
  position: absolute; 
  left: 0; 
  top: 0; 
  bottom: 0; 
  width: 5px; 
}
.ticket-image img { 
  width: 130px; 
  height: 100%; 
  object-fit: contain; 
  margin-left: 20px;
}
.ticket-info { 
  flex: 1; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
}
.ticket-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: start; 
  margin-bottom: 10px; 
}
.ticket-header h3 { 
  margin: 0; 
  font-size: 1.4rem; 
  color: #5c0017; 
}
.status-badge { 
  background: rgba(247, 226, 173, 0.955); 
  color: #5c0017; 
  border: 1px solid #5c0017; 
  padding: 3px 10px; 
  border-radius: 10px; 
  font-size: 0.7rem; 
  font-weight: bold; 
  letter-spacing: 1px;
 }
.detail-item { margin-bottom: 8px; }
.label { 
  font-weight: bold; 
  color: rgb(181, 38, 38); 
  font-size: 0.9rem; 
  margin-right: 10px; 
  text-transform: uppercase; 
}
.date-value { 
  color: #5c0017; 
  font-weight: bold; 
  font-size: 1.1rem; 
}
.seats-tags { 
  display: flex; 
  gap: 5px; 
  flex-wrap: wrap; 
  margin-top: 5px; 
}
.seat-tag { 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
  padding: 2px 8px; 
  border-radius: 4px; 
  font-size: 0.85rem; 
}
.ticket-footer { 
  margin-top: 15px; 
  padding-top: 15px; 
  border-top: 1px dashed rgba(247, 226, 173, 0.955); 
}
.price { 
  font-size: 1.4rem; 
  font-weight: bold; 
  color: #5c0017; 
  margin: 0; 
}
.empty-state { 
  text-align: center; 
  padding: 40px; 
  background: #fff8e1; 
  border-radius: 15px; 
  border: 2px dashed #5c0017; 
  color: #5c0017; 
}
.go-to-poster { 
  background: none; 
  border: none; 
  color: #5c0017; 
  text-decoration: underline; 
  font-weight: bold; 
  font-size: 1.1rem; 
  cursor: pointer; 
}
.archive-section { 
  margin-top: 50px; 
  opacity: 0.8; 
}
.archive-section h2 { 
  color: #eee; 
  font-size: 1.5rem; 
  margin-bottom: 20px; 
  border-bottom: 1px solid #ccc; 
  padding-bottom: 5px; 
  display: inline-block; 
}
.archive-card { 
  border-color: #eee; 
  box-shadow: none; 
  background: #f9f9f9; 
}
.grayscale img { 
  filter: grayscale(100%); 
  opacity: 0.7; 
}
.status-badge.completed { 
  background: #eee; 
  color: #777; 
  border-color: #ccc; 
  }
@media (max-width: 900px) {
  .profile-page {
    flex-direction: column; 
    padding: 10px;
    margin-top: 20px;
  }

  .sidebar {
    width: 100%; 
    flex: none; 
    position: static;
    margin-bottom: 20px;
  }
  .rec-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); 
    gap: 10px; 
    margin: 15px 0;
  }
  .rec-img-wrapper {
   width: 100%;
   aspect-ratio: 2 / 3;  
   overflow: hidden;
  }
  
  .rec-info h4 {
    font-size: 0.85rem; 
    margin-bottom: 2px;
  }
  
  .rec-genre-tag {
    font-size: 0.6rem;
    padding: 2px 5px;
  }
  .ticket-card {
    flex-direction: column; 
    align-items: center;
    text-align: center;
  }

  .ticket-image img {
    width: 100%; 
    height: 180px;
    object-fit: cover;
    margin-left: 0;
  }

  .ticket-header {
    flex-direction: column; 
    align-items: center;
    gap: 5px;
  }
}
</style>
