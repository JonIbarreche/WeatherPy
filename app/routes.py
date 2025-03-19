from flask import Blueprint, render_template, request, current_app, jsonify
import requests
from datetime import datetime

main = Blueprint('main', __name__)

# List of major world cities
MAJOR_CITIES = [
    "New York", "London", "Tokyo", "Paris", "Sydney", 
    "Rio de Janeiro", "Dubai", "Singapore", "Hong Kong", "Berlin"
]

@main.route('/')
def index():
    return render_template('index.html', cities=MAJOR_CITIES)

@main.route('/weather', methods=['POST'])
def get_weather():
    city = request.form.get('city', '')
    
    if not city:
        return jsonify({'error': 'Please enter a city'}), 400
    
    # Get API key from config
    api_key = current_app.config['OPENWEATHERMAP_API_KEY']
    
    # Correctly formatted API URL for current weather
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # Check if request was successful
        if response.status_code == 200:
            # Extract relevant information
            lat = data['coord']['lat']
            lon = data['coord']['lon']
            
            # Get forecast data using One Call API - Corrected endpoint to current API version
            forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            forecast_response = requests.get(forecast_url)
            forecast_data = forecast_response.json()
            
            # Extract current weather
            result = {
                'city': data['name'],
                'country': data['sys']['country'],
                'temperature': round(data['main']['temp']),
                'feels_like': round(data['main']['feels_like']),
                'description': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon'],
                'humidity': data['main']['humidity'],
                'wind': round(data['wind']['speed'] * 3.6, 1),  # Convert from m/s to km/h
                'pressure': data['main']['pressure'],
                'daily_forecast': []
            }
            
            # Safely extract 7-day forecast
            if 'daily' in forecast_data:
                # Extract 7-day forecast from data
                for day in forecast_data['daily'][0:7]:
                    day_data = {
                        'date': datetime.fromtimestamp(day['dt']).strftime('%A, %b %d'),
                        'temp_max': round(day['temp']['max']),
                        'temp_min': round(day['temp']['min']),
                        'description': day['weather'][0]['description'],
                        'icon': day['weather'][0]['icon'],
                        'humidity': day['humidity'],
                        'wind_speed': round(day['wind_speed'] * 3.6, 1),
                        'pressure': day['pressure']
                    }
                    result['daily_forecast'].append(day_data)
            # If no daily forecast available, provide a fallback
            else:
                # Just provide current weather as fallback
                result['daily_forecast'] = []
                
            return jsonify(result)
        else:
            # Handle API errors
            if response.status_code == 404:
                message = 'City not found'
            else:
                message = f'Error while getting weather: {data.get("message", "Unknown error")}'
            return jsonify({'error': message}), response.status_code
            
    except Exception as e:
        return jsonify({'error': f'Application error: {str(e)}'}), 500

@main.route('/cities-weather', methods=['GET'])
def get_major_cities_weather():
    api_key = current_app.config['OPENWEATHERMAP_API_KEY']
    results = []
    
    for city in MAJOR_CITIES:
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                results.append({
                    'city': data['name'],
                    'country': data['sys']['country'],
                    'temperature': round(data['main']['temp']),
                    'description': data['weather'][0]['description'],
                    'icon': data['weather'][0]['icon'],
                })
        except Exception:
            # Skip cities with errors
            continue
            
    return jsonify(results) 