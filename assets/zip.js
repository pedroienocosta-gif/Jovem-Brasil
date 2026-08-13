/* Minimal ZIP writer — no compression, just stored entries.
   Enough to bundle data/papers.js and the PDFs into one download. */

window.JBZip = (function () {
  var table = (function () {
    var t = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function dosTime(d) {
    return ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xffff;
  }
  function dosDate(d) {
    return (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  }

  function put(view, offset, values) {
    values.forEach(function (v) {
      if (v.size === 2) { view.setUint16(offset, v.value, true); offset += 2; }
      else { view.setUint32(offset, v.value, true); offset += 4; }
    });
    return offset;
  }
  var u16 = function (v) { return { size: 2, value: v }; };
  var u32 = function (v) { return { size: 4, value: v }; };

  /* files: [{ name: "papers/x.pdf", bytes: Uint8Array }] */
  function build(files) {
    var now = new Date();
    var enc = new TextEncoder();
    var parts = [];
    var central = [];
    var offset = 0;

    files.forEach(function (f) {
      var nameBytes = enc.encode(f.name);
      var crc = crc32(f.bytes);

      var local = new Uint8Array(30 + nameBytes.length);
      var lv = new DataView(local.buffer);
      put(lv, 0, [
        u32(0x04034b50), u16(20), u16(0), u16(0),
        u16(dosTime(now)), u16(dosDate(now)),
        u32(crc), u32(f.bytes.length), u32(f.bytes.length),
        u16(nameBytes.length), u16(0)
      ]);
      local.set(nameBytes, 30);

      parts.push(local, f.bytes);

      var cd = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(cd.buffer);
      put(cv, 0, [
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0),
        u16(dosTime(now)), u16(dosDate(now)),
        u32(crc), u32(f.bytes.length), u32(f.bytes.length),
        u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0),
        u32(0), u32(offset)
      ]);
      cd.set(nameBytes, 46);
      central.push(cd);

      offset += local.length + f.bytes.length;
    });

    var centralSize = central.reduce(function (n, c) { return n + c.length; }, 0);

    var end = new Uint8Array(22);
    put(new DataView(end.buffer), 0, [
      u32(0x06054b50), u16(0), u16(0),
      u16(files.length), u16(files.length),
      u32(centralSize), u32(offset), u16(0)
    ]);

    return new Blob(parts.concat(central, [end]), { type: "application/zip" });
  }

  return { build: build };
})();
