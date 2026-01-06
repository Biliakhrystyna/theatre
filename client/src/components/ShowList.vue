<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const shows = ref([]); 
const selectedGenre = ref('Всі'); 
const genres = ['Всі', 'Трагедія', 'Комедія', 'Балет', 'Опера', 'Мюзикл', 'Драма'];

onMounted(async () => {
  try {
    // Запит на сервер за списком вистав
    const response = await axios.get('https://theatre-n8rc.onrender.com/api/shows');
    shows.value = response.data;
  } catch (error) {
    console.error('Помилка завантаження:', error);
  }
});

// Логіка фільтрації
const filteredShows = computed(() => {
  if (selectedGenre.value === 'Всі') {
    return shows.value;
  }
  return shows.value.filter(show => show.genre === selectedGenre.value);
});
</script>

<template>
  <div class="shows-container">
    <h2>Актуальна афіша</h2>

    <div class="filters">
      <button 
        v-for="genre in genres" 
        :key="genre"
        @click="selectedGenre = genre"
        :class="{ active: selectedGenre === genre }"
        class="filter-btn"
      >
        {{ genre }}
      </button>
    </div>
    
    <div class="grid">
      <div v-for="show in filteredShows" :key="show._id" class="card">
        <img :src="show.image" :alt="show.title" class="card-img">
        <div class="card-info">
          <span class="genre">{{ show.genre }}</span>
         <h3>
            <router-link :to="'/show/' + show._id" class="title-link">
              {{ show.title }}
            </router-link>
          </h3>
          <router-link :to="'/tickets/' + show._id" class="buy-btn">
            Купити квиток
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="filteredShows.length === 0" class="no-results">
      На жаль, у цій категорії поки немає вистав.
    </div>
  </div>
</template>

<style scoped>
.shows-container { 
  padding: 20px 15px; 
}
h2 { 
  text-align: center; 
  margin: 30px auto; 
  font-size: 1.1rem; 
  line-height: 1.6;
  font-weight: bold;
  font-family:'Georgia',serif;
  color: #5c0017;
  border: 3px solid #5c0017; 
  background-color:rgba(247, 226, 173, 0.955) ; 
  padding: 10px 50px; 
  max-width: 90%;
  width: fit-content;
}
.filters { 
  display: flex; 
  justify-content: center; 
  flex-wrap: wrap; 
  gap: 10px; 
  margin-bottom: 30px; 
}
.filter-btn { 
  background: rgba(247, 226, 173, 0.955); 
  border: 3px solid #5c0017; 
  padding: 8px 16px; 
  border-radius: 20px; 
  cursor: pointer; 
  transition: 0.3s; 
  font-weight: bold;
  font-family:'Georgia',serif;
  color: #5c0017;
}
.filter-btn:hover { 
  border-color: rgba(247, 226, 173, 0.955); 
  color: rgba(247, 226, 173, 0.955); 
  background: rgb(181, 38, 38); 
}
.filter-btn.active { 
  background: rgb(181, 38, 38); 
  color: rgba(247, 226, 173, 0.955); 
  border-color: rgba(247, 226, 173, 0.955); 
}
.title-link {
  text-decoration: none;      
  color: inherit;             
  transition: color 0.3s;
  cursor: pointer;
}

.title-link:hover {
  text-decoration: underline; 
  color: #5c0017;             
}
.grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); 
  gap: 30px;
}
.card { 
  background: rgba(247, 226, 173, 0.955); 
  border-radius: 10px; 
  overflow: hidden; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
  transition: transform 0.3s; 
  width: 100%;
  max-width: 380px;
  display: flex;       
  flex-direction: column;
}
.card:hover { 
  transform: translateY(-5px); 
}
.card-img { 
  width: 100%; 
  aspect-ratio: 2 / 3;
  object-fit: cover;
}
.card-info { 
  padding: 15px; 
  text-align: center; 
}
.genre { 
  font-size: 0.99rem; 
  color: #6c1818;  
  text-decoration-line: underline;
  margin-bottom: 5px; 
  font-family:'Georgia',serif;
  display: block; 
}
h3 { 
  margin: 10px 0px; 
  font-size: 1.2rem; 
  min-height: 50px; 
  color:rgb(181, 38, 38);
  font-family:'Georgia',serif;
  display: flex;
  align-items: center;
  justify-content: center;
}
.buy-btn { 
  display: inline-block; 
  background: #6c1818; 
  color:rgba(247, 226, 173, 0.955);
  font-family: 'Georgia', serif; 
  text-decoration: none; 
  padding: 10px 20px; 
  border-radius: 5px; 
  width: 80%; 
  transition: 0.3s; 
}
.buy-btn:hover { 
  background:rgba(247, 226, 173, 0.955);
  color:#6c1818;
  font-family: 'Georgia', serif; 
  text-decoration: underline; 
  font-weight: bold;
  border: 2px solid #5c0017;

}
.no-results { 
  text-align: center; 
  margin-top: 30px; 
  color: #951d1d; 
  }
  @media (max-width: 768px) {
  h2 {
    padding: 10px 20px; 
    font-size: 1rem;
  }
  .grid {
    gap: 20px; 
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr; 
  }
  .card {
    max-width: 100%; 
  }
  .filter-btn {
    padding: 6px 12px;
    font-size: 0.85rem; 
  }
}
</style>