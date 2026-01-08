(() => {
  "use strict";

  const db = new Dexie("granja_pwa_db");
  db.version(1).stores({
    kv: "&key"
  });

  async function loadAppState(){
    const record = await db.kv.get("appState");
    return record ? record.value : null;
  }

  async function saveAppState(state){
    await db.kv.put({ key: "appState", value: state });
  }

  async function clearAppState(){
    await db.kv.delete("appState");
  }

  window.loadAppState = loadAppState;
  window.saveAppState = saveAppState;
  window.clearAppState = clearAppState;
})();
