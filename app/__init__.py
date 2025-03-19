from flask import Flask
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.urandom(24)
    
    # Asegurarse de que la clave API está disponible
    app.config['OPENWEATHERMAP_API_KEY'] = os.getenv('OPENWEATHERMAP_API_KEY', '2562242488218794bece0a82f3e2e7db')
    
    # Registro de rutas
    from app.routes import main
    app.register_blueprint(main)
    
    return app 