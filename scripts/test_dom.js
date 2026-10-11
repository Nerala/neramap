const { spawn } = require('child_process');
const fs = require('fs');

async function testDom() {
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

    await new Promise(r => setTimeout(r, 1200));

    // Switch to Studio
    await send('Runtime.evaluate', {
      expression: 'window.NeraMap.VizStudio.switchMode("sunburst");'
    });
    await new Promise(r => setTimeout(r, 800));

    // Switch to Chad
    await send('Runtime.evaluate', {
      expression: 'window.NeraMap.CountryFilter.setCountry("TD");'
    });
    await new Promise(r => setTimeout(r, 1200));

    let shot = await send('Page.captureScreenshot');
    fs.writeFileSync('reports/studio_chad_choropleth.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved studio_chad_choropleth.png');

    // Switch to Gabon
    await send('Runtime.evaluate', {
      expression: 'window.NeraMap.CountryFilter.setCountry("GA");'
    });
    await new Promise(r => setTimeout(r, 1200));

    shot = await send('Page.captureScreenshot');
    fs.writeFileSync('reports/studio_gabon_choropleth.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved studio_gabon_choropleth.png');

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    proc.kill();
  }
}

testDom();
