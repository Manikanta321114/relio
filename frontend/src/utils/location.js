import axios from 'axios';

/**
 * Utility to request user browser location and reverse-geocode
 * the coordinates into Area, City, State, and Pincode using OpenStreetMap Nominatim.
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GEOLOCATION_NOT_SUPPORTED"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                format: 'json',
                lat: latitude,
                lon: longitude,
                zoom: 18,
                addressdetails: 1
              },
              headers: {
                'Accept-Language': 'en'
              }
            }
          );

          if (response.data && response.data.address) {
            const addr = response.data.address;
            
            // Extract structured fields mapping standard Nominatim values
            const pincode = addr.postcode || "";
            const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
            const state = addr.state || "";
            
            // Collect road/neighbourhood/suburb as Area
            const areaParts = [];
            if (addr.suburb) areaParts.push(addr.suburb);
            if (addr.neighbourhood) areaParts.push(addr.neighbourhood);
            if (addr.residential) areaParts.push(addr.residential);
            if (addr.road) areaParts.push(addr.road);
            
            const area = areaParts.length > 0 ? areaParts.slice(0, 2).join(", ") : "";

            resolve({
              area,
              city,
              state,
              pincode,
              latitude,
              longitude
            });
          } else {
            reject(new Error("GEOCODE_FAILED"));
          }
        } catch (error) {
          reject(new Error("GEOCODE_FAILED"));
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("PERMISSION_DENIED"));
        } else {
          reject(new Error("GEOLOCATION_FAILED"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
