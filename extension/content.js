// GojoStream Controller Support - Content Script
(function() {
  'use strict';

  let gamepadIndex = null;
  let lastButtonStates = {};
  let lastAxisStates = {};
  const AXIS_THRESHOLD = 0.3;
  const BUTTON_COOLDOWN = 300; // ms
  const lastButtonPress = {};

  // ... keep existing code (BUTTONS, AXES constants)

  console.log('🎮 GojoStream Controller Support Loaded');
  console.log('💡 IMPORTANT: Press ANY button on your controller to activate it!');

  // Create status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'controller-status';
  statusIndicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  statusIndicator.innerHTML = `
    <span style="font-size: 18px;">🎮</span>
    <span id="status-text">Waiting for controller...</span>
  `;
  
  // Add click handler to manually check
  statusIndicator.addEventListener('click', () => {
    console.log('🔍 Manual controller check triggered');
    checkForGamepads();
  });

  document.body.appendChild(statusIndicator);

  function updateStatus(text, color = '#ef4444') {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = text;
      statusText.style.color = color;
    }
  }

  function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 999998;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
      <div style="opacity: 0.8; font-size: 12px;">${message}</div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  function checkForGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    console.log('🔍 Checking for gamepads...', gamepads);
    
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        console.log('✅ Found gamepad:', gamepads[i].id, 'at index', i);
        gamepadIndex = i;
        updateStatus(`Connected: ${gamepads[i].id.substring(0, 30)}`, '#4ade80');
        showNotification('Controller Connected!', gamepads[i].id);
        startPolling();
        return true;
      }
    }
    
    console.log('❌ No gamepads found. Make sure to:');
    console.log('   1. Connect your controller (USB or Bluetooth)');
    console.log('   2. Press ANY button on the controller');
    console.log('   3. Click the status indicator to retry');
    return false;
  }

  // Listen for gamepad events
  window.addEventListener('gamepadconnected', (e) => {
    console.log('🎮 Gamepad connected event:', e.gamepad.id);
    gamepadIndex = e.gamepad.index;
    updateStatus(`Connected: ${e.gamepad.id.substring(0, 30)}`, '#4ade80');
    showNotification('Controller Connected!', e.gamepad.id);
    startPolling();
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    console.log('🎮 Gamepad disconnected:', e.gamepad.id);
    gamepadIndex = null;
    updateStatus('Controller disconnected', '#ef4444');
    showNotification('Controller Disconnected', 'Please reconnect your controller');
  });

  // Check immediately on load
  setTimeout(() => {
    if (!checkForGamepads()) {
      updateStatus('Press any controller button', '#fbbf24');
      showNotification('Controller Setup', 'Connect your controller and press any button to activate');
    }
  }, 1000);

  // Periodic check every 2 seconds
  setInterval(() => {
    if (gamepadIndex === null) {
      checkForGamepads();
    }
  }, 2000);

  // ... keep existing code (polling, button handlers, etc)

  function startPolling() {
    if (gamepadIndex === null) return;
    
    requestAnimationFrame(pollGamepad);
  }

  function pollGamepad() {
    if (gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad) {
      console.log('⚠️ Gamepad lost connection');
      gamepadIndex = null;
      updateStatus('Connection lost', '#ef4444');
      return;
    }

    // ... keep existing polling logic for buttons and axes

    requestAnimationFrame(pollGamepad);
  }

  // ... keep all existing button handler functions

})();
