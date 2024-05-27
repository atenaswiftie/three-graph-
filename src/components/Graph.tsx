import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import data from '../data/forceAtlas2.json'; // Adjust the path as necessary
import _ from 'lodash'; // For sorting, as used in the original code
import { PointData } from '../model/graph';




const ThreeVisualization = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // const [positions,setPostions]=useState([])
  // const [colors,setColors]=useState([])
  

 

  let width = window.innerWidth;
  let height = window.innerHeight;
  const fov = 40;
  const near = 1;
  const far = 7000;
  const renderer = new THREE.WebGLRenderer();
    

  const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
  const scene = new THREE.Scene();
    
  const pointsGeometry = new THREE.BufferGeometry();




 const circleSprite = new THREE.TextureLoader().load(
    "https://fastforwardlabs.github.io/visualization_assets/circle-sprite.png"
  );

  const hexToRgba = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return {r,g,b};
  };
  const colorArray = [
    "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f",
    "#ff7f00", "#6a3d9a", "#cab2d6", "#ffff99"
  ]; 
  const colors=[]
  const positions=[]

  const edges=[
    {
      source:"",
      target:""
    }
  ]
    useEffect(() => {
  
      renderer.setSize(width, height);
      if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

      scene.background = new THREE.Color("white");
  
  

      // workerRef.current = new Worker("generateData.js");
      // workerRef.current.postMessage(point_num); // Example data
      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();

      // // Listen for messages from the worker
      //  workerRef.current.onmessage = (event) => {
      //     // setResult(event.data);
      //     const {colors,positions}=event.data
      //     // console.log("colors",colors)
      //     // console.log("postions",positions)
      //     // setPostions(positionsData)
      //     // setColors(colorsData)



      //     const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
      //     // colorAttribute.normalized = true; 
      //     pointsGeometry.setAttribute('color', colorAttribute);
      //     pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      //     const pointsMaterial = new THREE.PointsMaterial({
      //       size: 50,
      //       vertexColors: true,
      //       map: circleSprite,
      //       transparent: true
      //     });
    
      
      //     const points = new THREE.Points(pointsGeometry, pointsMaterial);
      //     scene.add(points);
      //     animate();
      // };

      // Send a message to the worker
  

       // nodes
  console.log(data)
      data.forEach((element: PointData) => {
        positions.push(+element.x, +element.y, 0);
         const rgba=hexToRgba(colorArray[Math.floor(Math.random() * colorArray.length+0)]);
          colors.push(rgba.r);
          colors.push(rgba.g);
          colors.push(rgba.b);
      });
      console.log(colors)
        const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
          // colorAttribute.normalized = true; 
          pointsGeometry.setAttribute('color', colorAttribute);
          pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
          const pointsMaterial = new THREE.PointsMaterial({
            size: 10,
            vertexColors: true,
            map: circleSprite,
            transparent: true
          });
    
      
          const points = new THREE.Points(pointsGeometry, pointsMaterial);
          scene.add(points);
     
 
  
      const zoom = d3.zoom()
        .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
        .on('zoom', (event: d3.D3ZoomEvent<Element, Datum>) => zoomHandler(event.transform));
  
      const view = d3.select(renderer.domElement);
      setUpZoom();
  
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points.threshold = 10;
  
 
      function setUpZoom() {
        view.call(zoom);
        const initialScale = getScaleFromZ(far);
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale);
        zoom.transform(view, initialTransform);
        camera.position.set(0, 0, far);
      }
  
      function zoomHandler(transform: d3.ZoomTransform) {
        const scale = transform.k;
        const x = -(transform.x - width / 2) / scale;
        const y = (transform.y - height / 2) / scale;
        const z = getZFromScale(scale);
        camera.position.set(x, y, z);
      }
  
      function getScaleFromZ(cameraZPosition: number) {
        const halfFov = fov / 2;
        const halfFovRadians = toRadians(halfFov);
        const halfFovHeight = Math.tan(halfFovRadians) * cameraZPosition;
        const fovHeight = halfFovHeight * 2;
        return height / fovHeight;
      }
  
      function getZFromScale(scale: number) {
        const halfFov = fov / 2;
        const halfFovRadians = toRadians(halfFov);
        const scaleHeight = height / scale;
        return scaleHeight / (2 * Math.tan(halfFovRadians));
      }
  
      function toRadians(angle: number) {
        return angle * (Math.PI / 180);
      }
  
  
    
  
      const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      };
    }, []);

    useEffect(()=>{



      const line_material=new THREE.LineBasicMaterial({ color:"#000" });
      const _points = []
      for(let i=0;i<20;i++){
        _points.push(
          new THREE.Vector3(i,i * Math.random() * 100,0),
          new THREE.Vector3(Math.random()*400-200,Math.random()*400-200,Math.random()*400-200),
          );
          // lines.add(newline);
        }

        const line_geometry=new THREE.BufferGeometry().setFromPoints( _points );
        const newline=new THREE.LineSegments(line_geometry,line_material);
      scene.add(newline);
    },[])

  return (
    <>
      <div style={{width:"100%"}} ref={mountRef} />
    </>
  );
};

export default ThreeVisualization;
