import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export const initSlider = () => {
  const slider = new Swiper(".swiper", {
    modules: [Navigation],
    slidesPerView: "auto",
    spaceBetween: 30,
    navigation: {
      nextEl: ".navigation-button-next",
      prevEl: ".navigation-button-prev",
    },
    breakpoints: {
      1440: {
        spaceBetween: 100,
      },
      768: {
        spaceBetween: 40,
      },
    },
  });

  return [slider];
};
