import {Point} from '../../types/types';

export class Utils {

  static getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  static getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1));
  }

  static pickRandom<T>(array: T[]): T {
    return array[Utils.getRandomInt(array.length)];
  }

  static calculateDistance(point1: Point, point2: Point): number {
    return Math.sqrt(Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2));
  }

  static isMobileDevice(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }
}
