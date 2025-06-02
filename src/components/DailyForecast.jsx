import { InfoIcons } from "./WeatherIcons"

export default function DailyForecast({ day, hourlyData, getWeatherIcon }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }).format(date)
    }

    const formatHour = (timeStr) => {
        const date = new Date(timeStr)
        return date.getHours() + "h"
    }

    const formatTime = (timeStr) => {
        const date = new Date(timeStr)
        return new Intl.DateTimeFormat("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(date)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">{formatDate(day.date)}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <span className="text-blue-600 dark:text-blue-400">Temp. Máxima</span>
                        <div className="text-2xl font-bold">{Math.round(day.maxTemp)}°C</div>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                        <InfoIcons.thermometer />
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <span className="text-blue-600 dark:text-blue-400">Temp. Mínima</span>
                        <div className="text-2xl font-bold">{Math.round(day.minTemp)}°C</div>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                        <InfoIcons.thermometer />
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <span className="text-amber-600 dark:text-amber-400">Amanecer</span>
                        <div className="text-2xl font-bold">{formatTime(day.sunrise)}</div>
                    </div>
                    <div className="text-amber-600 dark:text-amber-400">
                        <InfoIcons.sunrise />
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <span className="text-indigo-600 dark:text-indigo-400">Atardecer</span>
                        <div className="text-2xl font-bold">{formatTime(day.sunset)}</div>
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400">
                        <InfoIcons.sunset />
                    </div>
                </div>
            </div>

            <h4 className="text-lg font-semibold mb-3">Pronóstico por horas</h4>
            <div className="overflow-x-auto">
                <div className="inline-flex space-x-4 pb-2 min-w-full">
                    {hourlyData
                        .filter((_, i) => i % 3 === 0)
                        .map((hour) => (
                            <div key={hour.time} className="flex flex-col items-center">
                                <div className="text-sm font-medium mb-1">{formatHour(hour.time)}</div>
                                <div className="mb-1 text-gray-600 dark:text-gray-300">{getWeatherIcon(hour.weatherCode)}</div>
                                <div className="font-medium">{Math.round(hour.temperature)}°</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {hour.precipitation > 0 ? `${hour.precipitation} mm` : ""}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
