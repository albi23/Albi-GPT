import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {CSS2DObject, CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/** Describes a single architecture node (service, database, broker, etc.) */
export interface ArchNode {
  name: string;
  type: 'client' | 'gateway' | 'loadbalancer' | 'pod' | 'kafka' | 'database' | 'cache' | 'monitoring';
  position: THREE.Vector3;
  color: number;
  mesh?: THREE.Mesh;
  label?: CSS2DObject;
}

/** Describes a data-flow connection between two nodes */
export interface FlowPath {
  from: string;
  to: string;
  color: number;
  speed: number;
  particles: THREE.Mesh[];
  curve: THREE.CatmullRomCurve3;
  progresses: number[];
}

export class ArchitectureScene {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private labelRenderer!: CSS2DRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private clock = new THREE.Clock();

  private nodes: ArchNode[] = [];
  private flows: FlowPath[] = [];
  private nodeMap = new Map<string, ArchNode>();

  private readonly PARTICLE_COUNT_PER_FLOW = 3;

  constructor(private container: HTMLElement, private width: number, private height: number) {
    this.initScene();
    this.buildArchitecture();
    this.buildFlows();
    this.animate();
  }


  private initScene(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000022, 0.012);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 500);
    this.camera.position.set(0, 28, 25);
    this.camera.lookAt(0, 0, 0);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000022, 1);
    this.container.appendChild(this.renderer.domElement);

    // CSS2D Renderer (labels)
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.width, this.height);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.labelRenderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 60;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.6;

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 1.5);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(10, 20, 15);
    this.scene.add(directional);

    const pointLight = new THREE.PointLight(0xff0099, 0.8, 60);
    pointLight.position.set(0, 12, 0);
    this.scene.add(pointLight);

    // Ground grid
    this.buildGround();
  }

  private buildGround(): void {
    const gridHelper = new THREE.GridHelper(60, 40, 0x113355, 0x0a1a2a);
    gridHelper.position.y = -0.5;
    this.scene.add(gridHelper);

    // Transparent ground plane for subtle reflection
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x000022,
      transparent: true,
      opacity: 0.6,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.49;
    this.scene.add(ground);
  }

  // Architecture Nodes

  private buildArchitecture(): void {
    // --- Client Layer (front, z = 14) ---
    this.addNode({name: 'Mobile App', type: 'client', position: new THREE.Vector3(-5, 0, 14), color: 0x4fc3f7});
    this.addNode({name: 'Web Browser', type: 'client', position: new THREE.Vector3(5, 0, 14), color: 0x4fc3f7});

    // --- Edge Layer (z = 8) ---
    this.addNode({name: 'API Gateway', type: 'gateway', position: new THREE.Vector3(0, 0, 8), color: 0xffb74d});
    this.addNode({name: 'Load Balancer', type: 'loadbalancer', position: new THREE.Vector3(0, 0, 3), color: 0xce93d8});

    // --- Service Layer / Java Pods (z = -2) ---
    this.addNode({name: 'Order Service', type: 'pod', position: new THREE.Vector3(-10, 0, -2), color: 0x81c784});
    this.addNode({name: 'User Service', type: 'pod', position: new THREE.Vector3(0, 0, -2), color: 0x81c784});
    this.addNode({name: 'Payment Service', type: 'pod', position: new THREE.Vector3(10, 0, -2), color: 0x81c784});

    // --- Messaging Layer / Kafka (z = -8) ---
    this.addNode({name: 'Kafka Broker 1', type: 'kafka', position: new THREE.Vector3(-5, 0, -8), color: 0xff7043});
    this.addNode({name: 'Kafka Broker 2', type: 'kafka', position: new THREE.Vector3(5, 0, -8), color: 0xff7043});

    // --- Data Layer (z = -14) ---
    this.addNode({name: 'PostgreSQL', type: 'database', position: new THREE.Vector3(-10, 0, -14), color: 0x64b5f6});
    this.addNode({name: 'Redis', type: 'cache', position: new THREE.Vector3(0, 0, -14), color: 0xef5350});
    this.addNode({name: 'Elasticsearch', type: 'database', position: new THREE.Vector3(10, 0, -14), color: 0xfdd835});

    // --- Infrastructure / Monitoring (side) ---
    this.addNode({name: 'Prometheus', type: 'monitoring', position: new THREE.Vector3(-16, 0, -8), color: 0xe57373});

    // Kubernetes boundary wireframe
    this.addKubernetesBoundary();
  }

  private addNode(config: Omit<ArchNode, 'mesh' | 'label'>): void {
    const node: ArchNode = {...config};
    const mesh = this.createNodeMesh(node);
    node.mesh = mesh;
    this.scene.add(mesh);

    // Glow ring beneath the node
    this.addGlowRing(node);

    // Label
    const label = this.createLabel(node.name, node.color);
    label.position.set(0, this.getNodeHeight(node.type) + 0.8, 0);
    mesh.add(label);
    node.label = label;

    this.nodes.push(node);
    this.nodeMap.set(node.name, node);
  }

  private createNodeMesh(node: ArchNode): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    const h = this.getNodeHeight(node.type);

    switch (node.type) {
      case 'database':
        geometry = new THREE.CylinderGeometry(1.2, 1.2, h, 16);
        break;
      case 'cache':
        geometry = new THREE.CylinderGeometry(1.0, 1.0, h, 6); // hexagonal
        break;
      case 'kafka':
        geometry = new THREE.CylinderGeometry(0.8, 1.2, h, 8);
        break;
      case 'gateway':
        geometry = new THREE.BoxGeometry(3.5, h, 1.5);
        break;
      case 'loadbalancer':
        geometry = new THREE.OctahedronGeometry(1.3);
        break;
      case 'monitoring':
        geometry = new THREE.SphereGeometry(1.0, 16, 16);
        break;
      case 'client':
        geometry = new THREE.BoxGeometry(1.8, h, 1.0);
        break;
      case 'pod':
      default:
        geometry = new THREE.BoxGeometry(2.0, h, 2.0);
        break;
    }

    const material = new THREE.MeshStandardMaterial({
      color: node.color,
      emissive: node.color,
      emissiveIntensity: 0.15,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(node.position);
    mesh.position.y += h / 2;
    return mesh;
  }

  private getNodeHeight(type: ArchNode['type']): number {
    switch (type) {
      case 'database':
      case 'cache':
        return 2.0;
      case 'kafka':
        return 2.5;
      case 'gateway':
        return 1.5;
      case 'loadbalancer':
        return 1.8;
      case 'pod':
        return 3.0;
      case 'monitoring':
        return 1.5;
      case 'client':
        return 1.5;
      default:
        return 2.0;
    }
  }

  private addGlowRing(node: ArchNode): void {
    const ringGeo = new THREE.RingGeometry(1.5, 2.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(node.position);
    ring.position.y = 0.01;
    this.scene.add(ring);
  }

  private createLabel(text: string, color: number): CSS2DObject {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.color = '#' + color.toString(16).padStart(6, '0');
    div.style.fontSize = '11px';
    div.style.fontFamily = '\'JetBrains Mono\', monospace';
    div.style.fontWeight = '600';
    div.style.textShadow = '0 0 6px rgba(0,0,0,0.9)';
    div.style.whiteSpace = 'nowrap';
    div.style.userSelect = 'none';
    return new CSS2DObject(div);
  }

  private addKubernetesBoundary(): void {
    // Draw a wireframe box around the services/kafka/data layers
    const boxGeo = new THREE.BoxGeometry(30, 6, 20);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00bcd4,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.position.set(0, 3, -8);
    this.scene.add(wireframe);

    // K8s label
    const label = this.createLabel('Kubernetes Cluster', 0x00bcd4);
    label.position.set(0, 6.5, -8);
    this.scene.add(label);
  }


  private buildFlows(): void {
    // Client → Gateway
    this.addFlow('Mobile App', 'API Gateway', 0x4fc3f7, 0.4);
    this.addFlow('Web Browser', 'API Gateway', 0x4fc3f7, 0.5);

    // Gateway → Load Balancer
    this.addFlow('API Gateway', 'Load Balancer', 0xffb74d, 0.6);

    // Load Balancer → Pods (fan-out)
    this.addFlow('Load Balancer', 'Order Service', 0xce93d8, 0.5);
    this.addFlow('Load Balancer', 'User Service', 0xce93d8, 0.6);
    this.addFlow('Load Balancer', 'Payment Service', 0xce93d8, 0.45);

    // Pods → Kafka (event publishing)
    this.addFlow('Order Service', 'Kafka Broker 1', 0xff7043, 0.7);
    this.addFlow('Payment Service', 'Kafka Broker 2', 0xff7043, 0.6);

    // Kafka → consuming pods
    this.addFlow('Kafka Broker 1', 'User Service', 0xff7043, 0.55);
    this.addFlow('Kafka Broker 2', 'Order Service', 0xff7043, 0.5);

    // Pods → Databases
    this.addFlow('Order Service', 'PostgreSQL', 0x64b5f6, 0.4);
    this.addFlow('User Service', 'Redis', 0xef5350, 0.8); // fast cache
    this.addFlow('User Service', 'PostgreSQL', 0x64b5f6, 0.35);
    this.addFlow('Payment Service', 'Elasticsearch', 0xfdd835, 0.45);

    // Monitoring connections
    this.addFlow('Prometheus', 'Kafka Broker 1', 0xe57373, 0.3);
    this.addFlow('Prometheus', 'Order Service', 0xe57373, 0.25);
  }

  private addFlow(fromName: string, toName: string, color: number, speed: number): void {
    const fromNode = this.nodeMap.get(fromName);
    const toNode = this.nodeMap.get(toName);
    if (!fromNode?.mesh || !toNode?.mesh) return;

    const start = fromNode.mesh.position.clone();
    const end = toNode.mesh.position.clone();

    // Create an arcing curve between nodes
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 2.5 + Math.random() * 1.5; // arc height

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);

    // Draw the path line
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    this.scene.add(line);

    // Create particles along the path
    const particles: THREE.Mesh[] = [];
    const progresses: number[] = [];
    const particleGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < this.PARTICLE_COUNT_PER_FLOW; i++) {
      const particle = new THREE.Mesh(particleGeo, particleMat);
      const progress = i / this.PARTICLE_COUNT_PER_FLOW;
      const pos = curve.getPointAt(progress);
      particle.position.copy(pos);
      this.scene.add(particle);
      particles.push(particle);
      progresses.push(progress);
    }

    this.flows.push({from: fromName, to: toName, color, speed, particles, curve, progresses});
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Update controls
    this.controls.update();

    // Animate particles along flow paths
    for (const flow of this.flows) {
      for (let i = 0; i < flow.particles.length; i++) {
        flow.progresses[i] += delta * flow.speed * 0.3;
        if (flow.progresses[i] > 1) {
          flow.progresses[i] -= 1;
        }
        const pos = flow.curve.getPointAt(flow.progresses[i]);
        flow.particles[i].position.copy(pos);

        // Pulse opacity for a "data packet" effect
        const mat = flow.particles[i].material as THREE.MeshBasicMaterial;
        mat.opacity = 0.5 + 0.5 * Math.sin(elapsed * 3 + i * 2);
      }
    }

    // Gentle bob on pods
    for (const node of this.nodes) {
      if (node.type === 'pod' && node.mesh) {
        const h = this.getNodeHeight(node.type);
        node.mesh.position.y = h / 2 + Math.sin(elapsed * 1.5 + node.position.x) * 0.15;
      }
      if (node.type === 'kafka' && node.mesh) {
        node.mesh.rotation.y += delta * 0.3;
      }
      if (node.type === 'monitoring' && node.mesh) {
        const mat = node.mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.15 + 0.15 * Math.sin(elapsed * 2);
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };


  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.controls.dispose();
    this.renderer.dispose();

    // Remove renderer canvases
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    if (this.labelRenderer.domElement.parentElement) {
      this.labelRenderer.domElement.parentElement.removeChild(this.labelRenderer.domElement);
    }

    // Dispose geometries and materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
