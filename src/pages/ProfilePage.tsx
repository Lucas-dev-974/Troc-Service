import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Layout from '../components/Layout';
import OfferCard from '../components/OfferCard';
import LocationFields from '../components/LocationFields';
import { apiService, type UserProfile, type UpdateProfileDto, type Offer } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ValidationMessages, validateLength, isValidEmail } from '../utils/validation';
import type { User } from '../services/auth';
import type { LocationData } from '../services/geolocation';

const ProfilePage: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = createSignal<UserProfile | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isEditing, setIsEditing] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [locationData, setLocationData] = createSignal<LocationData>({});
  const [errors, setErrors] = createSignal<Record<string, string>>({});

  onMount(async () => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    await loadProfile();
  });

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await apiService.getProfile();
      setProfile(userProfile);
      setUsername(userProfile.username);
      setEmail(userProfile.email);
      setLocationData({
        country: userProfile.country,
        region: userProfile.region,
        city: userProfile.city,
        postalCode: userProfile.postalCode,
      });
    } catch (err: any) {
      console.error('Error loading profile:', err);
      const errorMessage = err?.message || 'Erreur lors du chargement du profil. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (username() && !validateLength(username(), 3, 50)) {
      newErrors.username = ValidationMessages.AUTHOR_LENGTH.replace('auteur', 'nom d\'utilisateur');
    }

    if (email() && !isValidEmail(email())) {
      newErrors.email = ValidationMessages.CONTACT_INVALID.replace('contact', 'email');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updateDto: UpdateProfileDto = {};
      if (username() !== profile()?.username) {
        updateDto.username = username();
      }
      if (email() !== profile()?.email) {
        updateDto.email = email();
      }

      const locData = locationData();
      if (locData.country !== profile()?.country || locData.region !== profile()?.region || 
          locData.city !== profile()?.city || locData.postalCode !== profile()?.postalCode) {
        updateDto.country = locData.country;
        updateDto.region = locData.region;
        updateDto.city = locData.city;
        updateDto.postalCode = locData.postalCode;
      }

      if (Object.keys(updateDto).length > 0) {
        const updatedUser = await apiService.updateProfile(updateDto);
        // Mettre à jour le contexte d'authentification
        auth.updateUser(updatedUser as User);
        await loadProfile();
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err?.code === 'EMAIL_EXISTS') {
        setError('Cet email est déjà utilisé par un autre compte.');
      } else {
        const errorMessage = err?.message || 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
        setError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Layout>
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Show when={error()}>
          <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error()}</p>
          </div>
        </Show>

        <Show when={isLoading()}>
          <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-gray-500 text-lg">Chargement du profil...</p>
          </div>
        </Show>

        <Show when={!isLoading() && profile()}>
          <div class="space-y-6">
            {/* En-tête du profil */}
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
                <button
                  onClick={() => isEditing() ? setIsEditing(false) : setIsEditing(true)}
                  class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  aria-label={isEditing() ? 'Annuler la modification' : 'Modifier le profil'}
                >
                  {isEditing() ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              <Show when={!isEditing()}>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                    <p class="text-gray-900">{profile()?.username}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p class="text-gray-900">{profile()?.email}</p>
                  </div>
                  <Show when={profile()?.city || profile()?.postalCode || profile()?.region || profile()?.country}>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                      <div class="flex items-center gap-2 text-gray-900">
                        <svg
                          class="w-5 h-5 text-gray-400"
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
                        <span>
                          {profile()?.city && `${profile()?.city}`}
                          {profile()?.postalCode && (profile()?.city ? `, ${profile()?.postalCode}` : profile()?.postalCode)}
                          {profile()?.region && (profile()?.city || profile()?.postalCode ? `, ${profile()?.region}` : profile()?.region)}
                          {profile()?.country && (profile()?.city || profile()?.postalCode || profile()?.region ? `, ${profile()?.country}` : profile()?.country)}
                        </span>
                      </div>
                    </div>
                  </Show>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Membre depuis</label>
                    <p class="text-gray-900">{profile()?.createdAt ? formatDate(profile()!.createdAt) : '-'}</p>
                  </div>
                </div>
              </Show>

              <Show when={isEditing()}>
                <div class="space-y-4">
                  <div>
                    <label for="profile-username" class="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      id="profile-username"
                      type="text"
                      value={username()}
                      onInput={(e) => {
                        setUsername(e.currentTarget.value);
                        if (errors().username) setErrors({ ...errors(), username: '' });
                      }}
                      class={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors().username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      maxLength={50}
                    />
                    <Show when={errors().username}>
                      <p class="mt-1 text-sm text-red-600">{errors().username}</p>
                    </Show>
                  </div>

                  <div>
                    <label for="profile-email" class="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={email()}
                      onInput={(e) => {
                        setEmail(e.currentTarget.value);
                        if (errors().email) setErrors({ ...errors(), email: '' });
                      }}
                      class={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors().email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <Show when={errors().email}>
                      <p class="mt-1 text-sm text-red-600">{errors().email}</p>
                    </Show>
                  </div>

                  <LocationFields
                    country={profile()?.country}
                    region={profile()?.region}
                    city={profile()?.city}
                    postalCode={profile()?.postalCode}
                    onLocationChange={setLocationData}
                    disabled={isSaving()}
                  />

                  <button
                    onClick={handleSave}
                    disabled={isSaving()}
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-busy={isSaving()}
                  >
                    {isSaving() ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </Show>
            </div>

            {/* Statistiques */}
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Statistiques</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <p class="text-3xl font-bold text-blue-600">{profile()?.offersCount || 0}</p>
                  <p class="text-sm text-gray-600 mt-1">Offres publiées</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <p class="text-3xl font-bold text-green-600">
                    {profile()?.offers.filter(o => o.type === 'service').length || 0}
                  </p>
                  <p class="text-sm text-gray-600 mt-1">Services</p>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                  <p class="text-3xl font-bold text-purple-600">
                    {profile()?.offers.filter(o => o.type === 'objet').length || 0}
                  </p>
                  <p class="text-sm text-gray-600 mt-1">Objets</p>
                </div>
              </div>
            </div>

            {/* Historique des offres */}
            <div>
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">Mes offres</h2>
              <Show when={profile()?.offers && profile()!.offers.length === 0}>
                <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p class="text-gray-500 text-lg">Vous n'avez pas encore publié d'offre</p>
                  <button
                    onClick={() => navigate('/')}
                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Publier ma première offre
                  </button>
                </div>
              </Show>

              <Show when={profile()?.offers && profile()!.offers.length > 0}>
                <div class="space-y-4">
                  <For each={profile()!.offers}>
                    {(offer) => (
                      <OfferCard
                        offer={offer}
                        onEdit={(o) => {
                          navigate('/');
                          // Le formulaire d'édition sera géré par HomePage
                        }}
                        onDelete={async (id) => {
                          try {
                            await apiService.deleteOffer(id);
                            await loadProfile();
                          } catch (err) {
                            console.error('Error deleting offer:', err);
                          }
                        }}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </Layout>
  );
};

export default ProfilePage;

