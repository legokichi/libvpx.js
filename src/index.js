var Module = {};
//fetchAsArrayBuffer('decode.wasm').then((buf)=>{ Module.wasmBinary = buf; // wasm
new Promise((resolve)=>{ window.onload = resolve; }).then(()=>{ // asmjs
  /*
  const base = document.createElement("base");
  base.href = "img";
  document.body.appendChild(base);
  */
  return Promise.all([
    fetchScript("decode.js"),
    fetchScript("EBML.js"),
    fetchScript("EBMLReader.js"),
  ]);
}).then(()=>{ window.onwasmloaded(); });

window.onwasmloaded = (()=>{ // wasm を自分でロードしたとき
//Module.addOnPostRun(()=>{ // mem があるとき
//window.onload = (()=>{ // ないとき

  const decoder = new EBML.Decoder();
  const reader = new EBMLReader();

  console.log("onload");
  Module.ccall("init", "number", ["number", "*"], []);
  navigator.mediaDevices.getUserMedia(
    {
      audio: true,
      video: true || {
        mandatory: {
          minFrameRate: 1,
          maxFrameRate: 5,
          minWidth: 2592,
          minHeight: 1944 } } }
  ).then((stream)=>{
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp8, opus"' });
    let task = Promise.resolve();
    rec.ondataavailable = (ev)=>{
      task.then(()=> readAsArrayBuffer(ev.data).then((buffer)=>{
        decoder.decode(buffer).forEach((elm)=>{
          reader.read(elm);
        });
      }) );
    };
    reader.addListener("simpleblock_video", ({elm, data})=>{
      console.log(elm.name, data);
      data.frames.forEach((frame)=>{
        const size = frame.length;
        const buf = Module._malloc(size);
        Module.HEAP8.set(frame, buf);

        console.time("decode");
        Module.ccall("decode", "number", ["*", "number"], [buf, size]);
        console.timeEnd("decode");

        Module._free(buf);
        const width = Module.ccall("width", "number", [], []);
        const height = Module.ccall("height", "number", [], []);
        const rows = Module.ccall("mb_rows", "number", [], []);
        const cols = Module.ccall("mb_cols", "number", [], []);
        console.log(width, height, rows, cols);

        console.time("each_MB");
        for (let row = 0; row < rows; ++row) {
          for (let col = 0; col < cols; ++col) {
            Module.ccall("mbmi_row", "number", ["number", "number"], [row, col]);
            Module.ccall("mbmi_col", "number", ["number", "number"], [row, col]);
          }
        }
        console.timeEnd("each_MB");
      });
    });
    rec.start(100);
    setTimeout(()=>{
      rec.stop();
      rec.ondataavailable = undefined;
      rec.stream.getTracks().map((track) => { track.stop(); });
      console.log("end!");
    }, 10 * 1000);
  });
});
function readAsArrayBuffer(blob) {
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = ()=>{ resolve(reader.result); };
    reader.onerror = (ev)=>{ reject(ev.error); };
  });
}
function fetchAsArrayBuffer(url) {
  return new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      resolve(xhr.response)
    };
    xhr.send(null);
  });
}
function fetchScript(url){
  return new Promise((resolve, reject)=>{
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
    script.onload = ()=>{
      resolve();
    };
  });
}


console.log("ready")

