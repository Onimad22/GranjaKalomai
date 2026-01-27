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

  async function exportAll(){
    const kv = await db.kv.toArray();
    return { kv };
  }

  async function importAll(data){
    if(!data || typeof data !== "object") throw new Error("Invalid backup data");
    const kv = Array.isArray(data.kv) ? data.kv : [];
    await db.transaction("rw", db.kv, async ()=>{
      await db.kv.clear();
      if(kv.length){
        await db.kv.bulkPut(kv);
      }
    });
  }

  window.loadAppState = loadAppState;
  window.saveAppState = saveAppState;
  window.clearAppState = clearAppState;
  window.exportAll = exportAll;
  window.importAll = importAll;
})();
