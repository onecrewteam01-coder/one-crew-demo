document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const cards = document.querySelectorAll('.card');
  const navTabs = document.querySelectorAll('.nav-tab');
  
  // Chat Elements
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const agentTabs = document.querySelectorAll('.agent-tab');
  const promptChips = document.querySelectorAll('.prompt-chip');
  
  // Terminal Elements
  const btnExecuteStream = document.getElementById('btnExecuteStream');
  const payloadTerminal = document.getElementById('payloadTerminal');
  
  // Metrics Tickers
  const latencyVal = document.getElementById('latencyVal');
  const memVal = document.getElementById('memVal');
  const miniLatencyText = document.getElementById('miniLatencyText');
  
  // Key Registry Elements
  const btnGenKey = document.getElementById('btnGenKey');
  const secRole = document.getElementById('secRole');
  const secKey = document.getElementById('secKey');
  const tokenList = document.getElementById('tokenList');
  const miniTokenText = document.getElementById('miniTokenText');
  
  // Canvases
  const liveChartCanvas = document.getElementById('liveMetricsChart');
  const sparklineCanvas = document.getElementById('miniSparklineCanvas');
  
  // --- State Variables ---
  let activeAgent = 'context';
  let isStreamActive = false;
  let streamIntervalId = null;
  let activeModule = 'dashboard';
  
  // Metrics Data History
  const maxDataPoints = 30;
  const latencyData = Array(maxDataPoints).fill(28);
  const memData = Array(maxDataPoints).fill(43);

  // --- 1. Module Allocation Map ---
  const moduleConfig = {
    dashboard: ['card-workspace-payload', 'card-system-metrics', 'card-business-vision', 'card-core-specs'],
    modules: ['card-core-modules', 'card-workspace-payload', 'card-business-vision', 'card-core-specs'],
    discovery: ['card-context-analyzer', 'card-competitive-edge', 'card-mvp-strategy', 'card-sync-build'],
    orchestrator: ['card-orchestrator-pipeline', 'card-orchestrator-steps', 'card-orchestrator-agents', 'card-orchestrator-history'],
    security: ['card-access-control', 'card-token-registry', 'card-session-monitor', 'card-encryption-keys', 'card-api-credentials'],
    documents: ['card-uploaded-docs', 'card-doc-pipeline', 'card-doc-categories', 'card-doc-upload-terminal'],
    actions: ['card-action-recommendations', 'card-action-execution-log', 'card-action-triggers', 'card-action-priority']
  };

  const allCardIds = [
    'card-agent-hub',
    'card-workspace-payload', 'card-system-metrics', 'card-business-vision', 'card-core-specs',
    'card-core-modules',
    'card-context-analyzer', 'card-competitive-edge', 'card-mvp-strategy', 'card-sync-build',
    'card-orchestrator-pipeline', 'card-orchestrator-steps', 'card-orchestrator-agents', 'card-orchestrator-history',
    'card-access-control', 'card-token-registry', 'card-session-monitor', 'card-encryption-keys', 'card-api-credentials',
    'card-uploaded-docs', 'card-doc-pipeline', 'card-doc-categories', 'card-doc-upload-terminal',
    'card-action-recommendations', 'card-action-execution-log', 'card-action-triggers', 'card-action-priority'
  ];

  // Activate Module function
  function activateModule(moduleName) {
    if (!moduleConfig[moduleName]) return;
    activeModule = moduleName;
    
    const mainCard = document.querySelector('.card.pos-main');
    const mainCardId = mainCard ? mainCard.id : 'card-agent-hub';
    
    let sections = [...moduleConfig[moduleName]];
    
    if (sections.includes(mainCardId)) {
      sections = sections.filter(id => id !== mainCardId);
      if (mainCardId !== 'card-agent-hub') {
        sections.push('card-agent-hub');
      } else {
        const fallback = allCardIds.find(id => id !== mainCardId && !sections.includes(id));
        if (fallback) sections.push(fallback);
      }
    }
    
    // Assign position classes dynamically
    cards.forEach(card => {
      if (card.id === mainCardId) {
        card.className = 'card pos-main';
        return;
      }
      
      const idx = sections.indexOf(card.id);
      if (idx !== -1) {
        card.className = `card pos-side-${idx + 1}`;
      } else {
        card.className = 'card pos-hidden';
      }
    });
    
    // Trigger canvas resizing
    setTimeout(resizeCanvases, 100);
  }

  // --- 2. Window Swapping Logic ---
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (card.classList.contains('pos-main')) return;
      if (
        e.target.closest('button') || 
        e.target.closest('input') || 
        e.target.closest('form') || 
        e.target.closest('pre') || 
        e.target.closest('select') ||
        e.target.closest('.clickable-module-card')
      ) return;
      
      const currentMain = document.querySelector('.card.pos-main');
      const clickedPosClass = Array.from(card.classList).find(c => c.startsWith('pos-side-'));
      
      if (currentMain && clickedPosClass) {
        currentMain.classList.remove('pos-main');
        currentMain.classList.add(clickedPosClass);
        
        card.classList.remove(clickedPosClass);
        card.classList.add('pos-main');
        
        setTimeout(resizeCanvases, 50);
        setTimeout(resizeCanvases, 700); // Redraw charts after transition settles
      }
    });
  });

  // --- 3. Bottom Modules Tab Event ---
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetModName = tab.getAttribute('data-module');
      if (targetModName === activeModule) return;
      
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      activateModule(targetModName);
    });
  });

  // --- 4. Interactive Chat Simulator ---
  const agents = {
    context: { name: 'Context Agent', char: 'C', intro: "Hello! I've loaded the startup profile directory. Ready to analyze context or structural payload metrics." },
    strategy: { name: 'Strategy Agent', char: 'S', intro: "Greetings. Node online. Ready to map MVP phases, competitor vectors, or business vision blueprints." },
    architecture: { name: 'Architecture Agent', char: 'A', intro: "System architect active. Ready to build sync targets, compile workspace graphs, or resolve backend payloads." }
  };

  // Switch Chat Tabs
  agentTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const agentType = tab.getAttribute('data-agent');
      if (agentType === activeAgent) return;
      
      agentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      activeAgent = agentType;
      appendSystemMessage(`${agents[agentType].name} activated.`);
      
      setTimeout(() => {
        appendAgentResponse(agentType, agents[agentType].intro);
      }, 400);
    });
  });

  // Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      chatInput.value = chip.getAttribute('data-prompt');
      chatInput.focus();
    });
  });

  // Chat Form Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;
    
    appendUserMessage(query);
    chatInput.value = '';
    
    setTimeout(() => {
      simulateAgentReply(query);
    }, 600);
  });

  function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.innerHTML = `<div class="message-text">${escapeHtml(text)}</div>`;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message system';
    msgDiv.innerHTML = `
      <div class="message-meta">SYSTEM UPDATE</div>
      <div class="message-text">${escapeHtml(text)}</div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendAgentResponse(agentKey, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message agent';
    msgDiv.setAttribute('data-agent', agentKey);
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const agent = agents[agentKey] || agents.context;
    
    msgDiv.innerHTML = `
      <div class="message-header">
        <span class="avatar chat-av">${agent.char}</span>
        <span class="agent-name">${agent.name}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-text"></div>
    `;
    
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
    
    const textContainer = msgDiv.querySelector('.message-text');
    let idx = 0;
    
    function typeChar() {
      if (idx < text.length) {
        textContainer.innerHTML += text.charAt(idx);
        idx++;
        scrollToBottom();
        setTimeout(typeChar, 8 + Math.random() * 10);
      }
    }
    typeChar();
  }

  function simulateAgentReply(query) {
    let targetAgent = activeAgent;
    let reply = "";
    
    if (query.includes('/analyze')) {
      targetAgent = 'context';
      reply = "Ingesting workspace profile logs... Found active payload modules. Cross-referencing confidence levels: Problem Understanding is high (95%). All schemas match backend definitions. Ready for strategy synthesis.";
    } else if (query.includes('/build')) {
      targetAgent = 'architecture';
      reply = "Initializing sync build for 'demo_profile'. Output maps configured. Emitting JSON manifest to workspace logs. Status: Completed compilation of MVP Architecture Node.";
    } else if (query.includes('/optimize')) {
      targetAgent = 'strategy';
      reply = "Latency metrics optimization routine launched. Routing pipeline through edge server tunnels. Core distribution balanced (9 nodes active). Expected latency decrease: ~12ms.";
    } else {
      reply = `Instruction received: "${query}". Processing in the cluster log lines. Let me know if you would like me to output the build payload or verify step status next.`;
    }
    
    appendAgentResponse(targetAgent, reply);
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Global Workspace Module Selector handler for index.html onclicks
  window.selectWorkspaceModule = function(moduleKey) {
    const formattedKey = moduleKey.toUpperCase();
    appendSystemMessage(`Selected Workspace Module Domain: [${formattedKey}]`);
    
    if (activeAgent !== 'context') {
      activeAgent = 'context';
      agentTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-agent') === 'context'));
    }
    
    setTimeout(() => {
      appendAgentResponse('context', `Domain [${formattedKey}] loaded into active memory buffer. Inspecting section parameters, milestones, and linked agent tasks...`);
    }, 300);
  };

  // --- 5. Workspace Payload Stream Simulator ---
  if (btnExecuteStream) {
    btnExecuteStream.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isStreamActive) {
        clearInterval(streamIntervalId);
        isStreamActive = false;
        btnExecuteStream.textContent = "Execute Stream";
        btnExecuteStream.classList.remove('active');
        appendSystemMessage("Payload stream terminated.");
      } else {
        isStreamActive = true;
        btnExecuteStream.textContent = "Streaming...";
        btnExecuteStream.classList.add('active');
        appendSystemMessage("Streaming live workspace payload packages...");
        
        let counter = 0;
        streamIntervalId = setInterval(() => {
          counter++;
          const randLatency = Math.floor(18 + Math.random() * 14);
          const randMem = Math.floor(41 + Math.random() * 6);
          const randConfidence = (0.91 + Math.random() * 0.07).toFixed(2);
          
          if (latencyVal) latencyVal.textContent = `${randLatency}ms`;
          if (memVal) memVal.textContent = `${randMem}%`;
          if (miniLatencyText) miniLatencyText.textContent = `${randLatency}ms`;
          
          latencyData.push(randLatency);
          latencyData.shift();
          memData.push(randMem);
          memData.shift();
          
          const timestamp = new Date().toISOString();
          if (payloadTerminal) {
            payloadTerminal.innerHTML = `<code>{
  "success": true,
  "data": {
    "id": "demo_profile",
    "createdAt": "${timestamp}",
    "status": "STREAMING_PKG_${counter}",
    "discoveryMeta": {
      "totalSteps": 8,
      "completedSteps": 8,
      "confidenceScores": {
        "problemUnderstanding": ${randConfidence},
        "targetAudience": 0.90,
        "productCategory": 0.92
      }
    },
    "networkStats": {
      "latencyMs": ${randLatency},
      "activeSockets": ${9 + (counter % 3)}
    }
  }
}</code>`;
          }
        }, 1000);
      }
    });
  }

  // --- 6. Discovery Step Interactive Actions ---
  const syncBuildCompileBtn = document.querySelector('#card-sync-build .action-btn');
  if (syncBuildCompileBtn) {
    syncBuildCompileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      appendSystemMessage("Initiated target bundle compilation via /api/discovery/build...");
      const termBody = document.querySelector('#card-sync-build .terminal-body');
      if (termBody) {
        termBody.innerHTML = `<code>// Target Node initialized. Compiling...
[BUILD] Resolving assets and agent configurations...
[COMPILING] bundle.main.js (142KB) -> minifying...
[COMPILING] bundle.styles.css (22KB) -> optimizing...
[SUCCESS] Target bundle sync complete (0 errors, 0 warnings).
[READY] Output written to /dist/release/v1.0.4.</code>`;
      }
    });
  }

  // --- 7. Interactive Key Generator ---
  if (btnGenKey) {
    btnGenKey.addEventListener('click', (e) => {
      e.stopPropagation();
      const roleValue = secRole ? secRole.value : 'master';
      const keyPrefix = (secKey ? secKey.value.trim() : '') || 'token_';
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fullToken = `${keyPrefix}${randomSuffix}`;
      
      const li = document.createElement('li');
      li.className = 'token-item';
      li.style.opacity = '0';
      li.style.transform = 'translateY(10px)';
      li.style.transition = 'all 0.3s ease';
      
      li.innerHTML = `
        <div class="tok-info">
          <span class="tok-name">${fullToken}</span>
          <span class="tok-role">${roleValue.toUpperCase()}</span>
        </div>
        <span class="tok-status active">ACTIVE</span>
      `;
      
      if (tokenList) tokenList.appendChild(li);
      
      const count = tokenList ? tokenList.querySelectorAll('.token-item').length : 0;
      if (miniTokenText) miniTokenText.textContent = `${count} Keys`;
      
      setTimeout(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
      }, 50);
      
      appendSystemMessage(`Registered key: ${fullToken}`);
    });
  }

  // --- 8. Document Tracker Interactive Handlers ---
  const docSearchInput = document.getElementById('docSearchInput');
  const docPills = document.querySelectorAll('.doc-pill');
  const docTableBody = document.getElementById('docTableBody');
  const btnTriggerDocUpload = document.getElementById('btnTriggerDocUpload');
  const btnSelectFile = document.getElementById('btnSelectFile');
  const docFileInput = document.getElementById('docFileInput');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const docIngestTerminal = document.getElementById('docIngestTerminal');
  const miniDocCount = document.getElementById('miniDocCount');

  if (docPills.length > 0 && docTableBody) {
    docPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        docPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        
        const filter = pill.getAttribute('data-doc-filter');
        const rows = docTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
          const category = row.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }

  if (docSearchInput && docTableBody) {
    docSearchInput.addEventListener('input', () => {
      const query = docSearchInput.value.toLowerCase().trim();
      const rows = docTableBody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  function handleSimulatedFileUpload(fileName, fileSize) {
    const timeStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const ext = fileName.split('.').pop().toUpperCase();
    let tagCategory = 'business';
    let tagLabel = 'BUSINESS';

    if (['MD', 'JSON', 'JS', 'PY'].includes(ext)) {
      tagCategory = 'technical';
      tagLabel = 'TECHNICAL';
    } else if (['XLSX', 'CSV'].includes(ext)) {
      tagCategory = 'discovery';
      tagLabel = 'DISCOVERY';
    }

    if (docTableBody) {
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-category', tagCategory);
      newRow.innerHTML = `
        <td><span class="doc-icon">📄</span> ${escapeHtml(fileName)}</td>
        <td><span class="doc-tag">${tagLabel}</span></td>
        <td>${fileSize}</td>
        <td>${timeStr}</td>
        <td><span class="tbl-badge green">INDEXED</span></td>
        <td><button class="action-btn mini-btn">View</button></td>
      `;
      docTableBody.insertBefore(newRow, docTableBody.firstChild);
    }

    if (miniDocCount) {
      const currentCount = docTableBody ? docTableBody.querySelectorAll('tr').length : 7;
      miniDocCount.textContent = `${currentCount} DOCS`;
    }

    if (docIngestTerminal) {
      docIngestTerminal.innerHTML = `<code>[INGEST_START] Ingesting file: ${fileName}...
[OCR_PARSE] Reading document structures & text blocks...
[EMBEDDINGS] Generating 128 vector embeddings via text-embedding-3-large...
[INDEX_COMPLETE] File successfully indexed in Context Vault!
[STATUS] Ready for agent querying.</code>`;
    }

    appendSystemMessage(`Document ingested: "${fileName}" (${fileSize}). Indexed into Onecrew context memory.`);
  }

  if (btnTriggerDocUpload) {
    btnTriggerDocUpload.addEventListener('click', (e) => {
      e.stopPropagation();
      if (docFileInput) docFileInput.click();
    });
  }

  if (btnSelectFile) {
    btnSelectFile.addEventListener('click', (e) => {
      e.stopPropagation();
      if (docFileInput) docFileInput.click();
    });
  }

  if (docFileInput) {
    docFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        handleSimulatedFileUpload(file.name, sizeMb);
      }
    });
  }

  if (uploadDropzone) {
    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = '#ffffff';
    });
    uploadDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'var(--panel-border)';
    });
    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'var(--panel-border)';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        handleSimulatedFileUpload(file.name, sizeMb);
      }
    });
  }

  // --- 9. Action Center Interactive Handlers ---
  const actionFilterPills = document.querySelectorAll('.action-filter-pill');
  const actionItemsList = document.getElementById('actionItemsList');
  const actionAuditLogBody = document.getElementById('actionAuditLogBody');
  const miniActionCount = document.getElementById('miniActionCount');

  if (actionFilterPills.length > 0 && actionItemsList) {
    actionFilterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        actionFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-action-filter');
        const items = actionItemsList.querySelectorAll('.action-item-card');

        items.forEach(item => {
          const prio = item.getAttribute('data-priority');
          if (filter === 'all' || prio === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  if (actionItemsList) {
    actionItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.action-exec-btn');
      if (!btn) return;
      e.stopPropagation();

      const actionKey = btn.getAttribute('data-action');
      const actionCard = btn.closest('.action-item-card');
      const actionTitle = actionCard ? actionCard.querySelector('h3').textContent : 'System Action';

      btn.textContent = "EXECUTED";
      btn.disabled = true;
      btn.style.background = "#ffffff";
      btn.style.color = "#000000";
      btn.style.borderColor = "#ffffff";

      if (actionCard) {
        actionCard.style.opacity = '0.65';
      }

      if (actionAuditLogBody) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <td>${now}</td>
          <td>${escapeHtml(actionTitle)}</td>
          <td>Action Center</td>
          <td>Executed via Console UI</td>
          <td><span class="tbl-badge green">SUCCESS</span></td>
        `;
        actionAuditLogBody.insertBefore(newRow, actionAuditLogBody.firstChild);
      }

      if (actionItemsList && miniActionCount) {
        const pendingBtns = actionItemsList.querySelectorAll('.action-exec-btn:not([disabled])');
        miniActionCount.textContent = `${pendingBtns.length} PENDING`;
      }

      appendSystemMessage(`Executed Action: "${actionTitle}". Workspace telemetry & agent logs updated.`);

      if (actionKey === 'sync-build') {
        const syncBuildBtn = document.querySelector('#card-sync-build .action-btn');
        if (syncBuildBtn) syncBuildBtn.click();
      } else if (actionKey === 'rotate-token') {
        const genKeyBtn = document.getElementById('btnGenKey');
        if (genKeyBtn) genKeyBtn.click();
      }
    });
  }

  // --- 10. Live Canvas Metrics Chart ---
  function resizeCanvases() {
    [liveChartCanvas, sparklineCanvas].forEach(canvas => {
      if (!canvas || canvas.offsetParent === null) return;
      
      const rect = canvas.parentNode.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    });
  }

  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  // Core Render Loops
  let chartOffset = 0;
  function render() {
    chartOffset += 0.04;
    
    // Draw Sparkline
    if (sparklineCanvas && sparklineCanvas.offsetParent !== null) {
      const ctx = sparklineCanvas.getContext('2d');
      const w = sparklineCanvas.width / (window.devicePixelRatio || 1);
      const h = sparklineCanvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, w, h);
      
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 4;
      
      for (let i = 0; i < w; i++) {
        const y = h / 2 + Math.sin(i * 0.06 + chartOffset) * 8 + Math.cos(i * 0.025 + chartOffset * 1.4) * 3;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Draw Main Metrics Chart
    if (liveChartCanvas && liveChartCanvas.offsetParent !== null) {
      const ctx = liveChartCanvas.getContext('2d');
      const w = liveChartCanvas.width / (window.devicePixelRatio || 1);
      const h = liveChartCanvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, w, h);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridRows = 4;
      for (let i = 1; i < gridRows; i++) {
        const y = (h / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      
      const stepX = w / (maxDataPoints - 1);
      
      // 1. Draw Latency Line (Pure White)
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 6;
      
      latencyData.forEach((val, idx) => {
        const mappedY = h - 20 - ((val - 10) / 40) * (h - 40);
        if (idx === 0) ctx.moveTo(0, mappedY);
        else ctx.lineTo(idx * stepX, mappedY);
      });
      ctx.stroke();
      
      // 2. Draw Memory Line (Muted Grey)
      ctx.beginPath();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(136, 136, 136, 0.2)';
      ctx.shadowBlur = 6;
      
      memData.forEach((val, idx) => {
        const mappedY = h - 20 - ((val - 30) / 30) * (h - 40);
        if (idx === 0) ctx.moveTo(0, mappedY);
        else ctx.lineTo(idx * stepX, mappedY);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Simulate background fluctuations
    if (!isStreamActive && Math.random() < 0.03) {
      const driftLat = Math.floor(24 + Math.random() * 7);
      const driftMem = Math.floor(41 + Math.random() * 4);
      
      if (latencyVal) latencyVal.textContent = `${driftLat}ms`;
      if (memVal) memVal.textContent = `${driftMem}%`;
      if (miniLatencyText) miniLatencyText.textContent = `${driftLat}ms`;
      
      latencyData.push(driftLat);
      latencyData.shift();
      memData.push(driftMem);
      memData.shift();
    }
    
    requestAnimationFrame(render);
  }
  
  // Set initial module layout configurations
  activateModule('dashboard');
  
  render();

  // --- 11. Orchestrator Module Interactive Logic ---
  const orchQueryInput = document.getElementById('orchQueryInput');
  const btnRunOrchestration = document.getElementById('btnRunOrchestration');
  const orchStepsTableBody = document.getElementById('orchStepsTableBody');
  const orchStepDetailBody = document.getElementById('orchStepDetailBody');
  const orchSynthesisBody = document.getElementById('orchSynthesisBody');
  const orchSynthesisTime = document.getElementById('orchSynthesisTime');
  const orchAgentOutputs = document.getElementById('orchAgentOutputs');
  const orchHistoryList = document.getElementById('orchHistoryList');
  const orchStepCount = document.getElementById('orchStepCount');
  const orchAgentCount = document.getElementById('orchAgentCount');
  const orchRunCount = document.getElementById('orchRunCount');
  const orchestratorPreviewStatus = document.getElementById('orchestratorPreviewStatus');

  let currentOrchRun = null;

  // Agent name/icon mapping
  const agentDisplayMap = {
    ceo: { name: 'CEO Agent', icon: '👔', color: '#a78bfa' },
    developer: { name: 'Developer Agent', icon: '💻', color: '#60a5fa' },
    legal: { name: 'Legal Agent', icon: '⚖️', color: '#34d399' }
  };

  // Pipeline stage animation
  function setStageState(stageId, state) {
    const stage = document.getElementById(stageId);
    if (!stage) return;
    stage.className = 'orch-stage';
    if (state !== 'idle') stage.classList.add(`orch-stage--${state}`);
    const statusEl = stage.querySelector('.orch-stage-status');
    if (statusEl) {
      const labels = { idle: 'idle', running: 'running...', complete: 'done', error: 'error' };
      statusEl.textContent = labels[state] || state;
    }
  }

  // Run orchestration
  async function runOrchestration() {
    const query = orchQueryInput ? orchQueryInput.value.trim() : '';
    if (!query) {
      if (orchQueryInput) orchQueryInput.focus();
      return;
    }

    // Disable button during run
    if (btnRunOrchestration) {
      btnRunOrchestration.disabled = true;
      btnRunOrchestration.innerHTML = `<svg class="orch-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"></circle></svg> Running...`;
    }

    // Animate pipeline stages
    setStageState('orchStagePlan', 'running');
    setStageState('orchStageExecute', 'idle');
    setStageState('orchStageSynthesize', 'idle');
    if (orchestratorPreviewStatus) orchestratorPreviewStatus.textContent = 'Pipeline running...';

    try {
      // Simulate staged delays for visual effect
      await delay(400);
      setStageState('orchStagePlan', 'complete');
      setStageState('orchStageExecute', 'running');

      const response = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'demo', query })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Orchestration failed');
      }

      setStageState('orchStageExecute', 'complete');
      setStageState('orchStageSynthesize', 'running');
      await delay(300);
      setStageState('orchStageSynthesize', 'complete');

      currentOrchRun = data.run;
      renderOrchestrationResults(data.run);
      loadOrchHistory();

      if (orchestratorPreviewStatus) orchestratorPreviewStatus.textContent = `Completed — ${data.run.stepsCount} steps`;
      appendSystemMessage(`Orchestration completed: "${query}" — ${data.run.stepsCount} steps, ${data.run.agentsUsed.length} agents.`);

    } catch (err) {
      setStageState('orchStagePlan', 'error');
      setStageState('orchStageExecute', 'error');
      setStageState('orchStageSynthesize', 'error');
      if (orchestratorPreviewStatus) orchestratorPreviewStatus.textContent = 'Error';
      console.error('Orchestration error:', err);
    } finally {
      if (btnRunOrchestration) {
        btnRunOrchestration.disabled = false;
        btnRunOrchestration.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Run Orchestration`;
      }
    }
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Render orchestration results
  function renderOrchestrationResults(run) {
    const result = run.result;
    const steps = result.context.results;
    const synthesis = result.finalOutput;

    // -- Steps table --
    if (orchStepsTableBody) {
      orchStepsTableBody.innerHTML = steps.map((step, idx) => {
        const agentInfo = agentDisplayMap[step.executor] || { name: step.executor, icon: '🔧', color: '#9ca3af' };
        const statusClass = step.success ? 'green' : 'red';
        const statusText = step.success ? 'SUCCESS' : 'FAILED';
        return `<tr class="orch-step-row" data-step-idx="${idx}">
          <td><span class="orch-step-num">${idx + 1}</span></td>
          <td><span class="orch-agent-badge" style="border-color: ${agentInfo.color}">${agentInfo.icon} ${agentInfo.name}</span></td>
          <td class="orch-task-cell">${escapeHtml(step.task).substring(0, 80)}${step.task.length > 80 ? '...' : ''}</td>
          <td><span class="orch-duration">${(step.durationMs / 1000).toFixed(1)}s</span></td>
          <td><span class="tbl-badge ${statusClass}">${statusText}</span></td>
        </tr>`;
      }).join('');

      // Click handler for step detail
      orchStepsTableBody.querySelectorAll('.orch-step-row').forEach(row => {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(row.getAttribute('data-step-idx'), 10);
          showStepDetail(steps[idx]);
        });
      });
    }

    // -- Step count preview --
    if (orchStepCount) orchStepCount.textContent = `${steps.length} steps`;

    // -- Agent outputs --
    const agentsUsed = [...new Set(steps.map(s => s.executor))];
    if (orchAgentCount) orchAgentCount.textContent = `${agentsUsed.length} agents`;

    if (orchAgentOutputs) {
      orchAgentOutputs.innerHTML = steps
        .filter(s => s.output && s.output.response)
        .map(step => {
          const agentInfo = agentDisplayMap[step.executor] || { name: step.executor, icon: '🔧', color: '#9ca3af' };
          return `<div class="orch-agent-output-card">
            <div class="orch-agent-output-header">
              <span class="orch-agent-output-icon" style="color: ${agentInfo.color}">${agentInfo.icon}</span>
              <span class="orch-agent-output-name">${agentInfo.name}</span>
              <span class="orch-agent-output-time">${(step.durationMs / 1000).toFixed(1)}s</span>
            </div>
            <div class="orch-agent-output-body">${formatAgentResponse(step.output.response)}</div>
          </div>`;
        }).join('');
    }

    // -- Synthesis --
    if (orchSynthesisBody) {
      orchSynthesisBody.innerHTML = formatAgentResponse(synthesis.response);
    }
    if (orchSynthesisTime) {
      orchSynthesisTime.textContent = `${(synthesis.executionTime / 1000).toFixed(1)}s total`;
    }
  }

  function showStepDetail(step) {
    if (!orchStepDetailBody) return;
    const detailTitle = document.querySelector('.orch-step-detail-title');
    const agentInfo = agentDisplayMap[step.executor] || { name: step.executor };
    if (detailTitle) detailTitle.textContent = `${agentInfo.name} — Step ${step.stepId}`;
    orchStepDetailBody.textContent = JSON.stringify(step, null, 2);
  }

  function formatAgentResponse(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• /gm, '<span class="orch-bullet">•</span> ')
      .replace(/^(\d+)\. /gm, '<span class="orch-num">$1.</span> ')
      .replace(/## (.+)/g, '<h3 class="orch-response-heading">$1</h3>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // Load orchestration history
  async function loadOrchHistory() {
    try {
      const res = await fetch('/api/orchestrator/runs/demo');
      const data = await res.json();

      if (!data.success || !data.runs.length) {
        if (orchHistoryList) orchHistoryList.innerHTML = '<div class="orch-placeholder-text">No orchestration runs yet.</div>';
        if (orchRunCount) orchRunCount.textContent = '0 runs';
        return;
      }

      if (orchRunCount) orchRunCount.textContent = `${data.runs.length} runs`;

      if (orchHistoryList) {
        orchHistoryList.innerHTML = data.runs.map(run => {
          const time = new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const date = new Date(run.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const agents = run.agentsUsed.map(a => agentDisplayMap[a]?.icon || '🔧').join(' ');
          return `<div class="orch-history-item" data-run-id="${run.id}">
            <div class="orch-history-meta">
              <span class="orch-history-time">${date} ${time}</span>
              <span class="orch-history-agents">${agents}</span>
              <span class="orch-history-steps">${run.stepsCount} steps</span>
            </div>
            <div class="orch-history-query">${escapeHtml(run.query).substring(0, 100)}${run.query.length > 100 ? '...' : ''}</div>
            <div class="orch-history-status"><span class="tbl-badge green">${run.status.toUpperCase()}</span></div>
          </div>`;
        }).join('');

        // Click to load a past run
        orchHistoryList.querySelectorAll('.orch-history-item').forEach(item => {
          item.addEventListener('click', async (e) => {
            e.stopPropagation();
            const runId = item.getAttribute('data-run-id');
            try {
              const res = await fetch(`/api/orchestrator/run/${runId}`);
              const data = await res.json();
              if (data.success && data.run) {
                currentOrchRun = data.run;
                renderOrchestrationResults(data.run);
                setStageState('orchStagePlan', 'complete');
                setStageState('orchStageExecute', 'complete');
                setStageState('orchStageSynthesize', 'complete');
              }
            } catch (err) {
              console.error('Failed to load run:', err);
            }
          });
        });
      }
    } catch (err) {
      console.error('Failed to load orchestration history:', err);
    }
  }

  // Bind run button
  if (btnRunOrchestration) {
    btnRunOrchestration.addEventListener('click', (e) => {
      e.stopPropagation();
      runOrchestration();
    });
  }

  // Allow Enter key to trigger orchestration
  if (orchQueryInput) {
    orchQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        runOrchestration();
      }
    });
  }

  // Load history + demo run on page load
  loadOrchHistory();
});