import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three';


/** Describes a single architecture node (service, database, broker, etc.) */
export interface ArchNode {
  name: string;
  type: 'client' | 'gateway' | 'loadbalancer' | 'pod' | 'kafka' | 'database' | 'cache' | 'monitoring';
  position: THREE.Vector3;
  color: number;
  mesh?: THREE.Mesh;
  label?: CSS2DObject;
}
