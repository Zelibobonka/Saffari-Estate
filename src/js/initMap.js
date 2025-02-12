import { markersData } from "./mapMarkers";

let currentMarker = null;
let map = null;
let markerGroups = {};

export async function initMap() {
  await ymaps3.ready;

  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
    ymaps3;

  map = new YMap(document.querySelector(".map__map"), {
    location: {
      center: [37.559467, 55.711175],
      zoom: 15,
    },
  });

  map.addChild(new YMapDefaultSchemeLayer());
  map.addChild(new YMapDefaultFeaturesLayer());
  markerGroups = Object.fromEntries(
    Object.entries(markersData).map(([group, markers]) => [
      group,
      markers.map(({ coordinates, text }) => createMarker(coordinates, text)),
    ])
  );

  toggleGroup("all");

  document.getElementById("controls").addEventListener("click", (event) => {
    const groupName = event.target.dataset.group;
    if (groupName) {
      const tabs = document.querySelectorAll(".map__info-item");

      tabs.forEach((tab) => tab.classList.remove("active"));
      event.target.classList.add("active");
      toggleGroup(groupName);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".marker-class") &&
      !event.target.classList.contains("address")
    ) {
      const markers = document.querySelectorAll(".marker-class");
      const addressElement = document.querySelector(".address");

      markers.forEach((marker) => marker.classList.remove("active-marker"));
      addressElement.classList.remove("active");
    }
  });
}

function createMarker(coordinates, text) {
  const markerElement = document.createElement("div");

  markerElement.className = "marker-class";
  markerElement.innerHTML = text;

  const marker = new ymaps3.YMapMarker(
    { coordinates, draggable: false },
    markerElement
  );

  markerElement.addEventListener("click", async () => {
    try {
      const address = await getAddressFromCoords(coordinates);
      updateAddress(address);
    } catch (error) {
      updateAddress("Не удалось загрузить адрес");
    }
  });

  function updateAddress(address) {
    const addressElement = document.querySelector(".address");

    if (currentMarker && currentMarker !== markerElement) {
      currentMarker.classList.remove("active-marker");
    }

    addressElement.innerText = address;
    currentMarker = markerElement;
    markerElement.classList.add("active-marker");
    addressElement.classList.add("active");
  }

  return marker;
}

async function getAddressFromCoords([lat, lng]) {
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=9fb6b18c-6512-4709-9d4c-71752e58d037&format=json&lang=ru_RU&geocode=${lat},${lng}`;
  const response = await fetch(url);
  const data = await response.json();
  const address =
    data.response.GeoObjectCollection.featureMember[0]?.GeoObject
      .metaDataProperty.GeocoderMetaData.Address.formatted;

  return address || "Адрес не найден";
}

function toggleGroup(groupName) {
  if (!map || !markerGroups) return;

  Object.values(markerGroups)
    .flat()
    .forEach((marker) => map.removeChild(marker));

  if (groupName === "all") {
    Object.values(markerGroups)
      .flat()
      .forEach((marker) => map.addChild(marker));
  } else {
    markerGroups[groupName].forEach((marker) => map.addChild(marker));
    markerGroups["main"].forEach((marker) => map.addChild(marker));
  }
}
