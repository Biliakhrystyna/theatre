import { createRouter, createWebHistory } from 'vue-router';
import ShowList from './components/ShowList.vue';
import TicketDetails from './components/TicketDetails.vue';
import Auth from './components/Auth.vue';
import UserProfile from './components/UserProfile.vue'
import ShowDetails from './components/ShowDetails.vue';

const routes = [
  { path: '/', component: ShowList },
  { path: '/tickets/:id', component: TicketDetails },
  { path: '/auth', component: Auth },
  { path: '/profile', component: UserProfile },
  { path: '/show/:id', component: ShowDetails }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;