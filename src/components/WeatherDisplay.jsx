"use client"
import { useState, useEffect } from "preact/hooks"
import { fetchWeatherData } from "../utils/api.js"
import { getUserLocation } from "../utils/location"
import DailyForecast from "./DailyForecast.jsx"

export default function WeatherDisplay() {
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedDay, setSelectedDay] = useState(0)
    const [location, setLocation] = useState({ lat: 41.8448, lon: 2.7604 }) // Default: Vidreres

    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoading(true)
                const userLocation = await getUserLocation()
                if (userLocation) {
                    setLocation(userLocation)
                } else {
                    await loadWeatherData()
                }
            } catch (err) {
                setError("Error al cargar los datos del clima. Inténtalo de nuevo.")
                console.error(err)
                setLoading(false)
            }
        }

        loadInitialData()
    }, [])

    useEffect(() => {
        if (location && location.lat && location.lon) {
            loadWeatherData()
        }
    }, [location])

    useEffect(() => {
        function handleLocationSelected(event) {
            if (event.detail && event.detail.lat && event.detail.lon) {
                setLocation({
                    lat: event.detail.lat,
                    lon: event.detail.lon,
                })
            }
        }

        window.addEventListener("locationSelected", handleLocationSelected)
        return () => window.removeEventListener("locationSelected", handleLocationSelected)
    }, [])

    async function loadWeatherData() {
        try {
            setLoading(true)
            const data = await fetchWeatherData(location.lat, location.lon)
            setWeatherData(data)
            setSelectedDay(0)
        } catch (err) {
            setError("Error al cargar los datos del clima. Inténtalo de nuevo.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-blue-400 dark:bg-blue-600 mb-4"></div>
                    <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg">
                <p>{error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-red-200 dark:bg-red-800 rounded-md hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
                    onClick={loadWeatherData}
                >
                    Reintentar
                </button>
            </div>
        )
    }

    if (!weatherData) return null

    const getWeatherIcon = (code) => {
        const codeMap = {
            0: "☀️", // Clear sky
            1: "🌤️", // Mainly clear
            2: "⛅", // Partly cloudy
            3: "☁️", // Overcast
            45: "🌫️", // Fog
            48: "🌫️", // Depositing rime fog
            51: "🌦️", // Light drizzle
            53: "🌦️", // Moderate drizzle
            55: "🌧️", // Dense drizzle
            61: "🌧️", // Slight rain
            63: "🌧️", // Moderate rain
            65: "🌧️", // Heavy rain
            71: "❄️", // Slight snow fall
            73: "❄️", // Moderate snow fall
            75: "❄️", // Heavy snow fall
            77: "❄️", // Snow grains
            80: "🌧️", // Slight rain showers
            81: "🌧️", // Moderate rain showers
            82: "🌧️", // Violent rain showers
            85: "🌨️", // Slight snow showers
            86: "🌨️", // Heavy snow showers
            95: "⛈️", // Thunderstorm
            96: "⛈️", // Thunderstorm with slight hail
            99: "⛈️", // Thunderstorm with heavy hail
        }
        return codeMap[code] || "❓"
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }).format(date)
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">
                    {weatherData.location.name}, {weatherData.location.province}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {weatherData.location.region}, {weatherData.location.country}
                </p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-900 dark:from-blue-900 dark:to-blue-950 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="text-7xl mr-4">{getWeatherIcon(weatherData.current.weatherCode)}</div>
                        <div>
                            <div className="text-4xl font-bold">{Math.round(weatherData.current.temperature)}°C</div>
                            <div className="text-blue-200">Sensación: {Math.round(weatherData.current.feelsLike)}°C</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center">
                            <span className="mr-2">💧</span>
                            <span>Humedad: {weatherData.current.humidity}%</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">💨</span>
                            <span>Viento: {weatherData.current.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">🌧️</span>
                            <span>Precip: {weatherData.current.precipitation} mm</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">☀️</span>
                            <span>UV: {weatherData.current.uvIndex}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
                    {weatherData.daily.slice(0, 6).map((day, index) => (
                        <div
                            key={day.date}
                            className={`cursor-pointer py-4 px-2 text-center transition-colors ${
                                selectedDay === index ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => setSelectedDay(index)}
                        >
                            <div className="text-sm font-medium mb-1">{index === 0 ? "Hoy" : formatDate(day.date).split(",")[0]}</div>
                            <div className="text-3xl my-2">{getWeatherIcon(day.weatherCode)}</div>
                            <div className="flex justify-center gap-2">
                                <span className="font-medium">{Math.round(day.maxTemp)}°</span>
                                <span className="text-gray-500 dark:text-gray-400">{Math.round(day.minTemp)}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DailyForecast
                day={weatherData.daily[selectedDay]}
                hourlyData={weatherData.hourly.filter(
                    (hour) => new Date(hour.time).toDateString() === new Date(weatherData.daily[selectedDay].date).toDateString(),
                )}
                getWeatherIcon={getWeatherIcon}
            />
        </div>
    )
}
