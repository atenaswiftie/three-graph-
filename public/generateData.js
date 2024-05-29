importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');

self.onmessage = function (event) {
 
    const lines = [];
    event.data.edges.forEach((edge) => {
      let source_node = event.data.nodesCache[edge.source];
      let target_node = event.data.nodesCache[edge.target];
      lines.push(new THREE.Vector3(source_node?.x, source_node?.y, 0));
      lines.push(new THREE.Vector3(target_node?.x, target_node?.y, 0));
    });

    
    self.postMessage(lines);
  
};
