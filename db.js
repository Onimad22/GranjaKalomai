(() => {
  "use strict";

  const STORAGE_KEY = "kalomai_appState";
  const hasDexie = typeof Dexie !== "undefined";
  const db = hasDexie ? new Dexie("granja_pwa_db") : null;

  if(hasDexie){
    db.version(1).stores({
      kv: "&key"
    });
  }

  async function loadAppState(){
    if(hasDexie){
      const record = await db.kv.get("appState");
      return record ? record.value : null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    try{
      return JSON.parse(raw);
    }catch{
      return null;
    }
  }

  async function saveAppState(state){
    if(hasDexie){
      await db.kv.put({ key: "appState", value: state });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state ?? null));
  }

  async function clearAppState(){
    if(hasDexie){
      await db.kv.delete("appState");
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
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
    const appState = await loadAppState();
    const plainState = appState ? toPlain(appState) : null;
    return { appState: plainState };
  }

  async function importAll(data){
    if(!data || typeof data !== "object") throw new Error("Invalid backup data");
    if(Object.prototype.hasOwnProperty.call(data, "appState")){
      await saveAppState(data.appState);
      return;
    }
    const kv = Array.isArray(data.kv) ? data.kv : [];
    if(hasDexie){
      await db.transaction("rw", db.kv, async ()=>{
        await db.kv.clear();
        if(kv.length){
          await db.kv.bulkPut(kv);
        }
      });
      return;
    }
    const appStateEntry = kv.find((entry) => entry && entry.key === "appState");
    await saveAppState(appStateEntry ? appStateEntry.value : null);
  }

  window.loadAppState = loadAppState;
  window.saveAppState = saveAppState;
  window.clearAppState = clearAppState;
  window.getBackupData = getBackupData;
  window.importAll = importAll;
})();
