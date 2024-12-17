// 默认设置
const defaultRules = {
  enabled: true,
  defaultCursor: 'default',
  hoverCursor: 'pointer',
  textCursor: 'text'
};

console.log('Background script loaded');

// 保持 service worker 活跃
const keepAlive = () => {
  chrome.runtime.connect({ name: 'keepAlive' });
  // 每 20 秒ping一次
  setTimeout(keepAlive, 20000);
};
keepAlive();

// 初始化函数
async function initializeRules() {
  try {
    console.log('Checking existing rules...');
    const data = await chrome.storage.local.get('cursorRules');
    console.log('Current data:', data);
    
    if (!data.cursorRules) {
      console.log('No existing rules found, initializing defaults...');
      await chrome.storage.local.set({cursorRules: defaultRules});
      const verification = await chrome.storage.local.get('cursorRules');
      console.log('Rules after initialization:', verification);
    } else {
      console.log('Existing rules found:', data.cursorRules);
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// 立即初始化
initializeRules();

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  initializeRules().catch(console.error);
});

// 监听来自popup和content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.type === 'GET_RULES') {
    chrome.storage.local.get('cursorRules', (data) => {
      const rules = data.cursorRules || defaultRules;
      console.log('Sending rules:', rules);
      sendResponse(rules);
    });
    return true; // 保持消息通道开启
  }
  
  if (request.type === 'UPDATE_RULES') {
    chrome.storage.local.set({cursorRules: request.rules}, () => {
      console.log('Rules updated:', request.rules);
      // 通知所有标签页更新规则
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'APPLY_RULES',
            rules: request.rules
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Failed to send rules to tab:', chrome.runtime.lastError);
            }
          });
        });
      });
      sendResponse({success: true});
    });
    return true;
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId);
    chrome.storage.local.get('cursorRules', (data) => {
      const rules = data.cursorRules || defaultRules;
      console.log('Sending rules to updated tab:', rules);
      chrome.tabs.sendMessage(tabId, {
        type: 'APPLY_RULES',
        rules: rules
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Failed to send rules to tab:', chrome.runtime.lastError);
        }
      });
    });
  }
}); 