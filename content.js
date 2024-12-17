// 在文件开头添加
console.log('Content script loaded');

// 应用光标规则
function applyCursorRules(rules, retryCount = 0) {
  console.log('Applying rules:', rules);
  
  if (!rules || !rules.enabled) {
    console.log('Rules are disabled or invalid, skipping...');
    return;
  }
  
  // 确保 document.head 存在
  if (!document.head) {
    if (retryCount < 3) {
      console.log('Document head not ready, retrying...');
      setTimeout(() => applyCursorRules(rules, retryCount + 1), 100);
      return;
    }
    console.error('Failed to find document head after retries');
    return;
  }
  
  // 移除旧的样式（如果存在）
  const oldStyle = document.getElementById('cursor-rules-style');
  if (oldStyle) {
    console.log('Removing old style');
    oldStyle.remove();
  }
  
  // 创建样式表
  const style = document.createElement('style');
  style.id = 'cursor-rules-style';
  style.textContent = `
    * {
      cursor: ${rules.defaultCursor} !important;
    }
    a, button, [role="button"] {
      cursor: ${rules.hoverCursor} !important;
    }
    input, textarea {
      cursor: ${rules.textCursor} !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('New style applied:', style.textContent);
}

// 请求并应用初始规则
function requestAndApplyRules() {
  console.log('Requesting rules...');
  chrome.runtime.sendMessage({type: 'GET_RULES'}, (rules) => {
    console.log('Received rules:', rules);
    if (chrome.runtime.lastError) {
      console.error('Error getting rules:', chrome.runtime.lastError);
      setTimeout(requestAndApplyRules, 1000);
      return;
    }
    if (rules) {
      applyCursorRules(rules);
    } else {
      console.warn('No rules received');
    }
  });
}

// 在页面加载完成后请求规则
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', requestAndApplyRules);
} else {
  requestAndApplyRules();
}

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.type === 'APPLY_RULES') {
    applyCursorRules(request.rules);
    sendResponse({success: true});
    return true;
  }
  
  if (request.type === 'UPDATE_RULES') {
    applyCursorRules(request.rules);
    sendResponse({success: true});
    return true;
  }
});

// 定期检查规则是否正确应用
setInterval(() => {
  const style = document.getElementById('cursor-rules-style');
  if (!style) {
    console.log('Style element missing, requesting rules again...');
    requestAndApplyRules();
  }
}, 5000); 