// script.js - Lógica principal del Examen B 17012426

/* =========================================
   1. Registro de Service Worker (PWA)
   ========================================= */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Al separar los archivos, lo ideal es apuntar a un archivo sw.js real
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado correctamente.', reg.scope))
            .catch(err => console.log('Error al registrar Service Worker.', err));
    });
}

/* =========================================
   2. Lógica de Interfaz y Modo Oscuro
   ========================================= */
const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggle');

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        // Despachar evento para redibujar el canvas al cambiar de tema
        window.dispatchEvent(new Event('themeChanged'));
    });
}

// Funciones del Modal Personalizado (Reemplazo de alert())
const modal = document.getElementById('customModal');
const modalMsg = document.getElementById('modalMessage');
let modalContent = null;

if (modal) {
    modalContent = modal.querySelector('div > div').parentElement;
}

function mostrarModal(mensaje) {
    if (!modal) return;
    modalMsg.textContent = mensaje;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
}

function cerrarModal() {
    if (!modal) return;
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 150);
}

// Hacer globales las funciones para que funcionen con los atributos onclick del HTML
window.mostrarModal = mostrarModal;
window.cerrarModal = cerrarModal;

/* =========================================
   3. API de Voz (Web Speech API)
   ========================================= */
window.leerCompromiso = function() {
    if ('speechSynthesis' in window) {
        const texto = document.getElementById('texto-politica').textContent;
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-ES'; // Idioma español
        utterance.rate = 1.0;     // Velocidad normal
        utterance.pitch = 1.1;    // Tono ligeramente más agudo
        
        window.speechSynthesis.cancel(); // Detener audios anteriores si se presiona varias veces
        window.speechSynthesis.speak(utterance);
    } else {
        mostrarModal("Su navegador no soporta la API de Lectura en Voz Alta.");
    }
};

/* =========================================
   4. Validación de Formulario (JS)
   ========================================= */
window.validarFormulario = function(event) {
    event.preventDefault(); // Evitar que la página se recargue
    const linea = document.getElementById('lineaProd').value.trim();
    const defecto = document.getElementById('defecto').value.trim();

    if (linea === "" || defecto === "") {
        mostrarModal("Error: Todos los campos (Línea de Producción y Defecto) son obligatorios.");
    } else {
        mostrarModal(`¡Registro Exitoso!\nLínea: ${linea}\nSe ha guardado el reporte del defecto en el sistema.`);
        document.getElementById('reportForm').reset(); // Limpiar el formulario
    }
};

/* =========================================
   5. API de Geolocalización
   ========================================= */
window.obtenerUbicacion = function() {
    const errorElement = document.getElementById('geoError');
    const resultElement = document.getElementById('geoResult');
    const latElement = document.getElementById('lat');
    const lonElement = document.getElementById('lon');

    errorElement.classList.add('hidden');
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(posicion) {
                // Mostrar coordenadas con 6 decimales de precisión
                latElement.textContent = posicion.coords.latitude.toFixed(6);
                lonElement.textContent = posicion.coords.longitude.toFixed(6);
                resultElement.classList.remove('hidden');
            },
            function(error) {
                errorElement.textContent = "Error al obtener ubicación. Verifique los permisos del navegador.";
                errorElement.classList.remove('hidden');
            }
        );
    } else {
        errorElement.textContent = "La geolocalización no es soportada por su navegador.";
        errorElement.classList.remove('hidden');
    }
};

/* =========================================
   6. HTML5 Canvas (Dibujar Autoría)
   ========================================= */
function dibujarCanvas() {
    const canvas = document.getElementById('miCanvas');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        
        // Determinar el color de fondo según el tema actual (claro/oscuro)
        ctx.fillStyle = htmlElement.classList.contains('dark') ? '#111827' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Configuración de texto
        const text = "Jorge";
        ctx.font = "bold 60px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Crear un gradiente de color para el texto
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", "#3B82F6");   // Azul
        gradient.addColorStop("0.5", "#8B5CF6"); // Morado
        gradient.addColorStop("1", "#EC4899");   // Rosa

        // Sombra del texto
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Dibujar el texto principal
        ctx.fillStyle = gradient;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Dibujar un borde decorativo interior
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#3B82F6";
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    }
}

// Dibujar el canvas cuando la página cargue
window.addEventListener('load', dibujarCanvas);

// Redibujar el canvas si el usuario cambia entre modo claro y oscuro
window.addEventListener('themeChanged', dibujarCanvas);