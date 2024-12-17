// 加载设置
console.log('Popup opened, loading settings');
chrome.storage.local.get('cursorRules', (data) => {
  console.log('Loaded settings:', data);
  const rules = data.cursorRules;
  document.getElementById('enabled').checked = rules.enabled;
  document.getElementById('defaultCursor').value = rules.defaultCursor;
  document.getElementById('hoverCursor').value = rules.hoverCursor;
  document.getElementById('textCursor').value = rules.textCursor;
});

// 保存设置
document.getElementById('save').addEventListener('click', () => {
  const rules = {
    enabled: document.getElementById('enabled').checked,
    defaultCursor: document.getElementById('defaultCursor').value,
    hoverCursor: document.getElementById('hoverCursor').value,
    textCursor: document.getElementById('textCursor').value
  };
  
  console.log('Saving rules:', rules);
  
  // 保存到storage
  chrome.storage.local.set({cursorRules: rules}, () => {
    console.log('Rules saved to storage');
    // 通知所有标签页更新规则
    chrome.tabs.query({}, (tabs) => {
      console.log('Updating rules in', tabs.length, 'tabs');
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_RULES',
          rules: rules
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Failed to update tab', tab.id, chrome.runtime.lastError);
          }
        });
      });
    });
    
    // 显示保存成功提示
    const status = document.createElement('div');
    status.textContent = '设置已保存';
    status.style.color = 'green';
    status.style.marginTop = '10px';
    document.body.appendChild(status);
    setTimeout(() => status.remove(), 2000);
  });
}); 