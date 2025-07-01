import React, { useState, useEffect, useRef } from 'react';
import '../css/SearchableDropdown.css';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  getOptionLabel = (option) => option.name,
  getOptionValue = (option) => option.id,
  className = '',
  disabled = false,
  isLoading = false,
  error = null,
  renderOption = null,
  optionGroups = null,
  'aria-label': ariaLabel = 'Searchable dropdown'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options whenever search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedItem = listRef.current.children[focusedIndex];
      if (focusedItem) {
        focusedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleHeaderClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  const selectedOption = options.find(opt => getOptionValue(opt) === value);

  const renderOptionContent = (option) => {
    if (renderOption) {
      return renderOption(option);
    }
    return getOptionLabel(option);
  };

  const renderOptions = () => {
    if (isLoading) {
      return <div className="dropdown-item loading">Loading...</div>;
    }

    if (error) {
      return <div className="dropdown-item error">{error}</div>;
    }

    if (filteredOptions.length === 0) {
      return <div className="dropdown-item no-results">No results found</div>;
    }

    if (optionGroups) {
      return Object.entries(optionGroups).map(([groupName, groupOptions]) => (
        <div key={groupName} className="option-group">
          <div className="option-group-header">{groupName}</div>
          {groupOptions.map(option => (
            <div
              key={getOptionValue(option)}
              className={`dropdown-item ${focusedIndex === filteredOptions.indexOf(option) ? 'focused' : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={focusedIndex === filteredOptions.indexOf(option)}
            >
              {renderOptionContent(option)}
            </div>
          ))}
        </div>
      ));
    }

    return filteredOptions.map((option, index) => (
      <div
        key={getOptionValue(option)}
        className={`dropdown-item ${focusedIndex === index ? 'focused' : ''}`}
        onClick={() => handleSelect(option)}
        role="option"
        aria-selected={focusedIndex === index}
      >
        {renderOptionContent(option)}
      </div>
    ));
  };

  return (
    <div 
      className={`searchable-dropdown ${className} ${error ? 'error' : ''}`} 
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
    >
      <div
        className="dropdown-header"
        onClick={handleHeaderClick}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || (selectedOption ? getOptionLabel(selectedOption) : '')}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          aria-controls="dropdown-list"
        />
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <div 
          className="dropdown-list"
          ref={listRef}
          role="listbox"
          id="dropdown-list"
        >
          {renderOptions()}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown; 