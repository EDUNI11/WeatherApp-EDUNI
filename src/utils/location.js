export async function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.log("Uso de la ubicación no soportado por el navegador")
            resolve(null)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                })
            },
            (error) => {
                console.log("Error al obtener la ubicación:", error)
                resolve(null)
            },
            { timeout: 5000 },
        )
    })
}
