/*global chrome*/

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { ACTIONS } from './constants';

function App() {
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['selectionModeActive'], (result) => {
      if (result.selectionModeActive !== undefined) {
        setIsSelectionModeActive(result.selectionModeActive);
      }
    });
  }, []);

  const toggleSelectionMode = () => {
    const newStatus = !isSelectionModeActive;
    setIsSelectionModeActive(newStatus);
    chrome.storage.local.set({ selectionModeActive: newStatus }, () => {
      chrome.runtime.sendMessage({ action: newStatus ? ACTIONS.ENABLE_SELECTION_MODE : ACTIONS.DISABLE_SELECTION_MODE });
    });
  };

  return (
    <div className="popup-container container text-center mt-4">

      <img src="/images/logo512.png" alt="alt" className="w-25" />
      <h1 className="mb-4">Sélectionneur d&apos;élément</h1>
      <button
        className={`btn ${isSelectionModeActive ? 'btn-danger' : 'btn-primary'} btn-lg`}
        onClick={toggleSelectionMode}
      >
        {isSelectionModeActive ? 'Désactiver' : 'Activer'}
      </button>
    </div>
  );
}

export default App;
