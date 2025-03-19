document.addEventListener('DOMContentLoaded', function() {
    const formClima = document.getElementById('form-clima');
    const resultadoClima = document.getElementById('resultado-clima');
    const mensajeError = document.getElementById('mensaje-error');
    
    // Elementos del resultado
    const ciudadResultado = document.getElementById('ciudad-resultado');
    const iconoClima = document.getElementById('icono-clima');
    const descripcionClima = document.getElementById('descripcion-clima');
    const temperatura = document.getElementById('temperatura');
    const humedad = document.getElementById('humedad');
    const viento = document.getElementById('viento');
    const presion = document.getElementById('presion');
    
    // Formatear fecha actual
    function obtenerFechaFormateada() {
        const fecha = new Date();
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }
    
    // Manejar el envío del formulario
    formClima.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ocultar mensajes previos
        resultadoClima.classList.add('d-none');
        mensajeError.classList.add('d-none');
        
        const formData = new FormData(formClima);
        const ciudad = formData.get('ciudad');
        
        // Verificar que se ingresó una ciudad
        if (!ciudad.trim()) {
            mostrarError('Por favor ingrese una ciudad');
            return;
        }
        
        // Realizar la petición a la API
        fetch('/clima', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarError(data.error);
            } else {
                mostrarResultado(data);
            }
        })
        .catch(error => {
            mostrarError('Error al conectar con el servidor');
            console.error('Error:', error);
        });
    });
    
    // Mostrar mensaje de error
    function mostrarError(mensaje) {
        mensajeError.textContent = mensaje;
        mensajeError.classList.remove('d-none');
    }
    
    // Mostrar el resultado del clima
    function mostrarResultado(data) {
        // Actualizar elementos del DOM
        ciudadResultado.textContent = `${data.ciudad}, ${data.pais}`;
        iconoClima.src = `http://openweathermap.org/img/wn/${data.icono}@2x.png`;
        descripcionClima.textContent = data.descripcion.charAt(0).toUpperCase() + data.descripcion.slice(1);
        temperatura.textContent = `${data.temperatura}°C`;
        humedad.textContent = `${data.humedad}%`;
        viento.textContent = `${data.viento} km/h`;
        presion.textContent = `${data.presion} hPa`;
        
        if (document.getElementById('fecha-actual')) {
            document.getElementById('fecha-actual').textContent = obtenerFechaFormateada();
        }
        
        if (document.getElementById('sensacion')) {
            document.getElementById('sensacion').textContent = `Sensación térmica: ${data.sensacion_termica}°C`;
        }
        
        // Mostrar el resultado
        resultadoClima.classList.remove('d-none');
    }
}); 