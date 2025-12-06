import { Component, createSignal, Show } from 'solid-js';
import { geolocationService } from '../services/geolocation';

interface LocationFilterProps {
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  onLocationChange: (location: { country?: string; region?: string; city?: string; postalCode?: string }) => void;
  onClear: () => void;
}

const LocationFilter: Component<LocationFilterProps> = (props) => {
  const [country, setCountry] = createSignal(props.country || '');
  const [region, setRegion] = createSignal(props.region || '');
  const [city, setCity] = createSignal(props.city || '');
  const [postalCode, setPostalCode] = createSignal(props.postalCode || '');
  const [isLoadingLocation, setIsLoadingLocation] = createSignal(false);
  const [locationError, setLocationError] = createSignal<string | null>(null);
  const [isExpanded, setIsExpanded] = createSignal(false);

  const handleLocationChange = () => {
    props.onLocationChange({
      country: country() || undefined,
      region: region() || undefined,
      city: city() || undefined,
      postalCode: postalCode() || undefined,
    });
  };

  const handleAutoLocation = async () => {
    if (!geolocationService.isAvailable()) {
      setLocationError('La géolocalisation n\'est pas disponible sur votre appareil');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

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

  const handleClear = () => {
    setCountry('');
    setRegion('');
    setCity('');
    setPostalCode('');
    setLocationError(null);
    props.onClear();
  };

  const hasFilters = () => country() || region() || city() || postalCode();

  return (
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="text-sm font-medium text-gray-700">Filtres de localisation</h3>
        </div>
        <div class="flex items-center gap-2">
          <Show when={hasFilters()}>
            <button
              type="button"
              onClick={handleClear}
              class="text-xs text-gray-500 hover:text-gray-700 font-medium"
              aria-label="Effacer les filtres de localisation"
            >
              Effacer
            </button>
          </Show>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded())}
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            aria-label={isExpanded() ? 'Réduire les filtres' : 'Développer les filtres'}
          >
            {isExpanded() ? '▼' : '▶'}
          </button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="space-y-3">
          <Show when={locationError()}>
            <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-xs">
              <p>{locationError()}</p>
            </div>
          </Show>

          <Show when={geolocationService.isAvailable()}>
            <button
              type="button"
              onClick={handleAutoLocation}
              disabled={isLoadingLocation()}
              class="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isLoadingLocation() ? 'Localisation...' : 'Me localiser automatiquement'}
            </button>
          </Show>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label for="filter-country" class="block text-xs font-medium text-gray-700 mb-1">
                Pays
              </label>
              <input
                id="filter-country"
                type="text"
                value={country()}
                onInput={(e) => {
                  setCountry(e.currentTarget.value);
                  handleLocationChange();
                }}
                placeholder="France"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoadingLocation()}
              />
            </div>

            <div>
              <label for="filter-region" class="block text-xs font-medium text-gray-700 mb-1">
                Région
              </label>
              <input
                id="filter-region"
                type="text"
                value={region()}
                onInput={(e) => {
                  setRegion(e.currentTarget.value);
                  handleLocationChange();
                }}
                placeholder="Île-de-France"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoadingLocation()}
              />
            </div>

            <div>
              <label for="filter-city" class="block text-xs font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                id="filter-city"
                type="text"
                value={city()}
                onInput={(e) => {
                  setCity(e.currentTarget.value);
                  handleLocationChange();
                }}
                placeholder="Paris"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoadingLocation()}
              />
            </div>

            <div>
              <label for="filter-postalCode" class="block text-xs font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                id="filter-postalCode"
                type="text"
                value={postalCode()}
                onInput={(e) => {
                  setPostalCode(e.currentTarget.value);
                  handleLocationChange();
                }}
                placeholder="75001"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoadingLocation()}
              />
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default LocationFilter;

