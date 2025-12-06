import { Component, createSignal, Show, onMount } from 'solid-js';
import type { CreateOfferDto, OfferType, UpdateOfferDto, Offer } from '../services/api';
import { ValidationMessages, validateLength, isValidContact } from '../utils/validation';
import LocationFields from './LocationFields';
import type { LocationData } from '../services/geolocation';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface OfferFormProps {
  onSubmit: (offer: CreateOfferDto) => Promise<void>;
  onUpdate?: (id: number, offer: UpdateOfferDto) => Promise<void>;
  isLoading?: boolean;
  offer?: Offer; // Pour l'édition
}

const OfferForm: Component<OfferFormProps> = (props) => {
  const auth = useAuth();
  const [title, setTitle] = createSignal(props.offer?.title || '');
  const [description, setDescription] = createSignal(props.offer?.description || '');
  const [type, setType] = createSignal<OfferType>(props.offer?.type || 'service');
  const [author, setAuthor] = createSignal(props.offer?.author || '');
  const [contact, setContact] = createSignal(props.offer?.contact || '');
  const [locationData, setLocationData] = createSignal<LocationData>({
    country: props.offer?.country,
    region: props.offer?.region,
    city: props.offer?.city,
    postalCode: props.offer?.postalCode,
  });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isLoadingProfile, setIsLoadingProfile] = createSignal(false);

  // Charger les informations du profil utilisateur pour pré-remplir les champs
  onMount(async () => {
    // Ne pré-remplir que si on crée une nouvelle offre (pas en mode édition)
    if (!props.offer && auth.isAuthenticated()) {
      setIsLoadingProfile(true);
      try {
        const profile = await apiService.getProfile();
        
        // Pré-remplir le nom avec le username du profil
        if (!author()) {
          setAuthor(profile.username);
        }
        
        // Pré-remplir le contact avec l'email du profil
        if (!contact()) {
          setContact(profile.email);
        }
        
        // Pré-remplir la localisation avec les données du profil
        const newLocationData: LocationData = {
          country: profile.country,
          region: profile.region,
          city: profile.city,
          postalCode: profile.postalCode,
        };
        setLocationData(newLocationData);
      } catch (err) {
        console.warn('Impossible de charger le profil utilisateur:', err);
        // Ne pas bloquer l'utilisateur si le profil ne peut pas être chargé
      } finally {
        setIsLoadingProfile(false);
      }
    }
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title()) {
      newErrors.title = ValidationMessages.TITLE_REQUIRED;
    } else if (!validateLength(title(), 5, 255)) {
      newErrors.title = ValidationMessages.TITLE_LENGTH;
    }

    if (!description()) {
      newErrors.description = ValidationMessages.DESCRIPTION_REQUIRED;
    } else if (!validateLength(description(), 10, 2000)) {
      newErrors.description = ValidationMessages.DESCRIPTION_LENGTH;
    }

    if (!author()) {
      newErrors.author = ValidationMessages.AUTHOR_REQUIRED;
    } else if (!validateLength(author(), 2, 100)) {
      newErrors.author = ValidationMessages.AUTHOR_LENGTH;
    }

    if (!contact()) {
      newErrors.contact = ValidationMessages.CONTACT_REQUIRED;
    } else {
      const contactValidation = isValidContact(contact());
      if (!contactValidation.valid) {
        newErrors.contact = ValidationMessages.CONTACT_INVALID;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      const locData = locationData();
      if (props.offer && props.onUpdate) {
        await props.onUpdate(props.offer.id, {
          title: title(),
          description: description(),
          type: type(),
          author: author(),
          contact: contact(),
          country: locData.country,
          region: locData.region,
          city: locData.city,
          postalCode: locData.postalCode,
        });
      } else {
        await props.onSubmit({
          title: title(),
          description: description(),
          type: type(),
          author: author(),
          contact: contact(),
          country: locData.country,
          region: locData.region,
          city: locData.city,
          postalCode: locData.postalCode,
        });
        // Reset form seulement pour la création
        // Ne pas réinitialiser author, contact et locationData car ils seront rechargés depuis le profil
        setTitle('');
        setDescription('');
        setType('service');
        
        // Recharger les données du profil pour pré-remplir à nouveau
        if (auth.isAuthenticated()) {
          try {
            const profile = await apiService.getProfile();
            setAuthor(profile.username);
            setContact(profile.email);
            if (profile.country || profile.region || profile.city || profile.postalCode) {
              setLocationData({
                country: profile.country,
                region: profile.region,
                city: profile.city,
                postalCode: profile.postalCode,
              });
            }
          } catch (err) {
            // Ignorer l'erreur
            console.warn('Impossible de recharger le profil:', err);
          }
        }
      }
      setErrors({});
    } catch (error) {
      console.error('Error submitting offer:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
      aria-label={props.offer ? "Formulaire de modification d'offre" : "Formulaire de création d'offre"}
    >
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">
        {props.offer ? 'Modifier une offre' : 'Proposer une offre'}
      </h2>
      
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
          Type d'offre
        </label>
        <select
          id="type"
          value={type()}
          onChange={(e) => setType(e.currentTarget.value as OfferType)}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          aria-required="true"
          aria-describedby="type-description"
        >
          <option value="service">Service</option>
          <option value="objet">Objet</option>
          <option value="nourriture">Nourriture</option>
        </select>
      </div>

      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Titre <span class="text-gray-500 text-xs">(5-255 caractères)</span>
        </label>
        <input
          id="title"
          type="text"
          value={title()}
          onInput={(e) => {
            setTitle(e.currentTarget.value);
            if (errors().title) setErrors({ ...errors(), title: '' });
          }}
          placeholder="Ex: Cours de piano, Vélos d'occasion, Légumes du jardin..."
          class={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors().title ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={255}
          aria-required="true"
          aria-invalid={!!errors().title}
          aria-describedby={errors().title ? "title-error" : undefined}
        />
        <Show when={errors().title}>
          <p id="title-error" class="mt-1 text-sm text-red-600" role="alert">{errors().title}</p>
        </Show>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Description <span class="text-gray-500 text-xs">(10-2000 caractères)</span>
        </label>
        <textarea
          id="description"
          value={description()}
          onInput={(e) => {
            setDescription(e.currentTarget.value);
            if (errors().description) setErrors({ ...errors(), description: '' });
          }}
          placeholder="Décrivez votre offre en détail..."
          rows="4"
          class={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
            errors().description ? 'border-red-300' : 'border-gray-300'
          }`}
          maxLength={2000}
          aria-required="true"
          aria-invalid={!!errors().description}
          aria-describedby={errors().description ? "description-error" : "description-help"}
        />
        <div class="flex justify-between mt-1">
          <Show when={errors().description}>
            <p id="description-error" class="text-sm text-red-600" role="alert">{errors().description}</p>
          </Show>
          <p id="description-help" class="text-xs text-gray-500 ml-auto">{description().length}/2000</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
            Votre nom <span class="text-gray-500 text-xs">(2-100 caractères)</span>
          </label>
          <input
            id="author"
            type="text"
            value={author()}
            onInput={(e) => {
              setAuthor(e.currentTarget.value);
              if (errors().author) setErrors({ ...errors(), author: '' });
            }}
            placeholder="Votre nom"
            class={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors().author ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={100}
            aria-required="true"
            aria-invalid={!!errors().author}
            aria-describedby={errors().author ? "author-error" : undefined}
          />
          <Show when={errors().author}>
            <p id="author-error" class="mt-1 text-sm text-red-600" role="alert">{errors().author}</p>
          </Show>
        </div>

        <div>
          <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">
            Contact (email ou téléphone français)
          </label>
          <input
            id="contact"
            type="text"
            value={contact()}
            onInput={(e) => {
              setContact(e.currentTarget.value);
              if (errors().contact) setErrors({ ...errors(), contact: '' });
            }}
            placeholder="Email ou téléphone (ex: 0612345678)"
            class={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors().contact ? 'border-red-300' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors().contact}
            aria-describedby={errors().contact ? "contact-error" : undefined}
          />
          <Show when={errors().contact}>
            <p id="contact-error" class="mt-1 text-sm text-red-600" role="alert">{errors().contact}</p>
          </Show>
        </div>
      </div>

      <LocationFields
        country={props.offer?.country ?? locationData().country}
        region={props.offer?.region ?? locationData().region}
        city={props.offer?.city ?? locationData().city}
        postalCode={props.offer?.postalCode ?? locationData().postalCode}
        onLocationChange={setLocationData}
        disabled={props.isLoading || isLoadingProfile()}
      />

      <button
        type="submit"
        disabled={props.isLoading}
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={props.isLoading}
      >
        {props.isLoading 
          ? (props.offer ? 'Modification...' : 'Publication...') 
          : (props.offer ? 'Modifier l\'offre' : 'Publier l\'offre')}
      </button>
    </form>
  );
};

export default OfferForm;

