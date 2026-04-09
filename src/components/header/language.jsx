import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { englishFlag, arabicFlag, usFlag } from '../../utils/imagepath';

const Language = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );

  const languages = [
    {
      flagname: 'English (UK)',
      icon: englishFlag,
      value: 'en',
    },
    {
      flagname: 'عربي (Arabic)',
      icon: arabicFlag,
      value: 'ar',
    },
    {
      flagname: 'français (French)',
      icon: usFlag, // Replace with actual French flag
      value: 'fr',
    },
  ];

  const currentLang = languages.find((lang) => lang.value === currentLanguage) || languages[0];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('selectedLanguage', lng);

    // Update document direction for RTL languages
    if (lng === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lng);
      document.body.classList.remove('rtl');
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    if (savedLanguage !== i18n.language) {
      handleLanguageChange(savedLanguage);
    }
  }, []);

  return (
    <li className="nav-item dropdown has-arrow flag-nav nav-item-box">
      <Link
        className="nav-link dropdown-toggle"
        data-bs-toggle="dropdown"
        to="#"
        role="button"
        aria-label="Change Language"
      >
        <img src={currentLang.icon} alt={currentLang.value} height={16} />
      </Link>
      <div className="dropdown-menu dropdown-menu-right">
        {languages.map((option, index) => (
          <Link
            key={index}
            to="#"
            className={`dropdown-item ${currentLanguage === option.value ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleLanguageChange(option.value);
            }}
          >
            <img src={option.icon} alt={option.flagname} height={16} className="me-2" />
            {option.flagname}
          </Link>
        ))}
      </div>
    </li>
  );
};

export default Language;
