const axios = require('axios');

const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;
const OPEN_WEATHER_API = (city) => `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${OPEN_WEATHER_API_KEY}&units=metric`;

async function getCityWeather(city) {
    try {
        return await axios.get(OPEN_WEATHER_API(city));
    } catch (err) {
        console.log(err);
        return {
            error: true,
            response: err.response
        };
    }
}

function getWeatherIcon(icon_id) {
    return `http://openweathermap.org/img/wn/${icon_id}@2x.png`
}

module.exports = {
    getCityWeather,
    getWeatherIcon
}