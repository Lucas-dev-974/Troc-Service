import { Component, createSignal, Show, createEffect } from 'solid-js';
import { geolocationService, type LocationData } from '../services/geolocation';

interface LocationFieldsProps {
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  onLocationChange: (location: LocationData) => void;
  disabled?: boolean;
}

const LocationFields: Component<LocationFieldsProps> = (props) => {
  const [country, setCountry] = createSignal(props.country || '');
  const [region, setRegion] = createSignal(props.region || '');
  const [city, setCity] = createSignal(props.city || '');
  const [postalCode, setPostalCode] = createSignal(props.postalCode || '');
  const [isLoadingLocation, setIsLoadingLocation] = createSignal(false);
  const [locationError, setLocationError] = createSignal<string | null>(null);
  const [hasTriedGeolocation, setHasTriedGeolocation] = createSignal(false);

  // Mettre à jour les champs quand les props changent
  createEffect(() => {
    // Mettre à jour seulement si les valeurs sont différentes
    const newCountry = props.country || '';
    const newRegion = props.region || '';
    const newCity = props.city || '';
    const newPostalCode = props.postalCode || '';
    
    if (country() !== newCountry) setCountry(newCountry);
    if (region() !== newRegion) setRegion(newRegion);
    if (city() !== newCity) setCity(newCity);
    if (postalCode() !== newPostalCode) setPostalCode(newPostalCode);
  });

  const handleLocationChange = () => {
    const location: LocationData = {
      country: country() || undefined,
      region: region() || undefined,
      city: city() || undefined,
      postalCode: postalCode() || undefined,
    };
    props.onLocationChange(location);
  };

  const handleAutoLocation = async () => {
    if (!geolocationService.isAvailable()) {
      setLocationError('La géolocalisation n\'est pas disponible sur votre appareil');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    setHasTriedGeolocation(true);

    try {
      const locationData = await geolocationService.getLocationData();
      setCountry(locationData.country || '');
      setRegion(locationData.region || '');
      setCity(locationData.city || '');
      setPostalCode(locationData.postalCode || '');
      handleLocationChange();
    } catch (error: any) {
      console.error('Erreur géolocalisation:', error);
      setLocationError(error.message || 'Impossible de récupérer votre localisation');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-700">Localisation (optionnel)</h3>
        <Show when={geolocationService.isAvailable() && !hasTriedGeolocation()}>
          <button
            type="button"
            onClick={handleAutoLocation}
            disabled={isLoadingLocation() || props.disabled}
            class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {isLoadingLocation() ? 'Localisation...' : 'Me localiser automatiquement'}
          </button>
        </Show>
      </div>

      <Show when={locationError()}>
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm">
          <p>{locationError()}</p>
        </div>
      </Show>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="location-country" class="block text-sm font-medium text-gray-700 mb-2">
            Pays
          </label>
          <input
            id="location-country"
            type="text"
            value={country()}
            onInput={(e) => {
              setCountry(e.currentTarget.value);
              handleLocationChange();
            }}
            placeholder="France"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={props.disabled || isLoadingLocation()}
          />
        </div>

        <div>
          <label for="location-region" class="block text-sm font-medium text-gray-700 mb-2">
            Région
          </label>
          <input
            id="location-region"
            type="text"
            value={region()}
            onInput={(e) => {
              setRegion(e.currentTarget.value);
              handleLocationChange();
            }}
            placeholder="Île-de-France"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={props.disabled || isLoadingLocation()}
          />
        </div>

        <div>
          <label for="location-city" class="block text-sm font-medium text-gray-700 mb-2">
            Ville
          </label>
          <input
            id="location-city"
            type="text"
            value={city()}
            onInput={(e) => {
              setCity(e.currentTarget.value);
              handleLocationChange();
            }}
            placeholder="Paris"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={props.disabled || isLoadingLocation()}
          />
        </div>

        <div>
          <label for="location-postalCode" class="block text-sm font-medium text-gray-700 mb-2">
            Code postal
          </label>
          <input
            id="location-postalCode"
            type="text"
            value={postalCode()}
            onInput={(e) => {
              setPostalCode(e.currentTarget.value);
              handleLocationChange();
            }}
            placeholder="75001"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={props.disabled || isLoadingLocation()}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationFields;

