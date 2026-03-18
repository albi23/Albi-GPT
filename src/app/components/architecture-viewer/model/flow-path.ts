import * as THREE from 'three';

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
