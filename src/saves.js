(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  const PRIMARY_KEY = 'after-the-sirens-save-v1';
  const BACKUP_KEY = PRIMARY_KEY + '-backup';
  const MAX_CHARS = 32000000;

  // Keep the original raw save format/key so older standalone files can still
  // read the primary slot. Each localStorage write is atomic. Only a redundant
  // copy created by the current write may be reclaimed when the quota is full.
  function create(storage, deserialize) {
    const known = [];
    function remember(data, ended) {
      const index = known.findIndex(function (entry) { return entry.data === data; });
      if (index !== -1) known.splice(index, 1);
      known.push({ data: data, ended: ended });
      if (known.length > 2) known.shift();
    }
    function access() {
      const target = typeof storage === 'function' ? storage() : storage;
      if (!target || typeof target.getItem !== 'function' || typeof target.setItem !== 'function') throw new Error('Browser save storage is unavailable.');
      return target;
    }
    function decode(data) {
      if (typeof data !== 'string' || !data.length || data.length > MAX_CHARS) throw new Error('Save must be a nonempty JSON text smaller than 32 MB.');
      if (typeof deserialize !== 'function') throw new Error('Save validation is unavailable.');
      const state = deserialize(data);
      if (!state || typeof state !== 'object' || typeof state.ended !== 'boolean') throw new Error('The save does not contain a valid run.');
      remember(data, state.ended);
      return state;
    }
    function valid(data) {
      const entry = known.find(function (item) { return item.data === data; });
      if (entry) return entry;
      const state = decode(data);
      return { data: data, ended: state.ended };
    }
    function candidate(key) {
      let data = null;
      try {
        data = access().getItem(key);
        if (data === null) return { state: null, data: null, error: null };
        return { state: decode(data), data: data, error: null };
      } catch (error) { return { state: null, data: data, error: error }; }
    }
    function read() {
      const primary = candidate(PRIMARY_KEY);
      // A valid finished run is authoritative. Its older, unfinished backup
      // must never cause Continue to bring that survivor back to life.
      if (primary.state) return { state: primary.state, data: primary.data, recovered: false, canContinue: !primary.state.ended, error: null, primaryError: null };
      const backup = candidate(BACKUP_KEY);
      if (backup.state) return { state: backup.state, data: backup.data, recovered: true, canContinue: !backup.state.ended, error: null, primaryError: primary.error };
      return { state: null, data: null, recovered: false, canContinue: false, error: primary.error || backup.error, primaryError: primary.error };
    }
    function write(data, trustedState) {
      let target, ended;
      try {
        target = access();
        if (typeof data !== 'string' || !data.length || data.length > MAX_CHARS) throw new Error('Save must be a nonempty JSON text smaller than 32 MB.');
        // The caller may supply the live engine state alongside Engine.serialize
        // output. That internal path avoids rebuilding a large world every five
        // seconds. Imported/untrusted strings must omit this second argument.
        ended = trustedState && typeof trustedState.ended === 'boolean' ? trustedState.ended : valid(data).ended;
      } catch (error) { return { saved: false, backupSaved: false, error: error, backupError: null }; }

      let previous = null, priorBackup = null, backupSaved = false, backupError = null;
      try { previous = target.getItem(PRIMARY_KEY); } catch (error) { backupError = error; }
      if (previous !== null && previous !== data) {
        let previousValid = false;
        try { valid(previous); previousValid = true; } catch (_) {}
        // A malformed primary must not replace the last recoverable generation.
        if (previousValid) {
          try { priorBackup = target.getItem(BACKUP_KEY); } catch (_) {}
          try { target.setItem(BACKUP_KEY, previous); backupSaved = true; } catch (error) { backupError = error; }
        }
      }
      try {
        target.setItem(PRIMARY_KEY, data);
        remember(data, ended);
        return { saved: true, backupSaved: backupSaved, error: null, backupError: backupError };
      } catch (error) {
        // Two copies of the old save can fit while old + new exceeds quota. Do
        // not let that duplicate permanently prevent a growing world saving.
        // Only remove the copy we just wrote, and only while the valid primary
        // still contains those exact bytes. A different or sole recovery copy
        // is never removed, nor do non-quota errors trigger this fallback.
        let duplicate = false;
        try {
          const quota = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014);
          duplicate = quota && backupSaved && typeof target.removeItem === 'function' && target.getItem(PRIMARY_KEY) === previous && target.getItem(BACKUP_KEY) === previous;
        } catch (_) {}
        if (!duplicate) return { saved: false, backupSaved: backupSaved, error: error, backupError: backupError };
        try { target.removeItem(BACKUP_KEY); backupSaved = false; }
        catch (removeError) { return { saved: false, backupSaved: backupSaved, error: error, backupError: removeError }; }

        backupError = new Error('The recovery copy could not be refreshed because browser save storage is full.');
        let saved = false, saveError = null;
        try { target.setItem(PRIMARY_KEY, data); remember(data, ended); saved = true; }
        catch (retryError) { saveError = retryError; }
        // An earlier, smaller valid backup may still fit. If the primary retry
        // failed and no earlier copy is usable, restore its duplicate when
        // possible. Never replace a backup another writer has installed.
        let restore = null;
        if (priorBackup !== null) { try { valid(priorBackup); restore = priorBackup; } catch (_) {} }
        if (restore === null && !saved) restore = previous;
        if (restore !== null) {
          try {
            if (target.getItem(BACKUP_KEY) === null) { target.setItem(BACKUP_KEY, restore); backupSaved = true; }
          } catch (_) {}
        }
        return { saved: saved, backupSaved: backupSaved, error: saveError, backupError: backupError };
      }
    }
    return Object.freeze({ read: read, write: write });
  }
  S.Saves = Object.freeze({ create: create, PRIMARY_KEY: PRIMARY_KEY, BACKUP_KEY: BACKUP_KEY });
})();
