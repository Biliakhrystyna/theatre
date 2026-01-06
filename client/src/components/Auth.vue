<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();
// true = Вхід, false = Реєстрація
const isLogin = ref(true); 
const form = ref({
  fullName: '',
  email: '',
  password: ''
});
// Функція перемикання між Входом та Реєстрацією
const toggleAuth = () => {
  isLogin.value = !isLogin.value;
  form.value = { fullName: '', email: '', password: '' }; 
};

const submitAuth = async () => {
  const url = isLogin.value 
    ? 'https://theatre-n8rc.onrender.com/auth/login' 
    : 'https://theatre-n8rc.onrender.com/auth/register';

  try {
    const response = await axios.post(url, form.value);
    
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Стилі входу та реєстрації
    if (isLogin.value) {
        await Swal.fire({
            icon: 'success',
            title: 'Вхід успішний',
            text: 'Ви увійшли в свій акаунт.',
            confirmButtonColor: '#5c0017',
            background: 'rgb(181, 38, 38)',
            color: 'rgba(247, 226, 173, 0.955)',
            timer: 1500,
            showConfirmButton: false
        });
    } else {
        await Swal.fire({
            icon: 'success',
            title: 'Реєстрація успішна',
            text: 'Акаунт створено!',
            confirmButtonText: 'Чудово',
            confirmButtonColor: '#5c0017',
            background: 'rgb(181, 38, 38)',
            color: 'rgba(247, 226, 173, 0.955)',
        });
    }

    // Перенаправлення
    const pendingTicket = localStorage.getItem('pendingTicket');
    if (pendingTicket) {
       router.push('/'); 
    } else {
       router.push('/profile');
    }

  } catch (error) {
    console.error(error);
    
    let title = 'Помилка';
    let message = 'Щось пішло не так.';
    
    if (error.response && error.response.data && error.response.data.error) {
        const serverError = error.response.data.error;
        
        if (serverError.includes('існує')) {
            title = 'Увага';
            message = 'Користувач з таким email вже існує.';
        } 
        else if (serverError.includes('пароль')) {
            title = 'Помилка входу';
            message = 'Невірний пароль.';
        }
        else if (serverError.includes('не знайдено')) {
             title = 'Помилка входу';
             message = 'Користувача не знайдено.';
        }
    }

    // Вікно помилки 
    Swal.fire({
      icon: 'warning', 
      title: title,
      text: message,
      confirmButtonColor: '#5c0017',
      background: 'rgb(181, 38, 38)',
      color: 'rgba(247, 226, 173, 0.955)'
    });
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1>{{ isLogin ? 'Вхід' : 'Реєстрація' }}</h1>
      
      <form @submit.prevent="submitAuth" class="auth-form">
        
        <div v-if="!isLogin" class="form-group">
          <label>Ім'я</label>
          <input v-model="form.fullName" type="text" placeholder="Лесь Курбас" required>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="email@example.com" required>
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input v-model="form.password" type="password" placeholder="********" required>
        </div>

        <button type="submit" class="submit-btn">
          {{ isLogin ? 'Увійти' : 'Зареєструватися' }}
        </button>
      </form>

      <p class="switch-text">
        {{ isLogin ? 'Немає акаунту?' : 'Вже є акаунт?' }}
        <span @click="toggleAuth">{{ isLogin ? 'Створити' : 'Увійти' }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  display: flex; 
  justify-content: center; 
  align-items: center;
  min-height: 80vh; 
}
.auth-card {
  background: rgb(181, 38, 38);; 
  padding: 40px; 
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(92, 0, 23, 0.2);
  width: 100%; 
  max-width: 400px; 
  text-align: center;
  border: 3px solid #5c0017; 
}

h1 {
  color: rgba(247, 226, 173, 0.955); 
  font-family: 'Century Schoolbook', serif; 
  margin-bottom: 30px;
}

.auth-form { 
  display: flex; 
  flex-direction: column; 
  gap: 20px;
  width: 100%;
}

.form-group { text-align: left; }
.form-group label {
  display: block; 
  font-weight: bold; 
  margin-bottom: 5px; 
  color: #5c0017;
  font-family: 'Georgia', serif;
}
.form-group input {
  width: 100%; 
  padding: 12px; 
  border: 1px solid #5c0017;
  border-radius: 8px; 
  font-size: 1rem; 
  background: white;
  box-sizing: border-box;
}
.form-group input:focus {
    outline: none; 
    border-color: #716728; 
    box-shadow: 0 0 5px rgba(247, 226, 173, 0.955);
}

.submit-btn {
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
  border: none;
  padding: 15px; 
  border-radius: 8px; 
  font-family: 'Georgia', serif; 
  font-size: 1.1rem;
  font-weight: bold; 
  cursor: pointer; 
  transition: 0.3s; 
  margin-top: 10px;
}
.submit-btn:hover { 
  background: rgba(247, 226, 173, 0.955); 
  color:#5c0017;
}

.switch-text { 
  margin-top: 20px; 
  font-size: 0.9rem; 
  color: #5c0017; 
}
.switch-text span {
  font-weight: bold; 
  cursor: pointer; 
  text-decoration: underline; 
  margin-left: 5px;
}
.switch-text span:hover { color: rgba(247, 226, 173, 0.955); }
</style>