import { Component, createSignal } from 'solid-js';
import type { OfferType } from '../services/api';

interface SearchAndSortProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: 'date' | 'title' | 'author';
  onSortByChange: (sortBy: 'date' | 'title' | 'author') => void;
  sortOrder: 'ASC' | 'DESC';
  onSortOrderChange: (sortOrder: 'ASC' | 'DESC') => void;
}

const SearchAndSort: Component<SearchAndSortProps> = (props) => {
  return (
    <div class="space-y-4">
      {/* Barre de recherche */}
      <div class="relative">
        <label for="search-input" class="sr-only">Rechercher des offres</label>
        <input
          id="search-input"
          type="search"
          value={props.search}
          onInput={(e) => props.onSearchChange(e.currentTarget.value)}
          placeholder="Rechercher par titre, description ou auteur..."
          class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          aria-label="Rechercher des offres"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Tri */}
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Trier par:</label>
          <label for="sort-by" class="sr-only">Trier par</label>
          <select
            id="sort-by"
            value={props.sortBy}
            onChange={(e) => props.onSortByChange(e.currentTarget.value as 'date' | 'title' | 'author')}
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            aria-label="Trier les offres par"
          >
            <option value="date">Date</option>
            <option value="title">Titre</option>
            <option value="author">Auteur</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Ordre:</label>
          <button
            onClick={() => props.onSortOrderChange(props.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-1"
            aria-label={`Ordre de tri: ${props.sortOrder === 'ASC' ? 'croissant' : 'décroissant'}`}
          >
            <span aria-hidden="true">{props.sortOrder === 'ASC' ? '↑' : '↓'}</span>
            {props.sortOrder === 'ASC' ? 'Croissant' : 'Décroissant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndSort;

