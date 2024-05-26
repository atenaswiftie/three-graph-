import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import data from '../components/forceAtlas2.json'; // Adjust the path as necessary
import _ from 'lodash'; // For sorting, as used in the original code

const ThreeVisualization = () => {
  const mountRef = useRef(null);
  const [tooltipState, setTooltipState] = useState({ display: 'none', left: 0, top: 0, name: '', group: 0 });
  const colorArray = [
    "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f",
    "#ff7f00", "#6a3d9a", "#cab2d6", "#ffff99"
  ];

  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    const fov = 100;
    const near = 1;
    const far = 12000;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefefef);

    const circleSprite = new THREE.TextureLoader().load(
      "https://fastforwardlabs.github.io/visualization_assets/circle-sprite.png"
    );

    const pointsGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    data.forEach(element => {
      positions.push(element.x, element.y, 0);
      // const color = new THREE.Color(colorArray[element.group]);
      colors.push( Math.random() * 255 );
					colors.push( Math.random() * 255 );
					colors.push( Math.random() * 255 );
					colors.push( Math.random() * 255 );
    });

    console.log(colors)
    const colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );
    pointsGeometry.setAttribute( 'color', colorAttribute );
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    // pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 8,
      sizeAttenuation: false,
      vertexColors: true,
      map: circleSprite,
      transparent: true
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    const zoom = d3.zoom()
      .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
      .on('zoom', (event) => zoomHandler(event.transform));

    const view = d3.select(renderer.domElement);
    setUpZoom();

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 10;

    view.on("mousemove", (event) => {
      const [mouseX, mouseY] = d3.pointer(event);
      checkIntersects([mouseX, mouseY]);
    });

    function setUpZoom() {
      view.call(zoom);
      const initialScale = getScaleFromZ(far);
      const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale);
      zoom.transform(view, initialTransform);
      camera.position.set(0, 0, far);
    }

    function zoomHandler(transform) {
      const scale = transform.k;
      const x = -(transform.x - width / 2) / scale;
      const y = (transform.y - height / 2) / scale;
      const z = getZFromScale(scale);
      camera.position.set(x, y, z);
    }

    function getScaleFromZ(cameraZPosition) {
      const halfFov = fov / 2;
      const halfFovRadians = toRadians(halfFov);
      const halfFovHeight = Math.tan(halfFovRadians) * cameraZPosition;
      const fovHeight = halfFovHeight * 2;
      return height / fovHeight;
    }

    function getZFromScale(scale) {
      const halfFov = fov / 2;
      const halfFovRadians = toRadians(halfFov);
      const scaleHeight = height / scale;
      return scaleHeight / (2 * Math.tan(halfFovRadians));
    }

    function toRadians(angle) {
      return angle * (Math.PI / 180);
    }

    function mouseToThree(mouseX, mouseY) {
      return new THREE.Vector3(
        (mouseX / width) * 2 - 1,
        -(mouseY / height) * 2 + 1,
        1
      );
    }

    function checkIntersects(mousePosition) {
      const mouseVector = mouseToThree(...mousePosition);
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObject(points);
      if (intersects[0]) {
        const sortedIntersects = _.sortBy(intersects, "distanceToRay");
        const intersect = sortedIntersects[0];
        const index = intersect.index;
        const datum = data[index];
        highlightPoint(datum);
        showTooltip(mousePosition, datum);
      } else {
        removeHighlights();
        hideTooltip();
      }
    }

    const hoverContainer = new THREE.Object3D();
    scene.add(hoverContainer);

    function highlightPoint(datum) {
      removeHighlights();

      const geometry = new THREE.BufferGeometry();
      const position = new Float32Array([datum.x, datum.y, 0]);
      geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
      const color = new Float32Array(new THREE.Color(colorArray[datum.group]).toArray());
      geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));

      const material = new THREE.PointsMaterial({
        size: 26,
        sizeAttenuation: false,
        vertexColors: true,
        map: circleSprite,
        transparent: true
      });

      const point = new THREE.Points(geometry, material);
      hoverContainer.add(point);
    }

    function removeHighlights() {
      hoverContainer.remove(...hoverContainer.children);
    }

    function showTooltip(mousePosition, datum) {
      const tooltipWidth = 120;
      const xOffset = -tooltipWidth / 2;
      const yOffset = 30;
      setTooltipState({
        display: 'block',
        left: mousePosition[0] + xOffset,
        top: mousePosition[1] + yOffset,
        name: `Point ${datum.id}`,
        group: datum.group
      });
    }

    function hideTooltip() {
      setTooltipState(prevState => ({ ...prevState, display: 'none' }));
    }

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

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
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <div ref={mountRef} />
      <div id="tooltip" style={{
        display: tooltipState.display,
        position: 'absolute',
        pointerEvents: 'none',
        fontSize: '13px',
        width: '120px',
        textAlign: 'center',
        lineHeight: 1,
        padding: '6px',
        background: 'white',
        fontFamily: 'sans-serif',
        left: `${tooltipState.left}px`,
        top: `${tooltipState.top}px`
      }}>
        <div id="point_tip" style={{
          padding: '4px',
          marginBottom: '4px',
          background: colorArray[tooltipState.group]
        }}>
          {tooltipState.name}
        </div>
        <div id="group_tip" style={{ padding: '4px' }}>
          Group {tooltipState.group}
        </div>
      </div>
    </>
  );
};

export default ThreeVisualization;
