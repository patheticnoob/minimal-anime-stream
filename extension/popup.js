// Check for connected gamepads
function updateStatus() {
  const gamepads = navigator.getGamepads();
  const statusEl = document.getElementById('status');
  
  let connected = false;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      statusEl.textContent = `✅ Connected: ${gamepads[i].id}`;
      connected = true;
      break;
    }
  }
  
  if (!connected) {
    statusEl.textContent = '❌ No controller detected';
  }
}

window.addEventListener('gamepadconnected', updateStatus);
window.addEventListener('gamepaddisconnected', updateStatus);

// Initial check
updateStatus();
setInterval(updateStatus, 1000);
