import { Component } from 'solid-js';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: Component<PaginationProps> = (props) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const total = props.totalPages;
    const current = props.currentPage;

    if (total <= 7) {
      // Afficher toutes les pages si moins de 7
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher avec ellipses
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 3; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  };

  return (
    <div class="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => props.onPageChange(props.currentPage - 1)}
        disabled={props.currentPage === 1}
        class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Page précédente"
      >
        Précédent
      </button>

      {getPageNumbers().map((page) => (
        page === '...' ? (
          <span class="px-2 text-gray-500">...</span>
        ) : (
          <button
            onClick={() => props.onPageChange(page as number)}
            class={`px-3 py-2 border rounded-lg transition ${
              page === props.currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            aria-label={`Page ${page}`}
            aria-current={page === props.currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => props.onPageChange(props.currentPage + 1)}
        disabled={props.currentPage === props.totalPages}
        class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Page suivante"
      >
        Suivant
      </button>
    </div>
  );
};

export default Pagination;

