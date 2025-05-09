import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchVacancies } from '../api';
import { setQuery, setNumVacancies, setRegion, setLoading, setError, setResults } from '../store/searchSlice';
import { RootState } from '../types';
import { regions } from '../constants/regions';
import './SearchForm.css';

const SearchForm: React.FC = () => {
  const dispatch = useDispatch();
  const { query, numVacancies, region } = useSelector((state: RootState) => state.search);
  const [filteredRegions, setFilteredRegions] = useState(regions);
  const [showRegions, setShowRegions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = regions.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRegions(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRegions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const results = await searchVacancies(query, region, numVacancies);
      dispatch(setResults(results));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Произошла ошибка'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRegionSelect = (regionId: string, regionName: string) => {
    dispatch(setRegion(regionId));
    setSearchTerm(regionName);
    setShowRegions(false);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className="form-control"
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          placeholder="Введите название вакансии"
          required
        />
      </div>
      <div className="form-group">
        <div className="region-input-container" ref={dropdownRef}>
          <input
            type="text"
            className="form-control"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowRegions(true);
            }}
            onFocus={() => setShowRegions(true)}
            placeholder="Выберите регион"
            required
          />
          {showRegions && (
            <div className="regions-dropdown">
              {filteredRegions.map((region) => (
                <div
                  key={region.id}
                  className="region-item"
                  onClick={() => handleRegionSelect(region.id, region.name)}
                >
                  {region.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="form-group">
        <input
          type="number"
          className="form-control"
          value={numVacancies}
          onChange={(e) => dispatch(setNumVacancies(Number(e.target.value)))}
          min="1"
          max="100"
          required
        />
      </div>
      <button type="submit" className="btn-primary">
        Найти
      </button>
    </form>
  );
};

export default SearchForm; 