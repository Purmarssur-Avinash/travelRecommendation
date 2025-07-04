// Global data store
let travelData = null;

// Timezone mapping per country
const countryTimeZones = {
  "Australia": "Australia/Sydney",
  "Japan": "Asia/Tokyo",
  "Brazil": "America/Sao_Paulo",
  // Add more as needed
};

// === Utility Functions ===

// Normalize common plural keywords
function normalizeKeyword(keyword) {
  return keyword
    .replace(/beaches|beach/i, 'beach')
    .replace(/temples|temple/i, 'temple');
}

// Format local time string
function getLocalTimeString(timeZone) {
  const options = {
    timeZone: timeZone,
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  return new Date().toLocaleTimeString('en-US', options);
}

// Update time for a country heading
function updateCountryTime(countryName, element) {
  const timeZone = countryTimeZones[countryName];
  if (!timeZone) {
    element.textContent = countryName;
    return;
  }

  const localTime = getLocalTimeString(timeZone);
  element.textContent = `${countryName} — Local Time: ${localTime}`;
}

// === Core Functions ===

// Load data from JSON and display all by default
async function loadTravelRecommendations() {
  const container = document.getElementById('recommendations');
  container.innerHTML = '<p>Loading travel recommendations...</p>';

  try {
    const response = await fetch('travel_recommendation_api.json');
    if (!response.ok) throw new Error('Failed to load data');
    travelData = await response.json();
    renderAllRecommendations();
  } catch (error) {
    console.error('Error loading travel data:', error);
    container.innerHTML = '<p>Error loading travel data. Please try again later.</p>';
  }
}

// Render all recommendations (default view)
function renderAllRecommendations() {
  if (!travelData) return;
  displayRecommendations(travelData);
}

// Handle search input and filter data
function search() {
  const input = document.getElementById('searchInput').value.trim().toLowerCase();

  if (!input) {
    alert('Please enter a destination or keyword to search.');
    return;
  }

  if (!travelData) {
    alert('Travel data not loaded yet. Please wait.');
    return;
  }

  const normalizedInput = normalizeKeyword(input);

  const matched = {
    countries: [],
    temples: [],
    beaches: []
  };

  // Match countries and cities
  travelData.countries.forEach(country => {
    const matchCountry = country.name.toLowerCase().includes(normalizedInput);
    const matchedCities = country.cities.filter(city =>
      city.name.toLowerCase().includes(normalizedInput) ||
      city.description.toLowerCase().includes(normalizedInput)
    );

    if (matchCountry || matchedCities.length > 0) {
      matched.countries.push({
        name: country.name,
        cities: matchedCities.length > 0 ? matchedCities : country.cities
      });
    }
  });

  // Match temples
  matched.temples = travelData.temples.filter(temple =>
    temple.name.toLowerCase().includes(normalizedInput) ||
    normalizedInput === 'temple'
  );

  // Match beaches
  matched.beaches = travelData.beaches.filter(beach =>
    beach.name.toLowerCase().includes(normalizedInput) ||
    normalizedInput === 'beach'
  );

  displayRecommendations(matched);
}

// Reset search input and display all
function resetSearch() {
  document.getElementById('searchInput').value = '';
  renderAllRecommendations();
}

// Clear everything from the DOM
function clearResults() {
  document.getElementById('recommendations').innerHTML = '';
  document.getElementById('searchInput').value = '';
}

// Render all recommendations (countries, cities, temples, beaches)
function displayRecommendations(data) {
  const container = document.getElementById('recommendations');
  container.innerHTML = '';

  // === Countries and Cities ===
  data.countries.forEach(country => {
    const countryDiv = document.createElement('div');
    countryDiv.classList.add('country');

    const countryName = document.createElement('h2');
    countryName.id = `time-${country.name.replace(/\s+/g, '-')}`;
    updateCountryTime(country.name, countryName);

    const timeZone = countryTimeZones[country.name];
    if (timeZone) {
      setInterval(() => updateCountryTime(country.name, countryName), 1000);
    }

    countryDiv.appendChild(countryName);

    country.cities.forEach(city => {
        const cityDiv = document.createElement('div');
        cityDiv.classList.add('city');

        // Create a container for text content
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('city-content');

        const cityName = document.createElement('h3');
        cityName.textContent = city.name;

        const cityDesc = document.createElement('p');
        cityDesc.textContent = city.description;

        contentDiv.appendChild(cityName);
        contentDiv.appendChild(cityDesc);

        cityDiv.appendChild(contentDiv);

        if (city.imageUrl) {
          const img = document.createElement('img');
          img.src = 'images/' + city.imageUrl; // Adjust path as needed
          img.alt = city.name;
          cityDiv.appendChild(img);
        }

        const visitButton = document.createElement('a');
        visitButton.textContent = 'Visit';
        visitButton.href = '#'; // Link to booking page or detail section
        visitButton.className = 'visit-btn';

        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('button-wrapper');
        buttonWrapper.appendChild(visitButton);

        cityDiv.appendChild(buttonWrapper);
        countryDiv.appendChild(cityDiv);

    });

    container.appendChild(countryDiv);
  });

  // === Temples ===
data.temples.forEach(temple => {
  const templeDiv = document.createElement('div');
  templeDiv.classList.add('temple');

  // Create content wrapper
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('city-content');

  const templeName = document.createElement('h3');
  templeName.textContent = temple.name;

  const templeDesc = document.createElement('p');
  templeDesc.textContent = temple.description;

  contentDiv.appendChild(templeName);
  contentDiv.appendChild(templeDesc);

  templeDiv.appendChild(contentDiv);

  // Add image if available
  if (temple.imageUrl) {
    const img = document.createElement('img');
    img.src = 'images/' + temple.imageUrl;
    img.alt = temple.name;
    templeDiv.appendChild(img);
  }

  // Visit button
  const visitButton = document.createElement('a');
  visitButton.textContent = 'Visit';
  visitButton.href = '#';
  visitButton.className = 'visit-btn';

  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('button-wrapper');
  buttonWrapper.appendChild(visitButton);

  templeDiv.appendChild(buttonWrapper);
  container.appendChild(templeDiv);
});



  // === Beaches ===
 data.beaches.forEach(beach => {
  const beachDiv = document.createElement('div');
  beachDiv.classList.add('beach');

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('city-content');

  const beachName = document.createElement('h3');
  beachName.textContent = beach.name;

  const beachDesc = document.createElement('p');
  beachDesc.textContent = beach.description;

  contentDiv.appendChild(beachName);
  contentDiv.appendChild(beachDesc);

  beachDiv.appendChild(contentDiv);

  if (beach.imageUrl) {
    const img = document.createElement('img');
    img.src = 'images/' + beach.imageUrl;
    img.alt = beach.name;
    beachDiv.appendChild(img);
  }

  const visitButton = document.createElement('a');
  visitButton.textContent = 'Visit';
  visitButton.href = '#';
  visitButton.className = 'visit-btn';

  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('button-wrapper');
  buttonWrapper.appendChild(visitButton);

  beachDiv.appendChild(buttonWrapper);
  container.appendChild(beachDiv);
});

      }

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadTravelRecommendations();

  // Enable Enter key to trigger search
  document.getElementById('searchInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      search();
    }
  });
});
