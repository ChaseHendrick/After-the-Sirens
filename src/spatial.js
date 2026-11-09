(function () {
  'use strict';
  const S = window.Sirens = window.Sirens || {};
  // A transient broad phase for positions that stay fixed through a query batch.
  // Callers retain their exact distance, health and line-of-sight checks. Rebuild
  // after movement; returning candidates in source order preserves tie decisions.
  function build(entities, cellSize) {
    const size = Number.isFinite(cellSize) && cellSize >= 1 ? cellSize : 256;
    const source = Array.from(entities), cells = new Map();
    for (let i = 0; i < source.length; i++) {
      const entity = source[i], x = entity && entity.x, y = entity && entity.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return { source, cells: null, size };
      const cx = Math.floor(x / size), cy = Math.floor(y / size);
      if (!Number.isSafeInteger(cx) || !Number.isSafeInteger(cy)) return { source, cells: null, size };
      const key = cx + ',' + cy, bucket = cells.get(key);
      if (bucket) bucket.push(i); else cells.set(key, [i]);
    }
    return { source, cells, size };
  }
  function query(index, x, y, radius) {
    // Unusual queries use the reference candidate set rather than risk an omission
    // or an unbounded walk through empty cells.
    if (!index.cells || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius < 0) return index.source;
    const minX = Math.floor((x - radius) / index.size), maxX = Math.floor((x + radius) / index.size);
    const minY = Math.floor((y - radius) / index.size), maxY = Math.floor((y + radius) / index.size);
    if (![minX, maxX, minY, maxY].every(Number.isSafeInteger) || (maxX - minX + 1) * (maxY - minY + 1) > 256) return index.source;
    const found = [];
    for (let cy = minY; cy <= maxY; cy++) for (let cx = minX; cx <= maxX; cx++) {
      const bucket = index.cells.get(cx + ',' + cy);
      if (bucket) for (const order of bucket) found.push(order);
    }
    found.sort((a, b) => a - b);
    return found.map(order => index.source[order]);
  }
  S.Spatial = Object.freeze({ build, query });
})();
