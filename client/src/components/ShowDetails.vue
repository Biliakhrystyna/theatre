<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import axios from 'axios';

const route = useRoute();
const router = useRouter(); 
const show = ref(null);
const isGalleryOpen = ref(false);
const currentImageIndex = ref(0); 
//Галерея вистави
const galleryImages = computed(() => {
  if (!show.value) return [];

  if (show.value.gallery && show.value.gallery.length > 0) {
    return show.value.gallery.map(imgUrl => ({
      src: imgUrl,
      style: '' 
    }));
  }
});

// Відкрити фото
const openGallery = (index) => {
  currentImageIndex.value = index;
  isGalleryOpen.value = true;
  document.body.style.overflow = 'hidden';
};
// Закрити фото
const closeGallery = () => {
  isGalleryOpen.value = false;
  document.body.style.overflow = 'auto';
};
// Гортання
const nextImage = () => {
  if (galleryImages.value.length === 0) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length;
};

const prevImage = () => {
  if (galleryImages.value.length === 0) return;
  currentImageIndex.value = (currentImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length;
};

onMounted(async () => {
  try {
    const showId = route.params.id;
    const response = await axios.get(`http://localhost:3000/api/shows/${showId}`);
    show.value = response.data;
  } catch (error) {
    console.error('Помилка:', error);
  }
});

// Перехід на сторінку купівлі
const goToTicketPage = () => {
   router.push(`/tickets/${show.value._id}`);
};
</script>

<template>
  <div class="details-wrapper">
    <div v-if="show" class="content-block">
      
      <div class="details-container">
        <div class="image-section">
          <img :src="show.image" :alt="show.title">
        </div>
        <div class="info-section">
          <span class="genre-badge">{{ show.genre }}</span>
          
          <h1 @click="goToTicketPage" title="Натисніть, щоб купити квиток">
            {{ show.title }}
          </h1>
          
          <p class="description">{{ show.description }}</p>
          
          <button @click="goToTicketPage" class="main-buy-btn">
            Купити квиток
          </button>
        </div>
      </div>

      <div class="gallery-section">
        <h2>Галерея вистави</h2>
        <p class="hint">Натисніть на фото, щоб збільшити</p>
        
        <div class="gallery-grid">
            <div 
              v-for="(img, index) in galleryImages" 
              :key="index" 
              class="gallery-item"
              @click="openGallery(index)" 
            >
                <img :src="img.src" :style="img.style" alt="Gallery image">
                <div class="overlay"></div>
            </div>
        </div>
      </div>

    </div>

    <div v-else class="loading">Завантаження...</div>

    <div v-if="isGalleryOpen" class="lightbox" @click.self="closeGallery">
        <button class="close-btn" @click="closeGallery">✕</button>
        
        <button v-if="galleryImages.length > 1" class="nav-btn prev" @click="prevImage">❮</button>
        
        <div class="lightbox-content">
            <img 
              :src="galleryImages[currentImageIndex].src" 
              :style="galleryImages[currentImageIndex].style"
              class="large-image"
            >
            <p class="counter">{{ currentImageIndex + 1 }} / {{ galleryImages.length }}</p>
        </div>

        <button v-if="galleryImages.length > 1" class="nav-btn next" @click="nextImage">❯</button>
    </div>

  </div>
</template>

<style scoped>
.details-wrapper { 
  padding: 40px 0; 
}
.content-block { 
  max-width: 1000px; 
  margin: 0 auto; 
  padding: 0 20px; 
}
.details-container { 
  display: flex; 
  gap: 40px; 
  margin-bottom: 50px; 
}
.image-section img { 
  width: 350px; 
  height: 480px; 
  object-fit: cover; 
  border-radius: 10px; 
  box-shadow: 0 10px 20px rgba(176, 31, 31, 0.637); 
  border: 4px solid #5c0017; 
}
.info-section { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: flex-start; 
}
.genre-badge { 
  background: rgba(247, 226, 173); 
  color: #68011bf5; 
  border: 2px solid #68011bf5; 
  border-radius: 6px; 
  font-family:'Century Schoolbook',serif; 
  font-weight: bold; 
  padding: 5px 15px; 
  font-size: 0.9rem; 
  margin-bottom: 20px; 
  text-transform: uppercase; 
}
h1 { 
    font-size: 3rem; margin: 0 0 25px; 
    font-family:'Century Schoolbook',serif; 
    color: rgba(247, 226, 173, 0.955); 
    background-color: #5c0017; 
    padding: 15px 30px; 
    display: inline-block; 
    box-shadow: 0 5px 15px rgba(0,0,0,0.5); 
    border-radius: 5px; 
    cursor: pointer;       /* Рука */
    transition: all 0.3s; 
}
h1:hover {
    transform: scale(1.02);
    background-color: #7a0020;
    text-decoration: underline;
}

.description { 
  font-size: 1.15rem; 
  line-height: 1.8; 
  font-weight: bold; 
  font-family:'Georgia',serif; 
  color: #5c0017; 
  background-color: rgba(247, 226, 173, 0.955); 
  padding: 20px; 
  border-left: 5px solid #5c0017; 
  border-radius: 0 10px 10px 0; 
  margin-bottom: 30px; 
}
.main-buy-btn { 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
  border: 2px solid rgba(247, 226, 173, 0.955); 
  padding: 15px 40px; 
  font-size: 1.2rem; 
  font-family: 'Georgia', serif; 
  font-weight: bold; 
  text-transform: uppercase; 
  cursor: pointer; 
  border-radius: 8px; 
  transition: 0.3s; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.2); 
}
.main-buy-btn:hover { 
  background: rgba(247, 226, 173, 0.955); 
  color: #5c0017; 
  border-color: #5c0017; 
  transform: translateY(-3px); 
}

/* Галерея */
.gallery-section { 
  background: rgb(181, 38, 38); 
  padding: 40px; 
  border-radius: 15px; 
  box-shadow: 0 5px 20px rgba(196, 62, 62, 0.05); 
  border: 2px solid rgba(247, 226, 173, 0.955); 
}
h2 { 
  text-align: center; 
  margin-bottom: 10px; 
  font-family:'Georgia',serif; 
  color: rgba(247, 226, 173, 0.955); 
  font-size: 2rem; 
  text-transform: uppercase; 
  letter-spacing: 2px; 
}
.hint { 
  text-align: center; 
  color: rgba(247, 226, 173, 0.7);
  margin-bottom: 30px;
  font-family: 'Georgia', serif; 
  font-style: italic; 
}
.gallery-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
  gap: 15px; 
}
.gallery-item { 
  height: 200px; 
  border-radius: 8px; 
  overflow: hidden; 
  border: 3px solid rgba(247, 226, 173, 0.6); 
  cursor: pointer; 
  transition: transform 0.3s, border-color 0.3s; 
  position: relative; 
}
.gallery-item:hover { 
  transform: scale(1.05); 
  border-color: rgba(247, 226, 173, 1); 
  box-shadow: 0 10px 20px rgba(0,0,0,0.3); 
  z-index: 1; 
}
.gallery-item img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.overlay { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0,0,0,0.3); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 2rem; 
  opacity: 0; 
  transition: 0.3s; 
}
.gallery-item:hover .overlay { 
  opacity: 1; 
}
.loading { 
  text-align: center; 
  font-size: 1.5rem; 
  margin-top: 50px; 
  color: #5c0017; 
  font-family: 'Georgia', serif; 
}
.lightbox { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.9); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 10000; 
  animation: fadeIn 0.3s; 
}
.lightbox-content { 
  position: relative; 
  max-width: 90%; 
  max-height: 90%; 
  text-align: center; 
}
.large-image {
   max-width: 100%; 
   max-height: 80vh; 
   border: 5px solid rgba(247, 226, 173, 0.955); 
   border-radius: 5px; 
   box-shadow: 0 0 30px rgba(255, 215, 0, 0.2); 
  }
.nav-btn { 
  background: none; 
  border: none; 
  color: rgba(247, 226, 173, 0.955); 
  font-size: 4rem; 
  cursor: pointer; 
  padding: 20px; 
  transition: 0.2s; 
  user-select: none; 
}
.nav-btn:hover { 
  color: rgb(181, 38, 38); 
  text-shadow: 0 0 10px rgb(181, 38, 38); 
}
.close-btn { 
  position: absolute; 
  top: 20px; 
  right: 30px; 
  background: none; 
  border: none; 
  color: rgba(247, 226, 173, 0.955); 
  font-size: 2.5rem;
  cursor: pointer; 
  z-index: 10001; 
}
.close-btn:hover { 
  color: #e74c3c; 
  transform: rotate(90deg); 
  transition: 0.3s; 
}
.counter { 
  color: rgba(247, 226, 173, 0.955); 
  margin-top: 10px; 
  font-family: 'Georgia', serif; 
}
@keyframes fadeIn { 
  from { opacity: 0; } to { opacity: 1; } 
}

@media (max-width: 900px) {
    .details-container { flex-direction: column; align-items: center; }
    .info-section { align-items: center; text-align: center; }
    .image-section img { width: 100%; max-width: 350px; height: auto; }
}
</style>