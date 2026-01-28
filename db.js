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

  function toPlain(value, seen = new WeakMap()){
    if(value === null || typeof value !== "object") return value;
    if(seen.has(value)) return "[Circular]";
    seen.set(value, true);
    if(Array.isArray(value)){
      return value.map(item => toPlain(item, seen));
    }
    const obj = {};
    for(const [key, val] of Object.entries(value)){
      if(typeof val === "function") continue;
      obj[key] = toPlain(val, seen);
    }
    return obj;
  }

  async function getBackupData(){
    const record = await db.kv.get("appState");
    const appState = record ? record.value : null;
    const plainState = appState ? toPlain(appState) : null;
    return { appState: plainState };
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
  window.getBackupData = getBackupData;
  window.importAll = importAll;
})();
