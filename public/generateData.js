self.onmessage=function(event){
    function randomPosition(radius) {
        const pt_angle = Math.random() * 2 * Math.PI;
        const pt_radius_sq = Math.random() * radius * radius;
        const pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
        const pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
        return [pt_x, pt_y];
      }
      

    const colors=[]
    const positions=[]
    console.log(event.data)

    for (let i = 0; i < event.data; i++) {
        const p =
         randomPosition(1000)
        positions.push(p[0],p[1],0)
        colors.push(255, 0, 0)
        // colors.push("#000000")
        // colors.push("#000000")
    //   const rgba=hexToRgba(colorArray[Math.floor(Math.random() * colorArray.length+0)]);
    //     colors.push(rgba.r);
    //     colors.push(rgba.g);
    //     colors.push(rgba.b);

  
    }
    console.log(positions,colors)
    self.postMessage({positions,colors});
}