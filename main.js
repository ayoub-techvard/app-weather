// Seleccionamos los elementos necesarios del DOM
const result = document.querySelector('.result'); // Elemento donde se mostrarán los resultados del clima
const form = document.querySelector('.get-weather'); // Formulario para ingresar la ciudad
const nameCity = document.querySelector('#city'); // Campo de entrada para el nombre de la ciudad
const favoriteList = document.querySelector('#favorite-list'); // Lista de ciudades favoritas

// Agregamos un evento de 'submit' al formulario
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitamos el comportamiento por defecto del formulario (recargar la página)

    // Verificamos si el campo de la ciudad está vacío
    if (nameCity.value === '') {
        showError('El campo de la ciudad es obligatorio...'); // Mostramos un mensaje de error
        return; // Salimos de la función si el campo está vacío
    }

    // Llamamos a la API con el nombre de la ciudad ingresado
    callAPI(nameCity.value);
    nameCity.value = ''; // Limpiamos el campo de entrada
});

// Función para llamar a la API del clima
function callAPI(city) {
    const apiId = '41d1d7f5c2475b3a16167b30bc4f265c'; // API Key
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiId}`; // URL de la API con la ciudad y la API Key

    // Realizamos una petición fetch a la URL
    fetch(url)
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(data => {
            // Verificamos si la ciudad no se encontró
            if (data.cod === '404') {
                showError('Ciudad no encontrada...'); // Mostramos un mensaje de error
            } else {
                clearHTML(); // Limpiamos el contenido previo
                showWeather(data); // Mostramos el clima actual
                addFavorite(city); // Añadimos la ciudad a la lista de favoritos
            }
        })
        .catch(error => console.log(error)); // Manejo de errores
}

// Función para mostrar el clima en el DOM
function showWeather(data) {
    const { name, main: { temp, humidity }, weather: [arr], dt } = data; // Desestructuramos los datos de la API
    const degrees = kelvinToCentigrade(temp); // Convertimos la temperatura de Kelvin a Celsius
    const time = new Date(dt * 1000).toLocaleTimeString(); // Convertimos la marca de tiempo a una hora legible

    // Creamos un nuevo div con el contenido del clima
    const content = document.createElement('div');
    content.innerHTML = `
        <h2>Clima en ${name}</h2>
        <img src="https://openweathermap.org/img/wn/${arr.icon}@2x.png" alt="icon">
        <p>${degrees}°C</p>
        <p>Humedad: ${humidity}%</p>
        <p>Hora: ${time}</p>
    `;
    result.appendChild(content); // Añadimos el contenido al DOM

    // Obtener previsión semanal
    getWeeklyForecast(name); // Llamamos a la función para obtener la previsión semanal
}

// Función para obtener la previsión semanal de la ciudad
function getWeeklyForecast(city) {
    const apiId = '41d1d7f5c2475b3a16167b30bc4f265c'; // API Key
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiId}`; // URL de la API con la ciudad y la API Key

    // Realizamos una petición fetch a la URL
    fetch(url)
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(data => {
            showWeeklyForecast(data); // Mostramos la previsión semanal
        })
        .catch(error => console.log(error)); // Manejo de errores
}

// Función para mostrar la previsión semanal en el DOM
function showWeeklyForecast(data) {
    const forecastDiv = document.createElement('div'); // Creamos un nuevo div
    forecastDiv.classList.add('forecast-weekly'); // Añadimos una clase al div
    forecastDiv.innerHTML = '<h3>Previsión Semanal</h3>'; // Añadimos un título al div
    
    // Agrupamos los datos por día
    const dailyData = {};
    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000).toLocaleDateString(); // Convertimos la marca de tiempo a una fecha legible
        if (!dailyData[date]) {
            dailyData[date] = []; // Creamos una lista para cada día
        }
        dailyData[date].push(entry); // Añadimos la entrada a la lista del día correspondiente
    });

    // Iteramos sobre los datos diarios
    for (const [date, entries] of Object.entries(dailyData)) {
        // Calculamos la temperatura promedio del día
        const temps = entries.map(entry => entry.main.temp);
        const avgTemp = kelvinToCentigrade(temps.reduce((a, b) => a + b) / temps.length); // Calculamos el promedio
        const icon = entries[0].weather[0].icon; // Usamos el ícono del primer entry del día

        // Creamos un nuevo div para el día
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item'); // Añadimos una clase al div
        forecastItem.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
            <p>${avgTemp}°C</p>
        `;
        forecastDiv.appendChild(forecastItem); // Añadimos el item al div de la previsión semanal
    }
    
    result.appendChild(forecastDiv); // Añadimos la previsión semanal al DOM
}

// Función para mostrar un mensaje de error
function showError(message) {
    const alert = document.createElement('p'); // Creamos un nuevo párrafo
    alert.classList.add('alert-message'); // Añadimos una clase al párrafo
    alert.innerHTML = message; // Establecemos el mensaje de error

    form.appendChild(alert); // Añadimos el mensaje al formulario
    setTimeout(() => {
        alert.remove(); // Eliminamos el mensaje después de 3 segundos
    }, 3000);
}

// Función para convertir de Kelvin a Celsius
function kelvinToCentigrade(temp) {
    return parseInt(temp - 273.15); // Realizamos la conversión
}

// Función para limpiar el contenido del HTML
function clearHTML() {
    result.innerHTML = ''; // Limpiamos el contenido del elemento result
}

// Función para añadir una ciudad a la lista de favoritos
function addFavorite(city) {
    // Verificamos si la ciudad ya está en la lista de favoritos
    const existingCities = Array.from(favoriteList.children).map(item => item.innerText);
    if (existingCities.includes(city)) {
        return; // Salimos si la ciudad ya está en la lista
    }

    // Creamos un nuevo botón para la ciudad favorita
    const favoriteItem = document.createElement('button');
    favoriteItem.innerHTML = city; // Establecemos el nombre de la ciudad
    favoriteList.appendChild(favoriteItem); // Añadimos el botón a la lista de favoritos

    // Añadimos un evento de clic para el botón de favorito
    favoriteItem.addEventListener('click', () => {
        callAPI(city); // Llamamos a la API con el nombre de la ciudad
    });
}
