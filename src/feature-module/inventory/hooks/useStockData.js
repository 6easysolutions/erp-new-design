import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../../../services/inventoryService';

/**
 * useStockData Hook
 * Encapsulates data fetching logic, loading states, and error handling.
 * 
 * @param {string} initialFilter - Initial filter state (default: 'All')
 * @returns {Object} - { products, loading, error, activeFilter, setFilter, refreshData }
 */
export const useStockData = (initialFilter = 'All') => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState(initialFilter);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await inventoryService.getProductsByStatus(activeFilter);
            setProducts(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch inventory data.');
        } finally {
            setLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetFilter = (newFilter) => {
        setActiveFilter(newFilter);
    };

    return {
        products,
        loading,
        error,
        activeFilter,
        setFilter: handleSetFilter,
        refreshData: fetchData
    };
};
