// GojoStream Controller Support - Content Script
(function() {
  'use strict';

  let gamepadIndex = null;
  let lastButtonStates = {};
  let lastAxisStates = {};
  const AXIS_THRESHOLD = 0.3;
  const BUTTON_COOLDOWN = 300; // ms
  const lastButtonPress = {};
  let pollingInterval = null;

  // Controller button mapping
  const BUTTONS = {
    A: 0,           // Play/Pause, Select
    B: 1,           // Back/Close
    X: 2,           // Skip Intro/Outro
    Y: 3,           // Toggle Fullscreen
    LB: 4,          // Previous Episode
    RB: 5,          // Next Episode
    LT: 6,          // Volume Down
    RT: 7,          // Volume Up
    SELECT: 8,      // Settings
    START: 9,       // Menu
    L_STICK: 10,    // Toggle Subtitles
    R_STICK: 11,    // Toggle Quality
    DPAD_UP: 12,    // Navigate Up
    DPAD_DOWN: 13,  // Navigate Down
    DPAD_LEFT: 14,  // Seek Backward
    DPAD_RIGHT: 15  // Seek Forward
  };

  // Axis mapping
  const AXES = {
    LEFT_STICK_X: 0,
    LEFT_STICK_Y: 1,
    RIGHT_STICK_X: 2,
    RIGHT_STICK_Y: 3
  };

  console.log('🎮 GojoStream Controller Support Loaded');
  
  // Create status indicator
  function createStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'controller-status';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      z-index: 10000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    `;
    indicator.innerHTML = '🎮 Searching for controller...';
    document.body.appendChild(indicator);
    return indicator;
  }

  const statusIndicator = createStatusIndicator();

  // Update status indicator
  function updateStatus(message, color = '#fff') {
    if (statusIndicator) {
      statusIndicator.innerHTML = message;
      statusIndicator.style.color = color;
    }
  }

  // Check for gamepads immediately and periodically
  function checkForGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        console.log('🎮 Found gamepad:', gamepads[i].id);
        gamepadIndex = i;
        updateStatus(`🎮 ${gamepads[i].id}`, '#4ade80');
        startPolling();
        return true;
      }
    }
    return false;
  }

  // Initial check
  setTimeout(() => {
    if (!checkForGamepads()) {
      updateStatus('❌ No controller detected', '#ef4444');
      console.log('💡 Tip: Connect your controller and press any button');
    }
  }, 1000);

  // Periodic check every 2 seconds
  setInterval(() => {
    if (gamepadIndex === null) {
      checkForGamepads();
    }
  }, 2000);

  // Initialize gamepad detection
  window.addEventListener('gamepadconnected', (e) => {
    console.log('🎮 Gamepad connected:', e.gamepad.id);
    gamepadIndex = e.gamepad.index;
    updateStatus(`🎮 ${e.gamepad.id}`, '#4ade80');
    showNotification('Controller Connected', e.gamepad.id);
    startPolling();
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    console.log('🎮 Gamepad disconnected');
    gamepadIndex = null;
    updateStatus('❌ Controller disconnected', '#ef4444');
    showNotification('Controller Disconnected', 'Please reconnect your controller');
    stopPolling();
  });

  // Show notification
  function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 10000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 12px; opacity: 0.8;">${message}</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Start polling gamepad state
  function startPolling() {
    if (pollingInterval) return;
    pollingInterval = setInterval(pollGamepad, 16); // ~60fps
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  // Poll gamepad state
  function pollGamepad() {
    if (gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad) {
      gamepadIndex = null;
      updateStatus('❌ Controller disconnected', '#ef4444');
      stopPolling();
      return;
    }

    // Check buttons
    gamepad.buttons.forEach((button, index) => {
      const pressed = button.pressed;
      const wasPressed = lastButtonStates[index];

      if (pressed && !wasPressed) {
        handleButtonPress(index);
      }

      lastButtonStates[index] = pressed;
    });

    // Check axes
    gamepad.axes.forEach((value, index) => {
      const lastValue = lastAxisStates[index] || 0;
      
      if (Math.abs(value) > AXIS_THRESHOLD && Math.abs(lastValue) <= AXIS_THRESHOLD) {
        handleAxisChange(index, value);
      }

      lastAxisStates[index] = value;
    });
  }

  // Handle button press
  function handleButtonPress(buttonIndex) {
    const now = Date.now();
    if (lastButtonPress[buttonIndex] && now - lastButtonPress[buttonIndex] < BUTTON_COOLDOWN) {
      return;
    }
    lastButtonPress[buttonIndex] = now;

    console.log('🎮 Button pressed:', buttonIndex);

    const video = document.querySelector('video');
    
    switch(buttonIndex) {
      case BUTTONS.A:
        if (video) {
          video.paused ? video.play() : video.pause();
          showNotification('Playback', video.paused ? 'Paused' : 'Playing');
        }
        break;
      
      case BUTTONS.B:
        window.history.back();
        break;
      
      case BUTTONS.Y:
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
      
      case BUTTONS.DPAD_LEFT:
        if (video) {
          video.currentTime = Math.max(0, video.currentTime - 10);
          showNotification('Seek', '-10 seconds');
        }
        break;
      
      case BUTTONS.DPAD_RIGHT:
        if (video) {
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          showNotification('Seek', '+10 seconds');
        }
        break;
      
      case BUTTONS.LT:
        if (video) {
          video.volume = Math.max(0, video.volume - 0.1);
          showNotification('Volume', `${Math.round(video.volume * 100)}%`);
        }
        break;
      
      case BUTTONS.RT:
        if (video) {
          video.volume = Math.min(1, video.volume + 0.1);
          showNotification('Volume', `${Math.round(video.volume * 100)}%`);
        }
        break;
      
      case BUTTONS.START:
        window.location.href = '/';
        break;
    }
  }

  // Handle axis change
  function handleAxisChange(axisIndex, value) {
    console.log('🎮 Axis changed:', axisIndex, value);
    
    if (axisIndex === AXES.LEFT_STICK_Y) {
      window.scrollBy(0, value * 50);
    }
  }

  // Press any button to activate
  document.addEventListener('click', () => {
    if (gamepadIndex === null) {
      checkForGamepads();
    }
  }, { once: true });

})();
