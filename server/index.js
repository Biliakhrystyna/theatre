require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Show = require('./models/Show'); 
const User = require('./models/User');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Підключення до БД
mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/theater_db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB Error:', err));
// Функція генерує дати і час
function createSchedule(datesArray) {
  return datesArray.map(dateString => ({
    date: dateString,               
    occupied: generateRandomOccupied() // Місця генеруються автоматично
  }));
}

function generateRandomOccupied() {
  const occupied = [];
  const totalSeats = Math.floor(Math.random() * 15) + 5; 
  for (let i = 0; i < totalSeats; i++) {
    const row = Math.floor(Math.random() * 8) + 1;  
    const seat = Math.floor(Math.random() * 10) + 1; 
    occupied.push(`${row}-${seat}`);
  }
  return occupied;
}

// 1. Всі вистави
app.get('/api/shows', async (req, res) => {
  try {
    const shows = await Show.find(); 
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Наповнення вистав
app.get('/seed', async (req, res) => {
  try {
    await Show.deleteMany({});
    
    const createdShows = await Show.insertMany([
      {
        title: "Гамлет",
        description: "Вистава «Гамлет» – це вічна трагедія про датського принца, який шукає помсти за вбивство батька, стикаючись із зрадою, коханням та філософськими роздумами про життя, смерть і справедливість.Трагедія щоразу переосмислюється режисерами як відображення сучасних проблем, від політики до екзистенційних питань.",
        genre: "Трагедія",
        image: "/Hamlet.jpg",
        basePrice: 300,
        gallery: ["/hamlet1.jpg", "/hamlet2.jpg", "/hamlet3.jpg", "/hamlet4.jpg"],
        schedule:createSchedule([
            "5 січня, 19:00", 
            "12 січня, 18:00", 
            "19 січня, 19:30", 
            "26 січня, 17:00"  
        ])
      },
      {
        title: "Привид Опери",
        description: "«Привид Опери» — це культовий мюзикл Ендрю Ллойда Веббера за романом Ґастона Леру. Мюзкл є розповіддю про таємничого, спотвореного генія музики, який ховається в підземеллях Паризької Опери та стає одержимим молодою співачкою Крістін Даае, перетворюючи її життя на історію кохання, жаху та трагічних пристрастей, де музика, маска та одержимість ведуть до катастрофи.",
        genre: "Мюзикл",
        basePrice: 250,
        image: "/ThePhantomOpera.jpg",
        gallery: ["/ThePhantomOpera1.jpg", "/ThePhantomOpera2.jpg", "/ThePhantomOpera3.jpg", "/ThePhantomOpera4.jpg"],
        schedule: createSchedule([
            "3 січня, 18:00", 
            "16 січня, 18:30",
            "22 січня, 19:00"
        ])
      },
      {
        title: "Лускунчик",
        description: "Вистава «Лускунчик» — це чарівна різдвяна казка про дівчинку Марі, яка отримує на Різдво ляльку-Лускунчика. Він оживає вночі, щоб боротися з Мишачим королем, перетворюється на принца і запрошує Марі до лялькового королівства, де панують добро та дива.",
        genre: "Балет",
        basePrice: 400,
        image: "/TheNutcracker.jpg",
        gallery: ["/TheNutcracker1.png", "/TheNutcracker2.png", "/TheNutcracker3.png"],
        schedule: createSchedule([
            "2 січня, 12:00",
            "10 січня, 17:00",
            "17 січня, 16:00",
            "30 січня, 19:00"
        ])
      },
      {
        title: "Ромео і Джульєтта",
        description: "Трагічна історія кохання двох молодих людей із ворогуючих родин — Монтеккі та Капулетті. Щире почуття Ромео і Джульєтти протистоїть ненависті, соціальним заборонам і фатальним обставинам. П’єса порушує теми кохання, долі, конфлікту поколінь і руйнівної сили ворожнечі.",
        genre: "Трагедія",
        image: "/Romeo.jpg",
        basePrice: 300,
        gallery: ["/Romeo1.jpg", "/Romeo2.jpg", "/Romeo3.jpg", "/Romeo4.jpg"],
        schedule: createSchedule([
            "5 січня, 18:00",
            "12 січня, 17:00",
            "21 січня, 20:00", 
        ])
      },
      {
        title: "Лебедине Озеро",
        description: "Класичний балет про принца Зігфріда та принцесу Одетту, яку злий чаклун перетворив на лебедя. Вистава поєднує романтику, драму й протиставлення добра і зла. Символіка білого та чорного лебедя підкреслює боротьбу чистоти й обману.",
        genre: "Балет",
        image: "/SwanLake.jpg",
        basePrice: 300,
        gallery: ["/SwanLake1.jpg", "/SwanLake2.jpg", "/SwanLake3.jpg", "/SwanLake4.jpg"],
        schedule:  createSchedule([
            "1 січня, 18:00",
            "14 січня, 17:00",
            "27 січня, 19:00", 
        ])
      },
      {
        title: "Наталка Полтавка",
        description: "Українська класична п’єса про щире кохання Наталки і Петра, яке проходить випробування розлукою та соціальною нерівністю. Твір оспівує народну мораль, чесність, працелюбність і вірність почуттям, поєднуючи драму з гумором і піснями.",
        genre: "Комедія",
        image: "/Natalka.jpg",
        basePrice: 200,
        gallery: ["/Natalka1.jpg", "/Natalka2.jpg", "/Natalka3.jpg", "/Natalka4.jpg"],
        schedule:  createSchedule([
            "7 січня, 18:00",
            "24 січня, 17:00",
            "26 січня, 18:00",
        ])
      },
      {
        title: "Лісова Пісня",
        description: "Поетична драма-феєрія про кохання лісової мавки Мавки та людини Лукаша. Вистава протиставляє світ природи й духовної свободи світу буденності та матеріальних цінностей. Основні теми — мистецтво, жертва, кохання і зрада власній душі.",
        genre: "Драма",
        image: "/Mavka.jpg",
        basePrice: 200,
        gallery: ["/Mavka1.jpg", "/Mavka2.jpg", "/Mavka3.jpg", "/Mavka4.jpg"],
        schedule:  createSchedule([
            "2 січня, 18:00",
            "16 січня, 18:00",
            "29 січня, 17:00",
        ])
      },
      {
        title: "Кармен",
        description: "Опера про вільну й пристрасну жінку Кармен, яка живе за власними правилами. Її стосунки з солдатом Хозе переростають у трагедію через ревнощі та неможливість володіти свободою іншої людини. Твір досліджує теми кохання, пристрасті та фатальності.",
        genre: "Опера",
        image: "/Carmen.jpg",
        basePrice: 300,
        gallery: ["/Carmen1.jpg", "/Carmen2.jpg", "/Carmen3.jpg", "/Carmen4.jpg"],
        schedule:  createSchedule([
            "17 січня, 18:00",
            "28 січня, 17:00",
        ])
      },
      {
        title: "Кайдашева Сім'я",
        description: "Соціально-побутова драма про конфлікти в селянській родині Кайдашів. Побутові сварки переростають у глибокий конфлікт характерів і поколінь. Вистава з гумором і сатирою показує руйнівну силу дріб’язковості та егоїзму.",
        genre: "Комедія",
        image: "/Kaidash.png",
        basePrice: 200,
        gallery: ["/Kaidash1.jpg", "/Kaidash2.png", "/Kaidash3.jpg", "/Kaidash4.png"],
        schedule:  createSchedule([
            "4 січня, 18:00",
            "18 січня, 18:00",
            "24 січня, 17:00",
        ])
      },
      {
        title: "Тоска",
        description: "Оперна драма на тлі політичних подій у Римі. Співачка Тоска та художник Каварадоссі стають жертвами жорстокої влади та зради. Вистава поєднує кохання, ревнощі, страх і трагічний вибір між честю та життям.",
        genre: "Опера",
        image: "/Tosca.jpg",
        basePrice: 200,
        gallery: ["/Tosca1.jpg", "/Tosca2.jpg", "/Tosca3.jpg", "/Tosca4.jpg"],
        schedule: createSchedule([
            "1 січня, 20:00",
            "11 січня, 18:00",
            "29 січня, 17:00",
        ])
      },
      {
        title: "Мулен Руж",
        description: "Романтична історія кохання між поетом Крістіаном і танцівницею Сатін у богемному Парижі кінця XIX століття. Яскраве шоу поєднує музику, пристрасть і трагедію, розкриваючи тему мистецтва, свободи й ціни слави.",
        genre: "Мюзикл",
        image: "/moulinerouge.jpg",
        basePrice: 400,
        gallery: ["/Moluin1.jpg", "/Moulin2.jpg"],
        schedule: createSchedule([
            "2 січня, 20:00",
            "12 січня, 20:00",
            "22 січня, 20:00",
        ])
      },
      {
        title: "Ніч Перед Різдвом",
        description: "Фольклорна вистава з елементами фантастики, гумору й різдвяної магії. Коваль Вакула заради кохання до Оксани долає чортівські підступи та вирушає до самої цариці. Твір оспівує любов, віру, народні традиції та силу людської душі.",
        genre: "Комедія",
        image: "/Night.png",
        basePrice: 400,
        gallery: ["/Night1.jpg", "/Night2.jpg", "/Night3.jpg"],
        schedule: createSchedule([
            "5 січня, 18:00",
            "15 січня, 18:00",
            "30 січня, 17:00",
        ])
      }
    ]);
    res.json({ message: 'Базу успішно наповнено!', data: createdShows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Одна вистава
app.get('/api/shows/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ error: 'Виставу не знайдено' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Реєстрація
app.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Користувач вже існує' });
    const newUser = new User({ fullName, email, password });
    await newUser.save();
    res.json({ message: 'Реєстрація успішна!', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Помилка реєстрації' });
  }
});

// Вхід
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    if (user.password !== password) return res.status(400).json({ error: 'Невірний пароль' });
    res.json({ message: 'Вхід успішний!', user });
  } catch (err) {
    res.status(500).json({ error: 'Помилка входу' });
  }
});

// Купівля
app.post('/api/user/buy', async (req, res) => {
  try {
    console.log('Запит на купівлю:', req.body);
    const { email, ticket, showId, date, seatsToBlock } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Юзера нема' });

    user.tickets.push(ticket);
    await user.save();

    if (showId && date && seatsToBlock) {
        await Show.updateOne(
          { _id: showId, "schedule.date": date }, 
          { $addToSet: { "schedule.$.occupied": { $each: seatsToBlock } } } 
        );
    }

    res.json({ message: 'Куплено!', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});