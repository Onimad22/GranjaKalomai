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
    const record = await db.kv.get("appState");
    const appState = record ? record.value : null;
    return { appState };
  }

  async function importAll(data){
    if(!data || typeof data !== "object") throw new Error("Invalid backup data");
    if(Object.prototype.hasOwnProperty.call(data, "appState")){
      await db.transaction("rw", db.kv, async ()=>{
        await db.kv.clear();
        await db.kv.put({ key: "appState", value: data.appState });
      });
      return;
    }
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
