/**
 * Service de géolocalisation frontend
 * Gère la géolocalisation automatique via l'API du navigateur
 * et la conversion GPS → adresse (géocodage inverse)
 */

export interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

class GeolocationService {
  /**
   * Demande la permission et récupère la position GPS de l'utilisateur
   */
  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'La géolocalisation n\'est pas supportée par votre navigateur',
        } as GeolocationError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let message = 'Erreur lors de la géolocalisation';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permission de géolocalisation refusée';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Position indisponible';
              break;
            case error.TIMEOUT:
              message = 'Délai d\'attente dépassé';
              break;
          }
          reject({
            code: error.code,
            message,
          } as GeolocationError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Convertit les coordonnées GPS en adresse (géocodage inverse)
   * Utilise l'API Gouv (France) pour la conversion
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // API Gouv - Géocodage inverse
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage inverse');
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const properties = feature.properties;

        return {
          country: 'France', // Par défaut pour l'API Gouv
          region: properties.context?.split(',')[0]?.trim() || '',
          city: properties.city || properties.town || '',
          postalCode: properties.postcode || '',
        };
      }

      throw new Error('Aucune adresse trouvée pour ces coordonnées');
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      throw error;
    }
  }

  /**
   * Récupère la localisation complète de l'utilisateur (GPS + adresse)
   */
  async getLocationData(): Promise<LocationData> {
    try {
      const position = await this.getCurrentPosition();
      const locationData = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );
      return locationData;
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      throw error;
    }
  }

  /**
   * Vérifie si la géolocalisation est disponible
   */
  isAvailable(): boolean {
    return 'geolocation' in navigator;
  }
}

export const geolocationService = new GeolocationService();

