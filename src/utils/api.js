export async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`,
        )

        if (!response.ok) {
            throw new Error("Error al obtener datos del clima")
        }

        const data = await response.json()

        const locationData = await fetchLocationName(lat, lon)

        return {
            location: {
                name: locationData.name,
                province: locationData.admin2 || "",
                region: locationData.admin1,
                country: locationData.country,
            },
            current: {
                temperature: data.current.temperature_2m,
                weatherCode: data.current.weather_code,
                windSpeed: data.current.wind_speed_10m,
                humidity: data.current.relative_humidity_2m,
                precipitation: data.current.precipitation,
                feelsLike: data.current.apparent_temperature,
                uvIndex: data.current.uv_index,
                time: data.current.time,
            },
            daily: data.daily.time.map((time, i) => ({
                date: time,
                maxTemp: data.daily.temperature_2m_max[i],
                minTemp: data.daily.temperature_2m_min[i],
                weatherCode: data.daily.weather_code[i],
                sunrise: data.daily.sunrise[i],
                sunset: data.daily.sunset[i],
                precipitation: data.daily.precipitation_sum[i],
            })),
            hourly: data.hourly.time.map((time, i) => ({
                time: time,
                temperature: data.hourly.temperature_2m[i],
                weatherCode: data.hourly.weather_code[i],
                precipitation: data.hourly.precipitation[i],
            })),
        }
    } catch (error) {
        console.error("Error fetching weather data:", error)
        throw error
    }
}

async function fetchLocationName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=es`,
        )

        if (!response.ok) {
            throw new Error("Error al obtener nombre de ubicación")
        }

        const data = await response.json()

        if (!data || !data.address) {
            return {
                name: "Ubicación desconocida",
                country: "",
                admin1: "",
                admin2: "",
            }
        }

        const address = data.address

        const name =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "Ubicación desconocida"
        const admin2 = address.province || address.state_district || ""
        const admin1 = address.state || address.region || ""
        const country = address.country || ""

        return {
            name: name,
            country: country,
            admin1: admin1,
            admin2: admin2,
        }
    } catch (error) {
        console.error("Error fetching location name:", error)
        try {
            const fallbackResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=es`,
            )

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                if (fallbackData.results && fallbackData.results.length > 0) {
                    const result = fallbackData.results[0]
                    return {
                        name: result.name,
                        country: result.country,
                        admin1: result.admin1 || "",
                        admin2: result.admin2 || "",
                    }
                }
            }
        } catch (fallbackError) {
            console.error("Fallback geocoding also failed:", fallbackError)
        }

        return {
            name: "Vidreres",
            country: "España",
            admin1: "Cataluña",
            admin2: "Girona",
        }
    }
}

export async function searchLocation(query) {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es`,
        )

        if (!response.ok) {
            throw new Error("Error al buscar ubicación")
        }

        const data = await response.json()

        if (!data.results) {
            return []
        }

        return data.results.map((result) => ({
            name: result.name,
            lat: result.latitude,
            lon: result.longitude,
            country: result.country,
            admin1: result.admin1 || "",
            admin2: result.admin2 || "",
        }))
    } catch (error) {
        console.error("Error searching location:", error)
        return []
    }
}
