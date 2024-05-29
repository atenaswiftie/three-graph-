import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as d3 from "d3";
import nodesData from "../data/nodes.json"; // Adjust the path as necessary
import _, { size } from "lodash"; // For sorting, as used in the original code
import { PointData } from "../model/graph";

import edgesData from "../data/edges-v1.json";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";
import { dashSize } from "three/examples/jsm/nodes/Nodes.js";

const ThreeVisualization = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const workerRef = useRef<Worker | null>(null);

  // const [positions,setPostions]=useState([])
  // const [colors,setColors]=useState([])

  let width = window.innerWidth;
  let height = window.innerHeight;
  const fov = 40;
  const near = 10;
  const far = 7000;
  const renderer = new THREE.WebGLRenderer();

  const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
  const scene = new THREE.Scene();

  const pointsGeometry = new THREE.BufferGeometry();

  const circleSprite = new THREE.TextureLoader().load(
    "https://fastforwardlabs.github.io/visualization_assets/circle-sprite.png"
  );
  function randomPosition(radius) {
    const pt_angle = Math.random() * 2 * Math.PI;
    const pt_radius_sq = Math.random() * radius * radius;
    const pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
    const pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
    return [pt_x, pt_y];
  }

  const mathFloor = (floatNum) => {
    return Math.floor(floatNum);
  };

  const hexToRgba = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };
  const colorArray = [
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#ff7f00",
    "#6a3d9a",
    "#cab2d6",
  ];
  const colors = [];
  const positions = [];
  const nodesCache = {};

  const nodes_count = 1_000_000;

  const edges_count = 1_000_000;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  const generateNodes = () => {
    let nodes = [];
    for (let i = 0; i < nodes_count; i++) {
      const p = randomPosition(width * 2.8);
      let obj = { x: p[0], y: p[1], id: `${i}` };
      nodes.push(obj);
      nodesCache[`${i}`] = obj;
    }
    return nodes;
  };

  const generateEdges = () => {
    let edges = [];
    for (let i = 0; i < edges_count; i++) {
      edges.push({
        source: `${mathFloor(Math.random() * nodes_count)}`,
        target: `${mathFloor(Math.random() * nodes_count)}`,
      });
    }
    return edges;
  };

  useEffect(() => {
    renderer.setSize(width, height);
    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color("white");
    // Example data

    let nodes = generateNodes();
    // let nodes=nodesData

    nodes.forEach((element: PointData) => {
      positions.push(element.x, element.y, 0);
      const rgba = hexToRgba(
        colorArray[Math.floor(Math.random() * colorArray.length)]
      );
      // colors.push(0,204,0)
      colors.push(rgba.r);
      colors.push(rgba.g);
      colors.push(rgba.b);
    });

    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);

    colorAttribute.normalized = true;
    pointsGeometry.setAttribute("color", colorAttribute);
    pointsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const pointsMaterial = new THREE.PointsMaterial({
      size: 20,
      color: "#6a3d9a",
      vertexColors: true,
      map: circleSprite,
      transparent: true,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    // edge generate
    const edges = generateEdges();
    //   const line_material = new MeshLineMaterial({color:"#1f78b4",dashArray:0});
    // let _lines = [];
    // edges.forEach((edge) => {
    //    let source_node = nodesCache[edge.source];
    //   let target_node = nodesCache[edge.target];
    //   _lines.push(new THREE.Vector3(source_node?.x, source_node?.y, 0));
    //   _lines.push(new THREE.Vector3(target_node?.x, target_node?.y, 0));
    // });

    // const lineGeometry = new THREE.BufferGeometry().setFromPoints(_lines);
    // // lineGeometry.setAttribute("color", colorAttribute);
    // const line=new MeshLine();
    // line.setGeometry(lineGeometry)
    // // line.setPoints(_lines);
    // const mesh = new THREE.Mesh(line, line_material);
    // scene.add(mesh);
    // mesh.raycast = MeshLineRaycast;

    // const line_material = new THREE.LineBasicMaterial({color:"#1f78b4"});
    // let lines = [];
    // edges.forEach((edge) => {
    //   let source_node = nodesCache[edge.source];
    //   let target_node = nodesCache[edge.target];
    //   lines.push(new THREE.Vector3(source_node?.x, source_node?.y, 0));
    //   lines.push(new THREE.Vector3(target_node?.x, target_node?.y, 0));
    // });

    // worker

    workerRef.current = new Worker("generateData.js");
    const data = {
      nodesCache,
      edges,
    };
    workerRef.current.postMessage(data);

    workerRef.current.onmessage = (event) => {

      const line_material = new MeshLineMaterial({
        color: "#1f78b4",
        dashArray: 0,
        size:1,
      });

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        event.data
      );
      // lineGeometry.setAttribute("color", colorAttribute);
      const line = new MeshLine();
      line.setGeometry(lineGeometry);
      // line.setPoints(_lines);
      const mesh = new THREE.Mesh(line, line_material);
      scene.add(mesh);
      mesh.raycast = MeshLineRaycast;
    };

    // const lineGeometry = new THREE.BufferGeometry().setFromPoints(lines);
    // // lineGeometry.setAttribute("color", colorAttribute);
    // scene.add(new THREE.LineSegments(lineGeometry, line_material));

    animate();

    const zoom = d3
      .zoom()
      .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
      .on("zoom", (event: d3.D3ZoomEvent<Element, Datum>) =>
        zoomHandler(event.transform)
      );

    const view = d3.select(renderer.domElement);

    setUpZoom();

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 5;

    function setUpZoom() {
      view.call(zoom);
      const initialScale = getScaleFromZ(far);
      const initialTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(initialScale);
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (mountRef?.current) {
      setLoading(false);
    }
  }, [mountRef]);

  return (
    <>
      {loading && <b>loading</b>}
      <div style={{ width: "100%" }} ref={mountRef} />
    </>
  );
};

export default ThreeVisualization;
