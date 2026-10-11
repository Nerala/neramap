const { spawn } = require('child_process');
const fs = require('fs');

async function testCDP() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=1280,820',
    'http://localhost:8085/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const target = pages.find(p => p.type === 'page');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        const handler = (msg) => {
          const res = JSON.parse(msg.data);
          if (res.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await new Promise(r => setTimeout(r, 1500));

    // 1. Switch to Studio Mode
    await send('Runtime.evaluate', {
      expression: 'window.NeraMap.VizStudio.switchMode("sunburst");'
    });
    await new Promise(r => setTimeout(r, 800));

    // 2. Switch to Cameroon
    await send('Runtime.evaluate', {
      expression: 'window.NeraMap.CountryFilter.setCountry("CM");'
    });
    await new Promise(r => setTimeout(r, 800));

    // 3. Click Bubble Distribution toggle
    await send('Runtime.evaluate', {
      expression: 'document.getElementById("btn-toggle-bubbles").click();'
    });
    await new Promise(r => setTimeout(r, 1000));

    let shot = await send('Page.captureScreenshot');
    fs.writeFileSync('reports/studio_cameroon_bubbles.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved studio_cameroon_bubbles.png');

    ws.close();
  } catch (e) {
    console.error('CDP test error:', e);
  } finally {
    proc.kill();
  }
}

testCDP();
