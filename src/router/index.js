import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import store from "../store";
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/game",
    name: "Game",
    component: () => import(/* webpackChunkName: "game" */ "../views/Game.vue"),
    meta: { private: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () =>
      import(/* webpackChunkName: "game" */ "../views/ADMIN.vue"),
    meta: { adminkey: true },
  },
  {
    path: "/battle",
    name: "Battle",
    component: () =>
      import(/* webpackChunkName: "game" */ "../views/Battle.vue"),
    meta: { private: true, onbattle: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
router.beforeEach((to, from, next) => {
  const privateRoute = to.matched.some((item) => item.meta.private);
  const adminKey = to.matched.some((item) => item.meta.adminkey);
  const onbattle = to.matched.some((item) => item.meta.onbattle);

  if (adminKey || onbattle) {
    store.dispatch("getUserID").then(() => {
      store.dispatch("getDataUser").then(() => {
        if (adminKey) {
          if (store.state.DATA_USER?.privileges == "admin") next();
          else next("/");
        } else if (onbattle) {
          if (store.state.DATA_USER?.data?.onbattle) next();
          else next("/game");
        }
      });
    });
  } else {
    if (privateRoute && !store.state.token) next("/");
    else next();
  }
});

export default router;
