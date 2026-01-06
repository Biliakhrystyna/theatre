<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const props = defineProps(['isOpen', 'totalPrice']);
const emit = defineEmits(['close', 'confirm']);
const paymentMethod = ref('new'); 
const selectedCard = ref('');
const saveCardInfo = ref(false); 
const router = useRouter();
const savedCards = ref(JSON.parse(localStorage.getItem('userCards')) ||[
  { id: 1, number: '4242 4242 4242 4242', type: 'Visa' },
  { id: 2, number: '5555 5555 5555 4444', type: 'MasterCard' }
]);
const newCard = ref({
  number: '',
  expiry: '',
  cvv: '',
  holder: ''
});

// --- 1.Номер карти
const formatCardNumber = () => {
  let val = newCard.value.number.replace(/\D/g, '');
  val = val.substring(0, 16);
  val = val.replace(/(\d{4})(?=\d)/g, '$1 '); 
  newCard.value.number = val;
};

// --- 2. Термін карти
const formatExpiry = () => {
  let val = newCard.value.expiry.replace(/\D/g, '');
  //Перевірка на введення місяця терміну
  // Якщо перша цифра > 1(нехай 5), то це точно має бути 05, бо місяця 50 нема.
  if (val.length === 1 && parseInt(val) > 1) {
    val = '0' + val;
  }
  //Перевірка цифр місяця
  if (val.length >= 2) {
    let month = parseInt(val.substring(0, 2));
    if (month > 12) month = 12;
    if (month === 0) month = 1;

    // якщо місяць став одноцифровим, то 0
    let monthStr = month.toString().padStart(2, '0');
    val = monthStr + val.substring(2);
  }
  // Обмежити довжину (4 цифри: MMYY)
  val = val.substring(0, 4);
  if (val.length >= 2) {
    val = val.substring(0, 2) + '/' + val.substring(2);
  }

  newCard.value.expiry = val;
};
// --- 3. ВАЛІДАЦІЯ CVV ---
const formatCVV = () => {
  newCard.value.cvv = newCard.value.cvv.replace(/\D/g, '').substring(0, 3);
};

// --- ВИДАЛЕННЯ КАРТКИ ---
const deleteCard = (id) => {
  Swal.fire({
    title: 'Видалити картку?',
    text: "Ви більше не зможете використати її.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#5c0017',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Так, видалити',
    cancelButtonText: 'Скасувати',
    background: 'rgb(181, 38, 38)',
    color: 'rgba(247, 226, 173, 0.955)',
    target: '.modal-window', 
    customClass: { container: 'swal-top-layer' } 
  }).then((result) => {
    if (result.isConfirmed) {
      savedCards.value = savedCards.value.filter(c => c.id !== id);
      localStorage.setItem('userCards', JSON.stringify(savedCards.value));
      if (selectedCard.value === id) selectedCard.value = '';
      Swal.fire({ 
        title: 'Видалено!', 
        icon: 'success', 
        target: '.modal-window', 
        confirmButtonColor: '#5c0017',
        background: 'rgb(181, 38, 38)',
        color: 'rgba(247, 226, 173, 0.955)',
        timer: 1000, 
        showConfirmButton: false });
    }
  });
};

const handlePayment = async () => {
  if (paymentMethod.value === 'new') {
    // Валідація довжини
    if (newCard.value.number.length < 16 || newCard.value.expiry.length < 5 || newCard.value.cvv.length < 3) {
      Swal.fire({ 
        icon: 'error', title: 'Помилка', 
        text: 'Перевірте правильність даних', 
        confirmButtonColor: '#5c0017',
        background: 'rgb(181, 38, 38)',
        color: 'rgba(247, 226, 173, 0.955)',
        target: '.modal-window'
      });
      return;
    }

    if (saveCardInfo.value) {
      const isCardExists = savedCards.value.some(card => card.number === newCard.value.number);
      if (!isCardExists) {
        const newCardObj = {
          id: Date.now(),
          number: newCard.value.number,
          type: 'Нова картка' 
        };
      savedCards.value.push(newCardObj);
      localStorage.setItem('userCards', JSON.stringify(savedCards.value));
    }
    }

  } else {
    if (!selectedCard.value) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'Увага', 
        text: 'Оберіть збережену картку!', 
        confirmButtonColor: '#5c0017',
        background: 'rgb(181, 38, 38)',
        color: 'rgba(247, 226, 173, 0.955)',
        target: '.modal-window'
      });
      return;
    }
  }
  emit('confirm');
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-window">
      <h2>Оплата замовлення</h2>
      <p class="amount">До сплати: <strong>{{ totalPrice }} грн</strong></p>

      <div class="tabs">
        <button 
          @click="paymentMethod = 'saved'" 
          :class="{ active: paymentMethod === 'saved' }"
        >Збережена картка</button>
        <button 
          @click="paymentMethod = 'new'" 
          :class="{ active: paymentMethod === 'new' }"
        >Нова картка</button>
      </div>

      <div v-if="paymentMethod === 'saved'" class="payment-body">
        <div v-if="savedCards.length > 0">
            <div v-for="card in savedCards" :key="card.id" class="card-row">
              <label class="card-option">
                <input type="radio" :value="card.id" v-model="selectedCard">
                <span class="card-info">
                  <span class="card-icon"></span>
                  {{ card.number }}
                </span>
              </label>
              <button @click.stop="deleteCard(card.id)" class="delete-card-btn" title="Видалити">✕</button>
            </div>
        </div>
        <p v-else class="no-cards">Немає збережених карток</p>
      </div>

      <div v-else class="payment-body">
        <div class="input-group">
          <label>Номер картки</label>
          <input 
            v-model="newCard.number" 
            @input="formatCardNumber"
            type="text" 
            placeholder="0000 0000 0000 0000" 
            maxlength="19"
          >
        </div>
        <div class="row">
          <div class="input-group">
            <label>Термін дії</label>
            <input 
                v-model="newCard.expiry" 
                @input="formatExpiry"
                type="text" 
                placeholder="MM/YY" 
                maxlength="5"
            >
          </div>
          <div class="input-group">
            <label>CVV</label>
            <input 
                v-model="newCard.cvv" 
                @input="formatCVV"
                type="password" 
                placeholder="123" 
                maxlength="3"
            >
          </div>
        </div>
        <div class="input-group">
          <label>Власник картки</label>
          <input v-model="newCard.holder" type="text" placeholder="LES KURBAS">
        </div>

        <label class="save-checkbox">
            <input type="checkbox" v-model="saveCardInfo">
            <span>Зберегти цю картку</span>
        </label>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="cancel-btn">Скасувати</button>
        <button @click="handlePayment" class="pay-btn">ОПЛАТИТИ</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  background: rgba(0, 0, 0, 0.7); 
  backdrop-filter: blur(3px);
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000; 
}
.modal-window {
  background: rgb(181, 38, 38);
  border: 4px solid #5c0017;
  border-radius: 15px; 
  padding: 30px; 
  width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  font-family: 'Georgia', serif; 
  color: rgba(247, 226, 173, 0.955);
  position: relative;
}
h2 { 
  text-align: center; 
  margin-bottom: 10px; 
  font-family: 'Century Schoolbook', serif; 
}
.amount { 
  text-align: center; 
  font-size: 1.2rem; 
  margin-bottom: 20px; 
  border-bottom: 1px dashed #5c0017; 
  padding-bottom: 15px; 
}
.tabs { 
  display: flex; 
  margin-bottom: 20px; 
  border-bottom: 2px solid #5c0017; 
}
.tabs button {
  flex: 1; 
  padding: 10px; 
  background: none; 
  border: none;
  font-family: 'Georgia', serif; 
  font-weight: bold; 
  color: rgba(247, 226, 173, 0.955);
  cursor: pointer; 
  transition: 0.3s;
}
.tabs button.active { 
  opacity: 1; 
  background: rgba(247, 226, 173, 0.955); 
  color: #5c0017; 
  border:2px solid #5c0017; 
}
.payment-body { margin-bottom: 25px; }
.input-group { margin-bottom: 15px; }
.input-group label { 
  display: block; 
  font-size: 0.9rem; 
  font-weight: bold; 
  margin-bottom: 5px; 
}
.input-group input {
  width: 100%; 
  padding: 10px; 
  border: 1px solid #bb2349;
  background: white; 
  border-radius: 5px; 
  font-size: 1rem;
}
.row { 
  display: flex; 
  gap: 10px; 
}
.card-row { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  margin-bottom: 10px; 
}
.card-option {
  flex: 1; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 10px;
  border: 1px solid #ddd; 
  border-radius: 5px; 
  cursor: pointer; 
  background: white;
  color:#5c0017;
}
.card-option:hover { background: rgba(92, 0, 23, 0.1); }
.delete-card-btn {
    background: none; 
    border: none; 
    color: rgba(247, 226, 173, 0.955); 
    font-weight: bold; 
    font-size: 1.2rem;
    cursor: pointer; 
    padding: 0 5px; 
    opacity: 0.7;
}
.delete-card-btn:hover { 
  opacity: 1; 
  transform: scale(1.1); 
}
.save-checkbox {
    display: flex; 
    align-items: center; 
    gap: 10px; 
    font-size: 0.9rem;
    cursor: pointer; 
    margin-top: 10px; 
    font-style: italic;
}
.save-checkbox input { width: auto; }
.no-cards { 
  text-align: center; 
  color:rgba(247, 226, 173, 0.955);
  font-style: italic; 
  padding: 20px; 
}
.modal-actions { 
  display: flex; 
  justify-content: space-between; 
  gap: 15px; 
}
.pay-btn {
  flex: 1; 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955); 
  border: none;
  padding: 12px; 
  font-weight: bold; 
  font-size: 1.1rem; 
  border-radius: 5px; 
  cursor: pointer;
}
.pay-btn:hover { 
  background: rgba(247, 226, 173, 0.955); 
  color:#5c0017;
  border-bottom: 2px solid #5c0017; 
}
.cancel-btn {
  background: rgba(247, 226, 173, 0.955); 
  border: 1px solid #5c0017; 
  color: #5c0017;
  padding: 12px; 
  border-radius: 5px; 
  cursor: pointer; 
  font-weight: bold;
}
.cancel-btn:hover { 
  background:#5c0017;
  color: rgba(247, 226, 173, 0.955);
 }
.swal2-container { z-index: 20000 !important; }
</style>

