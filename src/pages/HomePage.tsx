import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Layout from '../components/Layout';
import OfferForm from '../components/OfferForm';
import OfferCard from '../components/OfferCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchAndSort from '../components/SearchAndSort';
import LocationFilter from '../components/LocationFilter';
import Pagination from '../components/Pagination';
import { apiService, type Offer, type CreateOfferDto, type UpdateOfferDto, type SearchOptions, type PaginatedResult } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HomePage: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = createSignal<Offer[]>([]);
  const [pagination, setPagination] = createSignal({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [selectedType, setSelectedType] = createSignal<'all' | 'service' | 'objet' | 'nourriture'>('all');
  const [search, setSearch] = createSignal('');
  const [sortBy, setSortBy] = createSignal<'date' | 'title' | 'author'>('date');
  const [sortOrder, setSortOrder] = createSignal<'ASC' | 'DESC'>('DESC');
  const [locationFilter, setLocationFilter] = createSignal<{ country?: string; region?: string; city?: string; postalCode?: string }>({});
  const [useUserLocation, setUseUserLocation] = createSignal(true);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [editingOffer, setEditingOffer] = createSignal<Offer | null>(null);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Charger les offres au montage du composant
  onMount(async () => {
    await loadOffers();
  });

  const loadOffers = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      // Déterminer quelle localisation utiliser
      let locationToUse: { country?: string; region?: string; city?: string; postalCode?: string } | undefined;
      let shouldPrioritize = false;

      // Si des filtres de localisation sont définis, les utiliser
      const filterLocation = locationFilter();
      if (filterLocation.country || filterLocation.region || filterLocation.city || filterLocation.postalCode) {
        locationToUse = filterLocation;
        shouldPrioritize = true;
      } else if (useUserLocation() && auth.isAuthenticated()) {
        // Sinon, utiliser la localisation de l'utilisateur si disponible
        try {
          const profile = await apiService.getProfile();
          if (profile.country || profile.region || profile.city || profile.postalCode) {
            locationToUse = {
              country: profile.country,
              region: profile.region,
              city: profile.city,
              postalCode: profile.postalCode,
            };
            shouldPrioritize = true;
          }
        } catch (err) {
          // Ignorer l'erreur si le profil n'est pas disponible
          console.warn('Impossible de récupérer la localisation de l\'utilisateur:', err);
        }
      }

      const options: SearchOptions = {
        type: selectedType() === 'all' ? undefined : selectedType(),
        search: search() || undefined,
        sortBy: sortBy(),
        sortOrder: sortOrder(),
        page,
        limit: 20,
        // Ajouter la localisation pour le filtrage et la priorisation
        ...locationToUse,
        prioritizeByLocation: shouldPrioritize,
      };

      const result: PaginatedResult<Offer> = await apiService.getAllOffers(options);
      setOffers(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      console.error('Error loading offers:', err);
      const errorMessage = err?.message || 'Erreur lors du chargement des offres. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Recharger les offres quand le type change
  const handleTypeChange = (type: 'all' | 'service' | 'objet' | 'nourriture') => {
    setSelectedType(type);
    loadOffers(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    // Debounce pour éviter trop de requêtes
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadOffers(1), 500);
  };

  const handleSortChange = (newSortBy: 'date' | 'title' | 'author', newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    loadOffers(1);
  };

  const handleLocationFilterChange = (location: { country?: string; region?: string; city?: string; postalCode?: string }) => {
    setLocationFilter(location);
    setUseUserLocation(false); // Désactiver l'utilisation de la localisation utilisateur si un filtre manuel est défini
    loadOffers(1);
  };

  const handleLocationFilterClear = () => {
    setLocationFilter({});
    setUseUserLocation(true); // Réactiver l'utilisation de la localisation utilisateur
    loadOffers(1);
  };

  const handleAddOffer = async (offerData: CreateOfferDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.createOffer(offerData);
      await loadOffers(1); // Recharger la première page
    } catch (err: any) {
      console.error('Error creating offer:', err);
      if (err?.statusCode === 401 || err?.statusCode === 403) {
        setError('Vous devez être connecté pour publier une offre.');
        navigate('/login');
      } else {
        const errorMessage = err?.message || 'Erreur lors de la création de l\'offre. Veuillez réessayer.';
        setError(errorMessage);
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async (id: number, offerData: UpdateOfferDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.updateOffer(id, offerData);
      setEditingOffer(null);
      await loadOffers(pagination().page); // Recharger la page actuelle
    } catch (err: any) {
      console.error('Error updating offer:', err);
      if (err?.statusCode === 403) {
        setError('Vous n\'êtes pas autorisé à modifier cette offre.');
      } else {
        const errorMessage = err?.message || 'Erreur lors de la modification de l\'offre. Veuillez réessayer.';
        setError(errorMessage);
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    setError(null);
    try {
      await apiService.deleteOffer(id);
      await loadOffers(pagination().page); // Recharger la page actuelle
    } catch (err: any) {
      console.error('Error deleting offer:', err);
      if (err?.statusCode === 403) {
        setError('Vous n\'êtes pas autorisé à supprimer cette offre.');
      } else {
        const errorMessage = err?.message || 'Erreur lors de la suppression de l\'offre. Veuillez réessayer.';
        setError(errorMessage);
      }
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
  };

  return (
    <Layout>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Show when={error()}>
          <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error()}</p>
          </div>
        </Show>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div class="lg:col-span-1">
            <div class="sticky top-8">
              <Show
                when={auth.isAuthenticated()}
                fallback={
                  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <p class="text-gray-600 mb-4">Vous devez être connecté pour publier une offre</p>
                    <button
                      onClick={() => navigate('/login')}
                      class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                    >
                      Se connecter
                    </button>
                  </div>
                }
              >
                <Show
                  when={editingOffer()}
                  fallback={
                    <OfferForm onSubmit={handleAddOffer} isLoading={isSubmitting()} />
                  }
                >
                  <div>
                    <div class="mb-4 flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-800">Modifier l'offre</h3>
                      <button
                        onClick={() => setEditingOffer(null)}
                        class="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Annuler
                      </button>
                    </div>
                    <OfferForm
                      offer={editingOffer()!}
                      onUpdate={handleUpdateOffer}
                      isLoading={isSubmitting()}
                    />
                  </div>
                </Show>
              </Show>
            </div>
          </div>

          {/* Right Column - Offers List */}
          <div class="lg:col-span-2">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                Offres disponibles
                <Show when={pagination().total > 0}>
                  <span class="text-lg font-normal text-gray-500 ml-2">
                    ({pagination().total} {pagination().total === 1 ? 'offre' : 'offres'})
                  </span>
                </Show>
              </h2>
              <CategoryFilter
                selectedType={selectedType()}
                onTypeChange={handleTypeChange}
              />
              <div class="mt-4 space-y-4">
                <SearchAndSort
                  search={search()}
                  onSearchChange={handleSearchChange}
                  sortBy={sortBy()}
                  onSortByChange={(by) => {
                    setSortBy(by);
                    loadOffers(1);
                  }}
                  sortOrder={sortOrder()}
                  onSortOrderChange={(order) => {
                    setSortOrder(order);
                    loadOffers(1);
                  }}
                />
                <LocationFilter
                  country={locationFilter().country}
                  region={locationFilter().region}
                  city={locationFilter().city}
                  postalCode={locationFilter().postalCode}
                  onLocationChange={handleLocationFilterChange}
                  onClear={handleLocationFilterClear}
                />
              </div>
            </div>

            <Show when={isLoading()}>
              <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p class="text-gray-500 text-lg">Chargement des offres...</p>
              </div>
            </Show>

            <Show when={!isLoading() && offers().length === 0}>
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
                <p class="text-gray-500 text-lg">
                  {search()
                    ? `Aucune offre trouvée pour "${search()}".`
                    : selectedType() === 'all'
                      ? "Aucune offre pour le moment. Soyez le premier à proposer quelque chose !"
                      : `Aucune offre de type "${selectedType()}" pour le moment.`}
                </p>
              </div>
            </Show>

            <Show when={!isLoading() && offers().length > 0}>
              <div class="space-y-4">
                <For each={offers()}>
                  {(offer) => (
                    <OfferCard
                      offer={offer}
                      onEdit={handleEditOffer}
                      onDelete={handleDeleteOffer}
                    />
                  )}
                </For>
              </div>

              <Show when={pagination().totalPages > 1}>
                <Pagination
                  currentPage={pagination().page}
                  totalPages={pagination().totalPages}
                  onPageChange={(page) => loadOffers(page)}
                />
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;

