importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
);
self.onmessage = function (event) {
  // function randomPosition(radius) {
  //     const pt_angle = Math.random() * 2 * Math.PI;
  //     const pt_radius_sq = Math.random() * radius * radius;
  //     const pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
  //     const pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
  //     return [pt_x, pt_y];
  //   }

  //   const hexToRgba = (hex) => {
  //     const bigint = parseInt(hex.slice(1), 16);
  //     const r = (bigint >> 16) & 255;
  //     const g = (bigint >> 8) & 255;
  //     const b = bigint & 255;
  //     return {r,g,b};
  //   };
  //   const colorArray = [
  //     "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f",
  //     "#ff7f00", "#6a3d9a", "#cab2d6", "#ffff99"
  //   ];
  // const colors=[]
  // const positions=[]
  // console.log(event.data)

  // for (let i = 0; i < event.data; i++) {
  //     const p =
  //      randomPosition(1000);
  //     positions.push(p[0],p[1],0);
  //     // colors.push(255, 0, 0)
  //     // colors.push("#000000")
  //     // colors.push("#000000")
  //     const rgba=hexToRgba(colorArray[Math.floor(Math.random() * colorArray.length+0)]);
  //     colors.push(rgba.r);
  //     colors.push(rgba.g);
  //     colors.push(rgba.b);
  // }
  // console.log(positions,colors)

  console.log(event.data);
  const lines = [];
  event.data.edges.forEach((edge) => {
    let source_node = event.data.nodesCache[edge.source];
    let target_node = event.data.nodesCache[edge.target];
    lines.push(new THREE.Vector3(source_node?.x, source_node?.y, 0));
    lines.push(new THREE.Vector3(target_node?.x, target_node?.y, 0));
  });

  console.log(lines);
  self.postMessage(lines);
};
