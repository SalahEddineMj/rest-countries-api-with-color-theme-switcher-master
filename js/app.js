const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navList = document.querySelector("[data-nav-list]");
const navItems = document.querySelectorAll("[data-name]");
const navTitle = document.querySelector("[data-nav-title]");
const searchBtn = document.querySelector("[data-search-btn]");
const countriesList = document.querySelector('[data-countries-list]');
const searchField = document.querySelector('[data-search-field]');
const emptyCountriesTemplate = `
    <div class="empty-countries">
    <img src="images/empty-countries.svg" alt="no country found" class="img-cover"/>
    <h4>Country Not Found !</h4>
    </div>
  `

navTogglers.forEach((item) => {
  item.addEventListener("click", function () {
    navList.classList.toggle("active");
    navTitle.classList.toggle("active");
  });
});

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
};

const storedTheme = localStorage.getItem("theme");
const systemThemeIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme ?? (systemThemeIsDark ? "dark" : "light");
document.documentElement.setAttribute("data-theme", initialTheme);

window.addEventListener("DOMContentLoaded", function () {
  const themeBtn = this.document.querySelector("[data-theme-btn]");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});

navItems.forEach(function (item) {
  item.addEventListener("click", function () {
    fetchRegions(this.dataset.name);
  });
});


async function fetchRandomCountries() {
  let response = await fetch("/data.json");
  let data = await response.json();
  data.forEach(function(item) {
    Card(item);
  })
}
fetchRandomCountries()

async function fetchRegions(name) {
  let response = await fetch("/data.json");
  let data = await response.json();
  let result = data.filter((el) => el.region == name);
  countriesList.innerHTML = '';
  result.forEach(function(item) {
    Card(item);
  })
}



searchBtn.addEventListener("click", function () {
  let searchValue = searchField.value;
  let nameParts = searchValue.split(' ');
  let countryName = nameParts.map(function(item) {
    return item.charAt(0).toUpperCase() + item.slice(1);
  }).join(' ');
  if(countryName) {
    fetchCountries(countryName);
  }
});

async function fetchCountries(country) {
  let response = await fetch("/data.json");
  let data = await response.json();
  let result = data.filter((el) => el.name == country);
  if(result.length) {
    countriesList.innerHTML = '';
    Card(...result);
  }
  else countriesList.innerHTML = emptyCountriesTemplate;
}
const Card = function(country) {
  let { name, population, region, capital, flags: { svg }, nativeName, subregion, topLevelDomain: [tld], currencies, languages, borders } = country;
  let card = document.createElement('li');
  card.classList.add('card');
  card.innerHTML = `
      <div class="card-banner">
        <img src="${svg}" alt="${name} flag" class="img-cover" height="200">
      </div>
      <div class="card-content">
        <h2 class="card-title">${name}<h2/>
          <ul class="card-details">
            <li class="item">
              <span><b>Population:</b> ${population}</span>
            </li>
            <li class="item">
              <span><b>Region:</b> ${region}</span>
            </li>
            <li class="item">
              <span><b>Capital:</b> ${capital}</span>
            </li>
          </ul>
      </div>
    `
    const existingModal = document.querySelector('.modal');
    if(existingModal) existingModal.remove();
    countriesList.appendChild(card);
    card.addEventListener('click', function() {
      const modal = Modal( name ,svg, capital, nativeName, region, subregion, tld, currencies, languages, borders, population);
      modal.open()
    })
}

let overlay = document.createElement('div');
overlay.classList.add('modal-overlay');
const Modal = function(countryName , countryFlag, capital, nativeName, region, subRegion, tld, currencies, languages, borders, population) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  let languagesList = [];
  let [ { name } ] = currencies;
  if (languages.length) {
    for (let item of languages) {
      languagesList.push(item.name);
    }
  }
  let languagesText = languagesList.join(', ');
  modal.innerHTML = `
      <div class="container">
        <button class="back-btn" data-back-btn>
          <span class="material-symbols-outlined">arrow_back</span>
          <span class="span">Back</span>
          <div class="state-layer"></div>
        </button>
        <div class="main">
          <div class="modal-banner">
            <img src="${countryFlag}" alt="${countryName} flag" class="img-cover">
          </div>
          <div class="modal-content">
            <h2 class="details-list-title">${countryName}</h2>
            <ul class="details-list">
              <li class="item">
                <span><b>Native Name</b>: ${nativeName}</b></span>
              </li>
              <li class="item">
                <span><b>Population</b>: ${population}</b></span>
              </li>
              <li class="item">
                <span><b>Region</b>: ${region}</b></span>
              </li>
              <li class="item">
                <span><b>Sub Region</b>: ${subRegion}</b></span>
              </li>
              <li class="item">
                <span><b>Capital</b>: ${capital}</b></span>
              </li>
              <li class="item">
                <span><b>Top Level Domain</b>: ${tld}</b></span>
              </li>
              <li class="item">
                <span><b>Currencies</b>: ${name}</b></span>
              </li>
              <li class="item">
                <span><b>Languages</b>: ${languagesText}</b></span>
              </li>
            </ul>
            <div class="border-countries">
              <h3 class="border-countries-list-title">Border Countries: </h3>
              <ul class="border-countries-list" data-border-countries-list></ul>
            </div>
          </div>
        </div>
      </div>
  `
  const borderCountries = modal.querySelector('[data-border-countries-list]');
  if (borders && borders.length) {
    borders.length = 3;
    borders.forEach(function(item) {
        const liItem = document.createElement('li');
        const linkItem = document.createElement('a');
        liItem.classList.add('list-link')
        linkItem.textContent = item;
        linkItem.setAttribute('data-country', item);
        liItem.appendChild(linkItem);
        borderCountries.appendChild(liItem);
    })
  }
  const borderCountriesList = modal.querySelectorAll('[data-country]');
  borderCountriesList.forEach(function (item) {
    item.addEventListener('click', function() {
      fetchBorderCountry(this.dataset.country)
    })
  })
  const open = function() {
    document.body.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add('overflow-none')
  }
  const close = function() {
    document.body.removeChild(modal);
    document.body.removeChild(overlay);
    document.body.classList.remove('overflow-none')
  }
  const backBtn = modal.querySelector('[data-back-btn]');
  backBtn.addEventListener('click', close)
  return { open, close}
}


async function fetchBorderCountry(countryName) {
  let response = await fetch('/data.json');
  let data = await response.json();
  let result = data.filter((item) => item.alpha3Code == countryName);
  let [ { name, population, region, capital, flags: { svg }, nativeName, subregion, topLevelDomain: [tld], currencies, languages, borders } ] = result;
  let modal = Modal(name, svg, capital, nativeName, region, subregion, tld, currencies, languages, borders, population);
  const existingModal = document.querySelector('.modal');
  if(existingModal) existingModal.remove();
  modal.open();
}

// async function borderCountriesNames(border) {
//   let response = await fetch("/data.json");
//   let data = await response.json();
//   let result = data.filter((item) => item.alpha3Code == border)
//   let [ { name } ] = result;
//   return name
// }