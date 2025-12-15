// GojoStream Controller Support - Content Script
(function() {
  'use strict';

  let gamepadIndex = null;
  let lastButtonStates = {};
  let lastAxisStates = {};
  const AXIS_THRESHOLD = 0.3;
  const BUTTON_COOLDOWN = 300; // ms
  const lastButtonPress = {};

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

  // Initialize gamepad detection
  window.addEventListener('gamepadconnected', (e) => {
    console.log('🎮 Gamepad connected:', e.gamepad.id);
    gamepadIndex = e.gamepad.index;
    showNotification('Controller Connected', e.gamepad.id);
    startPolling();
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    console.log('🎮 Gamepad disconnected');
    showNotification('Controller Disconnected', 'Controller has been removed');
    gamepadIndex = null;
  });

  function showNotification(title, message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    toast.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">🎮 ${title}</div>
      <div style="font-size: 14px; opacity: 0.8;">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function canPressButton(buttonIndex) {
    const now = Date.now();
    if (lastButtonPress[buttonIndex] && now - lastButtonPress[buttonIndex] < BUTTON_COOLDOWN) {
      return false;
    }
    lastButtonPress[buttonIndex] = now;
    return true;
  }

  function getVideoElement() {
    return document.querySelector('video');
  }

  function handleButtonPress(buttonIndex) {
    if (!canPressButton(buttonIndex)) return;

    const video = getVideoElement();

    switch(buttonIndex) {
      case BUTTONS.A:
        // Play/Pause or click focused element
        if (video) {
          if (video.paused) {
            video.play();
            showNotification('Play', '▶️');
          } else {
            video.pause();
            showNotification('Pause', '⏸️');
          }
        } else {
          // Click focused element
          const focused = document.activeElement;
          if (focused && focused.tagName !== 'BODY') {
            focused.click();
          }
        }
        break;

      case BUTTONS.B:
        // Back/Close
        const closeBtn = document.querySelector('[aria-label="Close"]') || 
                        document.querySelector('button[class*="close"]');
        if (closeBtn) {
          closeBtn.click();
        } else {
          window.history.back();
        }
        break;

      case BUTTONS.X:
        // Skip Intro/Outro
        const skipBtn = document.querySelector('button[class*="skip"]');
        if (skipBtn) {
          skipBtn.click();
          showNotification('Skip', '⏭️');
        }
        break;

      case BUTTONS.Y:
        // Toggle Fullscreen
        if (video) {
          if (!document.fullscreenElement) {
            video.requestFullscreen();
            showNotification('Fullscreen', 'Enabled');
          } else {
            document.exitFullscreen();
            showNotification('Fullscreen', 'Disabled');
          }
        }
        break;

      case BUTTONS.LB:
        // Previous Episode
        const prevBtn = document.querySelector('button[aria-label*="Previous"]') ||
                       document.querySelector('button[class*="prev"]');
        if (prevBtn) {
          prevBtn.click();
          showNotification('Previous', '⏮️');
        }
        break;

      case BUTTONS.RB:
        // Next Episode
        const nextBtn = document.querySelector('button[aria-label*="Next"]') ||
                       document.querySelector('button[class*="next"]');
        if (nextBtn) {
          nextBtn.click();
          showNotification('Next', '⏭️');
        }
        break;

      case BUTTONS.LT:
        // Volume Down
        if (video) {
          video.volume = Math.max(0, video.volume - 0.1);
          showNotification('Volume', `${Math.round(video.volume * 100)}%`);
        }
        break;

      case BUTTONS.RT:
        // Volume Up
        if (video) {
          video.volume = Math.min(1, video.volume + 0.1);
          showNotification('Volume', `${Math.round(video.volume * 100)}%`);
        }
        break;

      case BUTTONS.SELECT:
        // Settings
        const settingsBtn = document.querySelector('button[aria-label*="Settings"]') ||
                           document.querySelector('button[class*="settings"]');
        if (settingsBtn) {
          settingsBtn.click();
        }
        break;

      case BUTTONS.START:
        // Menu/Home
        window.location.href = '/';
        break;

      case BUTTONS.L_STICK:
        // Toggle Subtitles
        const subsBtn = document.querySelector('button[aria-label*="Subtitle"]') ||
                       document.querySelector('button[class*="subtitle"]');
        if (subsBtn) {
          subsBtn.click();
          showNotification('Subtitles', 'Toggled');
        }
        break;

      case BUTTONS.DPAD_UP:
        // Navigate Up
        navigateFocus('up');
        break;

      case BUTTONS.DPAD_DOWN:
        // Navigate Down
        navigateFocus('down');
        break;

      case BUTTONS.DPAD_LEFT:
        // Seek Backward
        if (video) {
          video.currentTime = Math.max(0, video.currentTime - 10);
          showNotification('Seek', '-10s');
        }
        break;

      case BUTTONS.DPAD_RIGHT:
        // Seek Forward
        if (video) {
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          showNotification('Seek', '+10s');
        }
        break;
    }
  }

  function navigateFocus(direction) {
    const focusable = Array.from(document.querySelectorAll(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    )).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    const current = document.activeElement;
    const currentIndex = focusable.indexOf(current);

    if (direction === 'down' && currentIndex < focusable.length - 1) {
      focusable[currentIndex + 1].focus();
    } else if (direction === 'up' && currentIndex > 0) {
      focusable[currentIndex - 1].focus();
    } else if (currentIndex === -1 && focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function handleAxisMovement(axisIndex, value) {
    const video = getVideoElement();

    // Left stick Y-axis for scrolling
    if (axisIndex === AXES.LEFT_STICK_Y && Math.abs(value) > AXIS_THRESHOLD) {
      window.scrollBy(0, value * 20);
    }

    // Right stick X-axis for seeking
    if (axisIndex === AXES.RIGHT_STICK_X && Math.abs(value) > AXIS_THRESHOLD && video) {
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + value * 2));
    }
  }

  function pollGamepad() {
    if (gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad) return;

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
      
      if (Math.abs(value) > AXIS_THRESHOLD || Math.abs(lastValue) > AXIS_THRESHOLD) {
        handleAxisMovement(index, value);
      }

      lastAxisStates[index] = value;
    });
  }

  let pollingInterval;
  function startPolling() {
    if (pollingInterval) return;
    pollingInterval = setInterval(pollGamepad, 16); // ~60fps
  }

  // Check for already connected gamepads
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepadIndex = i;
      console.log('🎮 Gamepad already connected:', gamepads[i].id);
      showNotification('Controller Detected', gamepads[i].id);
      startPolling();
      break;
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();
