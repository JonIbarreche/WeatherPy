document.addEventListener('DOMContentLoaded', function() {
    const weatherForm = document.getElementById('weather-form');
    const weatherResult = document.getElementById('weather-result');
    const errorMessage = document.getElementById('error-message');
    const forecastSection = document.getElementById('forecast-section');
    const loadCitiesBtn = document.getElementById('load-cities');
    
    // Result elements
    const cityResult = document.getElementById('city-result');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherDescription = document.getElementById('weather-description');
    const temperature = document.getElementById('temperature');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const pressure = document.getElementById('pressure');
    
    // Format current date
    function getFormattedDate() {
        const date = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Handle form submission
    weatherForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hide previous messages
        weatherResult.classList.add('d-none');
        forecastSection.classList.add('d-none');
        errorMessage.classList.add('d-none');
        
        const formData = new FormData(weatherForm);
        const city = formData.get('city');
        
        // Verify that a city was entered
        if (!city.trim()) {
            showError('Please enter a city');
            return;
        }
        
        // Make API request
        fetch('/weather', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                showWeatherResult(data);
            }
        })
        .catch(error => {
            showError('Error connecting to the server');
            console.error('Error:', error);
        });
    });
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
    }
    
    // Show weather result
    function showWeatherResult(data) {
        // Update DOM elements
        cityResult.textContent = `${data.city}, ${data.country}`;
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
        weatherDescription.textContent = capitalizeFirstLetter(data.description);
        temperature.textContent = `${data.temperature}°C`;
        humidity.textContent = `${data.humidity}%`;
        wind.textContent = `${data.wind} km/h`;
        pressure.textContent = `${data.pressure} hPa`;
        
        if (document.getElementById('current-date')) {
            document.getElementById('current-date').textContent = getFormattedDate();
        }
        
        if (document.getElementById('feels-like')) {
            document.getElementById('feels-like').textContent = `Feels like: ${data.feels_like}°C`;
        }
        
        // Show the result
        weatherResult.classList.remove('d-none');
        
        // Display forecast if available
        if (data.daily_forecast && data.daily_forecast.length > 0) {
            displayForecast(data.daily_forecast);
        }
    }
    
    // Display 7-day forecast
    function displayForecast(forecast) {
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
        
        const template = document.getElementById('forecast-day-template');
        
        forecast.forEach(day => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.forecast-date').textContent = day.date;
            clone.querySelector('.forecast-icon').src = `http://openweathermap.org/img/wn/${day.icon}.png`;
            clone.querySelector('.forecast-max').textContent = `${day.temp_max}°`;
            clone.querySelector('.forecast-min').textContent = `${day.temp_min}°`;
            clone.querySelector('.forecast-desc').textContent = capitalizeFirstLetter(day.description);
            
            forecastContainer.appendChild(clone);
        });
        
        forecastSection.classList.remove('d-none');
    }
    
    // Load major cities weather
    loadCitiesBtn.addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
        
        fetch('/cities-weather')
            .then(response => response.json())
            .then(cities => {
                displayCities(cities);
                this.innerHTML = '<i class="fas fa-check me-1"></i> Loaded';
            })
            .catch(error => {
                console.error('Error:', error);
                this.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i> Try Again';
                this.disabled = false;
            });
    });
    
    // Display major cities
    function displayCities(cities) {
        const citiesContainer = document.getElementById('cities-container');
        citiesContainer.innerHTML = '';
        
        const template = document.getElementById('city-card-template');
        
        cities.forEach(city => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.city-name').textContent = `${city.city}, ${city.country}`;
            clone.querySelector('.city-icon').src = `http://openweathermap.org/img/wn/${city.icon}.png`;
            clone.querySelector('.city-temp').textContent = `${city.temperature}°C`;
            clone.querySelector('.city-desc').textContent = capitalizeFirstLetter(city.description);
            
            citiesContainer.appendChild(clone);
        });
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}); 