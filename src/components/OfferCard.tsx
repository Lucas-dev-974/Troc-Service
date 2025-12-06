import { Component, Show } from 'solid-js';
import type { Offer } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface OfferCardProps {
  offer: Offer;
  onEdit?: (offer: Offer) => void;
  onDelete?: (id: number) => void;
  onValidate?: (id: number) => void;
}

const OfferCard: Component<OfferCardProps> = (props) => {
  const auth = useAuth();
  const isOwner = () => {
    return auth.isAuthenticated() && auth.user()?.id === props.offer.userId;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'service':
        return 'Service';
      case 'objet':
        return 'Objet';
      case 'nourriture':
        return 'Nourriture';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'bg-purple-100 text-purple-700';
      case 'objet':
        return 'bg-green-100 text-green-700';
      case 'nourriture':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <article 
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
      aria-labelledby={`offer-title-${props.offer.id}`}
    >
      <div class="flex items-start justify-between mb-3">
        <span class={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(props.offer.type)}`}>
          {getTypeLabel(props.offer.type)}
        </span>
        <span class="text-xs text-gray-500">{formatDate(props.offer.createdAt)}</span>
      </div>
      
      <h3 id={`offer-title-${props.offer.id}`} class="text-xl font-semibold text-gray-800 mb-2">{props.offer.title}</h3>
      
      <p class="text-gray-600 mb-4 leading-relaxed">{props.offer.description}</p>

      <Show when={props.offer.city || props.offer.region || props.offer.postalCode}>
        <div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {[props.offer.city, props.offer.postalCode, props.offer.region].filter(Boolean).join(', ')}
          </span>
        </div>
      </Show>
      
      <div class="pt-4 border-t border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-sm text-gray-700">{props.offer.author}</span>
          </div>
          
        <a
          href={props.offer.contact.includes('@') ? `mailto:${props.offer.contact}` : `tel:${props.offer.contact}`}
          class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          aria-label={`Contacter ${props.offer.author} par ${props.offer.contact.includes('@') ? 'email' : 'téléphone'}`}
        >
          Contacter
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
        </div>

        <Show when={isOwner() && (props.onEdit || props.onDelete || props.onValidate)}>
          <div class="flex gap-2 pt-2 border-t border-gray-100">
            <Show when={props.onValidate && !props.offer.validated}>
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir valider cette offre ? Elle ne sera plus visible dans les recherches.')) {
                    props.onValidate?.(props.offer.id);
                  }
                }}
                class="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                aria-label={`Valider l'offre: ${props.offer.title}`}
              >
                Valider
              </button>
            </Show>
            <Show when={props.offer.validated}>
              <div class="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg text-center">
                ✓ Validée
              </div>
            </Show>
            <Show when={props.onEdit}>
              <button
                onClick={() => props.onEdit?.(props.offer)}
                class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                aria-label={`Modifier l'offre: ${props.offer.title}`}
              >
                Modifier
              </button>
            </Show>
            <Show when={props.onDelete}>
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
                    props.onDelete?.(props.offer.id);
                  }
                }}
                class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                aria-label={`Supprimer l'offre: ${props.offer.title}`}
              >
                Supprimer
              </button>
            </Show>
          </div>
        </Show>
      </div>
    </article>
  );
};

export default OfferCard;

