// Storage utility for managing drafts, settings, and data persistence

const STORAGE_KEYS = {
  DRAFTS: 'linkedin_autopilot_drafts',
  SETTINGS: 'linkedin_autopilot_settings',
  GITHUB_DATA: 'linkedin_autopilot_github',
};

// Default settings
const DEFAULT_SETTINGS = {
  groqApiKey: '',
  githubUsername: '',
  defaultTone: 'professional',
  autoSchedule: false,
  postFrequency: 'weekly',
};

// Get all drafts
export const getDrafts = () => {
  try {
    const drafts = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    return drafts ? JSON.parse(drafts) : [];
  } catch (error) {
    console.error('Error getting drafts:', error);
    return [];
  }
};

// Save a new draft
export const saveDraft = (draft) => {
  try {
    const drafts = getDrafts();
    const newDraft = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      ...draft,
    };
    drafts.unshift(newDraft);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    return newDraft;
  } catch (error) {
    console.error('Error saving draft:', error);
    return null;
  }
};

// Update a draft
export const updateDraft = (id, updates) => {
  try {
    const drafts = getDrafts();
    const index = drafts.findIndex((d) => d.id === id);
    if (index !== -1) {
      drafts[index] = { ...drafts[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
      return drafts[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating draft:', error);
    return null;
  }
};

// Delete a draft
export const deleteDraft = (id) => {
  try {
    const drafts = getDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};

// Get settings
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save settings
export const saveSettings = (settings) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving settings:', error);
    return null;
  }
};

// Get GitHub data
export const getGitHubData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GITHUB_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting GitHub data:', error);
    return null;
  }
};

// Save GitHub data
export const saveGitHubData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GITHUB_DATA, JSON.stringify({
      ...data,
      fetchedAt: new Date().toISOString(),
    }));
    return true;
  } catch (error) {
    console.error('Error saving GitHub data:', error);
    return false;
  }
};

// Clear GitHub data
export const clearGitHubData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GITHUB_DATA);
    // Also clear GitHub-related settings
    const settings = getSettings();
    saveSettings({ 
      ...settings,
      githubUsername: '',
      githubToken: '' 
    });
    return true;
  } catch (error) {
    console.error('Error clearing GitHub data:', error);
    return false;
  }
};

// Export all data
export const exportData = () => {
  return {
    drafts: getDrafts(),
    settings: getSettings(),
    githubData: getGitHubData(),
    exportedAt: new Date().toISOString(),
  };
};

// Import data
export const importData = (data) => {
  try {
    if (data.drafts) {
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(data.drafts));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    if (data.githubData) {
      localStorage.setItem(STORAGE_KEYS.GITHUB_DATA, JSON.stringify(data.githubData));
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_DATA);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
