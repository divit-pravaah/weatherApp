const daysofWeek = ["Sunday" ,"Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday"]
const months = ["January","February","March","April","May","June","July","August","September","October","November","December",];

// const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,rain,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max&timezone=auto`
// const locationUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${address}&count=1&language=en&format=json`



function updatingDates(){
    let dateToday = new Date();
    let listDate = [];

    function addDays(date, day) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + day);
        return newDate;
    }
    

    
    function updateAllDateElements() {
        listDate.forEach((date, index) => {
            let dayElement = document.querySelector(`#t${index+1}`);
            if (dayElement) {
                dayElement.innerText = `${daysofWeek[date.getDay()].slice(0,3)}, ${date.getDate()} ${months[date.getMonth()].slice(0, 3)}`;
            }
        });
    }


    //Adding  5 days to today's date
    for (let i = 1; i < 6; i++) {
        listDate.push(addDays(dateToday, i));
    }

    document.querySelector("#dateDay").innerText = `${dateToday.getDate()}, ${daysofWeek[dateToday.getDay()]}`;
    document.querySelector("#yearMonth").innerText = `${dateToday.getFullYear()} ${months[dateToday.getMonth()]}`; 
    updateAllDateElements();
} 

async function fetchData(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.log("Error with data", error);
        return;
    }
}

function checkWeatherInfo(argument){
    let weatherDescription = "Unknown"
    let imgSrc = "img/error.png"
    switch(argument){
        case 0:
            weatherDescription = "Clear Sky"
            imgSrc = "img/sun.png"
            break
        case 1:
        case 2:
        case 3:
        case 95:
            weatherDescription = "Rain"
            imgSrc = "img/rain.png"
            break
        case 4:
        case 5:
        case 6:
        case 80:
            weatherDescription = "Cloudy"
            imgSrc = "img/cloud.png"
        
    }
    return [weatherDescription, imgSrc]

}

async function getIpAddress(){
    const ipUrl = "https://freeipapi.com/api/json/"
    let ipData = await fetchData(ipUrl)
    let cityName = ipData.cityName
    document.querySelector('#locate').textContent = `${cityName}`
    return cityName
}
async function getLatLong(name){
    const locationURL = `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=1&language=en&format=json`
    let data = await fetchData(locationURL)
    document.querySelector('#locate').textContent = `${name}`
    let latitude = data.results[0].latitude
    let longitude = data.results[0].longitude
    return [latitude ,longitude]
}
async function getWeatherDetails(data){
    let latLongData = data
    let latitude = latLongData[0]
    let longitude = latLongData[1]
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,rain,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max&timezone=auto`
    let weatherResponse = await fetchData(weatherUrl)
    let currentWeatherData = weatherResponse.current
    let dailyWeatherData = weatherResponse.daily
    return [currentWeatherData,dailyWeatherData]
}

async function allWeatherDetails(weatherDetails){
    let response = weatherDetails
    let currentWeatherData = response[0]
    let dailyWeatherData = response[1]
    
    //Updating UI with current weather details
    function updateCurrentWeatherDetails(currentWeatherData , dailyWeatherData){
        let checkData = checkWeatherInfo(currentWeatherData.weather_code)
        document.querySelector('#currentTemp').textContent = `${Math.round(currentWeatherData.temperature_2m)}°C`
        document.querySelector('#humidity').textContent = `${Math.round(currentWeatherData.relative_humidity_2m)} %`
        document.querySelector('#windSpeed').textContent = `${Math.round(currentWeatherData.wind_speed_10m)} km/h`
        document.querySelector('#dayHL').textContent = `${Math.round(dailyWeatherData.temperature_2m_max[0])}°C / ${Math.round(dailyWeatherData.temperature_2m_min[0])}°C`
        document.querySelector('#currentTime').textContent = `${currentWeatherData.time.slice(-5)}`
        document.querySelector('#refreshTime').textContent = `${currentWeatherData.time.slice(-5)}`
        document.querySelector('#skyWeather').textContent = `${checkData[0]}`
        document.querySelector("#currentWeatherImg").src = `${checkData[1]}`
    }
    function updateDailyWeatherDetails(dailyWeatherData){
        for(i=1;i<6;i++){
            let checkData = checkWeatherInfo(dailyWeatherData.weather_code[i])
            document.querySelector(`#t${i}Weather`).textContent = checkData[0]
            document.querySelector(`#t${i}Img`).src = checkData[1]
            document.querySelector(`#t${i}HL`).textContent = `${Math.round(dailyWeatherData.temperature_2m_max[i])}°C / ${Math.round(dailyWeatherData.temperature_2m_min[i])}°C`
        }
    }
    updateCurrentWeatherDetails(currentWeatherData, dailyWeatherData)
    updateDailyWeatherDetails(dailyWeatherData)

}


async function startRun(){
    let name = await getIpAddress()
    let latLongData = await getLatLong(name)
    let weatherDetails = await getWeatherDetails(latLongData)
    allWeatherDetails(weatherDetails)
    
}

async function searchLocation(){
    let name = document.querySelector('input').value.trim();
    document.querySelector('input').value = "";
    let latLongData = await getLatLong(name)
    let weatherDetails = await getWeatherDetails(latLongData)
    allWeatherDetails(weatherDetails)
}

async function refresh(){
    let name = document.querySelector('#locate').textContent
    let latLongData = await getLatLong(name)
    let weatherDetails = await getWeatherDetails(latLongData)
    allWeatherDetails(weatherDetails)
}







document.addEventListener('DOMContentLoaded' , updatingDates)
document.addEventListener('DOMContentLoaded', startRun)
document.querySelector('#searchbtn').addEventListener("click", searchLocation);
document.querySelector('#refresh').addEventListener('click' , refresh)
document.body.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
        searchLocation();
    }
});