"use client"
import { useState } from "preact/hooks"
import { searchLocation } from "../utils/api.js"

export default function SearchBar() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const handleSearch = async () => {
        if (query.trim().length < 2) return

        setIsSearching(true)
        try {
            const locationResults = await searchLocation(query)
            setResults(locationResults)
            setShowResults(true)
        } catch (error) {
            console.error("Error searching locations:", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSelectLocation = (location) => {
        const event = new CustomEvent("locationSelected", {
            detail: { lat: location.lat, lon: location.lon },
        })
        window.dispatchEvent(event)

        setQuery("")
        setShowResults(false)
    }

    return (
        <div className="relative">
            <div className="flex items-center">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={query}
                        onInput={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Buscar ciudad..."
                        className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSearch}
                    className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    disabled={isSearching}
                >
                    Buscar
                </button>
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.map((result) => (
                        <div
                            key={`${result.lat}-${result.lon}`}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => handleSelectLocation(result)}
                        >
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {result.admin2 && `${result.admin2}, `}
                                {result.admin1}, {result.country}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showResults && results.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center">
                    No se encontraron resultados para "{query}"
                </div>
            )}
        </div>
    )
}