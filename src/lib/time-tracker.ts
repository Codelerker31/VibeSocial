export function initTimeTracker(projectId: string) {
  let startTime = Date.now();
  let totalTime = 0;
  let isActive = true;

  const sendTime = () => {
    if (totalTime > 0 || (isActive && Date.now() - startTime > 0)) {
      if (isActive) {
        totalTime += Date.now() - startTime;
        startTime = Date.now(); // Reset start time so we don't double count
      }
      
      const data = {
        timeSpent: Math.round(totalTime / 1000), // seconds
        referrer: document.referrer,
      };
      
      // Use sendBeacon for reliability on unload
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(`/api/projects/${projectId}/view`, blob);
      
      totalTime = 0; 
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isActive = false;
      totalTime += Date.now() - startTime;
    } else {
      isActive = true;
      startTime = Date.now();
    }
  };

  const handleBeforeUnload = () => {
    sendTime();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    sendTime();
  };
}
