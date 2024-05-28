
self.onmessage = function (event) {
 
    const lines = [];
    event.data.edges.forEach((edge) => {
      let source_node = event.data.nodesCache[edge.source];
      let target_node = event.data.nodesCache[edge.target];
      lines.push(event.data.vector(source_node?.x, source_node?.y, 0));
      lines.push(event.data.vector(target_node?.x, target_node?.y, 0));
    });

    console.log(THREE)
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(lines);
    const lineMaterial = event.data.lineMaterial
    // const meshLine = event.data.meshLine(lineGeometry, lineMaterial)
    // meshLine.setGeometry(lineGeometry);
    
    self.postMessage(lines);
  
};
