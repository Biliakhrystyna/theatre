<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'; 

const router = useRouter();
const route = useRoute(); 
const user = ref(null);

//перевірка статусу
const checkUserStatus = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      user.value = JSON.parse(userData);
    } catch (e) {
      console.error('Помилка читання даних користувача', e);
      user.value = null;
    }
  } else {
    user.value = null;
  }
};

onMounted(() => {
  checkUserStatus();
  window.addEventListener('storage', checkUserStatus); 
});

watch(() => route.fullPath, () => {
  checkUserStatus();
});

const logout = () => {
  localStorage.removeItem('user');
  user.value = null;
  router.push('/');
  setTimeout(() => window.location.reload(), 100); 
};
</script>

<template>
  <header class="header">
    <div class="logo"> Театр </div>
    <nav class="nav">
      <router-link to="/" class="nav-link">Афіша</router-link>
      
      <div v-if="user" class="user-menu">
        <router-link to="/profile" class="username">
         Особистий кабінет
        </router-link>
        <button @click="logout" class="logout-btn">Вийти</button>
      </div>

      <router-link v-else to="/auth" class="nav-link login-btn">
        Увійти
      </router-link>
    </nav>
  </header>
</template>

<style scoped>
.header {
  background-color:rgb(181, 38, 38);
  color: rgba(247, 226, 173, 0.955);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  font-family:'Georgia',serif ;
  justify-content: flex-end;
  position: relative;
  z-index: 100;
}
.logo {
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.nav-link {
  color: rgba(247, 226, 173, 0.955);
  font-weight: bold;
  text-decoration: none;
  margin-left: 20px;
  font-family:'Georgia',serif;
  font-size: 1.1rem;
  transition: color 0.3s;
  letter-spacing: 1px;
}
.nav-link:hover {
  text-decoration: underline; 
  color: rgba(247, 226, 173, 0.955);
}
.login-btn {
  border: 1px solid rgba(247, 226, 173, 0.955);
  padding: 5px 15px;
  border-radius: 4px;
}
.login-btn:hover{
  background: rgba(247, 226, 173, 0.955);
  color: #5c0017;
  border: 1px solid rgba(247, 226, 173, 0.955);
}
.user-menu {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.username {
  font-weight: bold;
  color:rgba(247, 226, 173, 0.955);
  text-decoration: none; 
  cursor: pointer;
}
.username:hover {
  text-decoration: underline;
}
.logout-btn {
  background: transparent;
  border: 1px solid rgba(247, 226, 173, 0.955);
  color: rgba(247, 226, 173, 0.955);
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}
.logout-btn:hover {
  background: rgba(247, 226, 173, 0.955);
  color: #5c0017;
  border: 1px solid rgba(247, 226, 173, 0.955);
  text-decoration: underline; 
}
@media (max-width: 900px) {
  .header {
    flex-direction: column; 
    justify-content: center;
    padding: 20px;
    height: auto;
  }
  .logo {
    position: static; 
    transform: none;  
    margin-bottom: 15px; 
  }
  .nav {
    width: 100%;
    justify-content: center; 
    flex-wrap: wrap; 
    gap: 10px;
  }
  .nav-link, .user-menu {
    margin-left: 10px;
    margin-right: 10px;
  }
}
</style>