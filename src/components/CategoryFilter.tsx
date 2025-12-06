import { Component } from 'solid-js';
import type { OfferType } from '../services/api';

interface CategoryFilterProps {
  selectedType: OfferType | 'all';
  onTypeChange: (type: OfferType | 'all') => void;
}

const CategoryFilter: Component<CategoryFilterProps> = (props) => {
  const categories: Array<{ value: OfferType | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'Tout', icon: '📋' },
    { value: 'service', label: 'Services', icon: '🔧' },
    { value: 'objet', label: 'Objets', icon: '📦' },
    { value: 'nourriture', label: 'Nourriture', icon: '🍎' },
  ];

  return (
    <div class="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          onClick={() => props.onTypeChange(category.value)}
          class={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
            props.selectedType === category.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          aria-pressed={props.selectedType === category.value}
          aria-label={`Filtrer par ${category.label.toLowerCase()}`}
        >
          <span class="mr-2" aria-hidden="true">{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;

