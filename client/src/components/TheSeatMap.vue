<script setup>
import { ref, defineEmits, defineProps, watch, onMounted } from 'vue';
//Місця і ціна
const props = defineProps(['occupied', 'basePrice']);
//Зміна вибору
const emit = defineEmits(['update:selected']);
//Структура залу
const rows = ref([]);
//Ціна залежно від номера ряду
const getSeatPrice = (row) => {
    const base = props.basePrice || 200;
    if (row <= 2) return base + 100;
    return base;
};

const generateHall = () => {
  rows.value = [];
  const takenSeats = props.occupied || []; 
  for (let i = 1; i <= 5; i++) {
    const seats = [];
    for (let j = 1; j <= 8; j++) {
      const seatId = `${i}-${j}`;
      const isTaken = takenSeats.includes(seatId);
      seats.push({
        id: seatId,
        row: i,
        number: j,
        price: getSeatPrice(i), 
        status: isTaken ? 'taken' : 'free'
      });
    }
    rows.value.push(seats);
  }
};
//Зміна станів місць
watch(() => props.occupied, generateHall, { deep: true });
watch(() => props.basePrice, generateHall);

onMounted(() => {
  generateHall();
});
const toggleSeat = (seat) => {
  if (seat.status === 'taken') return;
  seat.status = seat.status === 'selected' ? 'free' : 'selected';
  const selectedSeats = rows.value.flat().filter(s => s.status === 'selected');
  emit('update:selected', selectedSeats);
};
</script>

<template>
  <div class="hall-container">
    <div class="screen">СЦЕНА</div>

    <div class="rows">
      <div v-for="(row, rIndex) in rows" :key="rIndex" class="row">
        <div class="row-number">Ряд {{ rIndex + 1 }}</div>
        <div class="seats">
          <div 
            v-for="seat in row" 
            :key="seat.id"
            class="seat"
            :class="seat.status"
            @click="toggleSeat(seat)"
            :title="seat.status === 'taken' ? 'Зайнято' : `Ряд ${seat.row}, Місце ${seat.number}\nЦіна: ${seat.price} грн`"
          >
            {{ seat.number }}
          </div>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item"><span class="seat free"></span> Вільне</div>
      <div class="legend-item"><span class="seat selected"></span> Обране</div>
      <div class="legend-item"><span class="seat taken"></span> Зайняте</div>
    </div>
  </div>
</template>

<style scoped>
.hall-container { 
  background: #f3f3f3; 
  padding: 30px; 
  border-radius: 10px; 
  text-align: center; 
  margin-top: 20px; 
  border: 1px solid #ccc; 
}
.screen { 
  background: #5c0017; 
  color: rgba(247, 226, 173, 0.955);
  font-family:'Georgia',serif ;
  width: 80%; 
  margin: 0 auto 30px; 
  padding: 10px; 
  border-radius: 0 0 50px 50px; 
  letter-spacing: 5px; 
  font-weight: bold; 
  box-shadow: 0 10px 10px rgba(0,0,0,0.2); 
}
.row { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  margin-bottom: 10px; 
}
.row-number { 
  width: 60px; 
  font-weight: bold; 
  color: #5c0017; 
  text-align: right; 
  margin-right: 15px; 
}
.seats { 
  display: flex; 
  gap: 8px; 
}
.seat { 
  width: 35px; 
  height: 35px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  font-size: 0.8rem; 
  cursor: pointer; 
  transition: all 0.2s; 
  user-select: none; 
}
.seat.free { 
  background-color: white; 
  border: 1px solid #ccc; 
  color: #333; 
  font-family:'Georgia',serif ;
}
.seat.free:hover { 
  background-color: rgba(247, 226, 173, 0.5); 
  border-color: #5c0017; 
  transform: scale(1.1); 
}
.seat.selected { 
  background-color: rgba(247, 226, 173, 1); 
  border: 2px solid #5c0017; 
  color: #5c0017; 
  font-weight: bold; 
  transform: scale(1.1); 
  box-shadow: 0 0 10px rgba(92, 0, 23, 0.3); 
}
.seat.taken { 
  background-color: #5c0017; 
  color: rgba(247, 226, 173, 1); 
  border-color: #5c0017; 
  cursor: not-allowed; 
  opacity: 0.6; 
}
.legend { 
  display: flex; 
  justify-content: center; 
  gap: 20px; 
  margin-top: 30px; 
  padding-top: 20px; 
  border-top: 1px solid #6a1d1d; 
}
.legend-item { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 0.9rem; 
}
.legend-item .seat { 
  width: 20px; 
  height: 20px; 
  cursor: default; 
  }
</style>