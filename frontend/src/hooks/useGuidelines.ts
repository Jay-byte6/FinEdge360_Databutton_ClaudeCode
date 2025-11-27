import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface UseGuidelinesReturn {
  shouldShowGuideline: (guidelineType: string) => boolean;
  markGuidelineAsSeen: (guidelineType: string, dontShowAgain: boolean) => Promise<void>;
  loading: boolean;
}

export const useGuidelines = (userId: string | null): UseGuidelinesReturn => {
  const [seenGuidelines, setSeenGuidelines] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load user's guideline preferences from backend
  useEffect(() => {
    const loadPreferences = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/routes/get-user-preferences/${userId}/guidelines`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const seen = new Set(data.seen_guidelines || []);
          setSeenGuidelines(seen);
        }
      } catch (error) {
        console.error('Error loading guideline preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [userId]);

  const shouldShowGuideline = (guidelineType: string): boolean => {
    // Don't show if user is not logged in
    if (!userId) return false;

    // Don't show if already seen and marked as "don't show again"
    return !seenGuidelines.has(guidelineType);
  };

  const markGuidelineAsSeen = async (
    guidelineType: string,
    dontShowAgain: boolean
  ): Promise<void> => {
    if (!userId) return;

    // Update local state
    if (dontShowAgain) {
      setSeenGuidelines((prev) => new Set([...prev, guidelineType]));
    }

    // Save to backend
    try {
      await fetch(`${API_BASE_URL}/routes/save-user-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          preference_type: 'guidelines',
          preference_value: {
            guideline_type: guidelineType,
            dont_show_again: dontShowAgain,
            seen_at: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('Error saving guideline preference:', error);
    }
  };

  return {
    shouldShowGuideline,
    markGuidelineAsSeen,
    loading,
  };
};
