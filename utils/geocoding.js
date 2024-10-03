
// const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const API_KEY = 'AIzaSyC8zy45f-dWZWg0P4A9mGAZjNlMYTnJRvI';

export const getAddressFromCoordinates = async (lat, long) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();


    
    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Google Maps API error: ${data.error_message}`);
    }

    if (data.results.length > 0) {
      const addressComponents = data.results[0].address_components;

      // Extract the city, district, and state
      const city = addressComponents.find(component => component.types.includes('locality'))?.long_name || '';
      const district = addressComponents.find(component => component.types.includes('administrative_area_level_2'))?.long_name || '';
      const state = addressComponents.find(component => component.types.includes('administrative_area_level_1'))?.long_name || '';

      // Construct the address without country and division
      const address = [city, district, state].filter(Boolean).join(', ');

      return address;
    }
    throw new Error('No address found');
  } catch (error) {
    console.error('Error fetching address:', error);
    throw new Error('Failed to fetch address');
  }
};
