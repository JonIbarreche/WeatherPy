from flask import Blueprint, render_template, request, current_app, jsonify
import requests

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/clima', methods=['POST'])
def obtener_clima():
    ciudad = request.form.get('ciudad', '')
    
    if not ciudad:
        return jsonify({'error': 'Por favor ingrese una ciudad'}), 400
    
    # Obtener la clave API de la configuración
    api_key = current_app.config['OPENWEATHERMAP_API_KEY']
    
    # URL de la API correctamente formada
    url = f"http://api.openweathermap.org/data/2.5/weather?q={ciudad}&appid={api_key}&units=metric&lang=es"
    
    try:
        respuesta = requests.get(url)
        datos = respuesta.json()
        
        # Verificar si la solicitud fue exitosa
        if respuesta.status_code == 200:
            # Extraer la información relevante
            resultado = {
                'ciudad': datos['name'],
                'pais': datos['sys']['country'],
                'temperatura': round(datos['main']['temp']),
                'sensacion_termica': round(datos['main']['feels_like']),
                'descripcion': datos['weather'][0]['description'],
                'icono': datos['weather'][0]['icon'],
                'humedad': datos['main']['humidity'],
                'viento': round(datos['wind']['speed'] * 3.6, 1),  # Convertir de m/s a km/h
                'presion': datos['main']['pressure']
            }
            return jsonify(resultado)
        else:
            # Manejar errores de la API
            if respuesta.status_code == 404:
                mensaje = 'Ciudad no encontrada'
            else:
                mensaje = f'Error al consultar el clima: {datos.get("message", "Error desconocido")}'
            return jsonify({'error': mensaje}), respuesta.status_code
            
    except Exception as e:
        return jsonify({'error': f'Error en la aplicación: {str(e)}'}), 500 