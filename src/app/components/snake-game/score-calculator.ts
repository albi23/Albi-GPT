export class ScoreCalculator  {
  private readonly segmentFunctions = new Map<number, (val: number) => number>([
      [4, (val: number): number => val + 10],
      [6, (val: number): number => val + 20],
      [10, (val: number): number => val + 30],
      [15, (val: number): number => val + 40],
      [20, (val: number): number => val + 50]
    ]);
  private readonly mapKeyIt: IterableIterator<number> = this.segmentFunctions.keys();
  private currentBucketKey = this.mapKeyIt.next().value;


  calculateScore(currentScore: number, gainedDots: number): number {
    if (gainedDots < this.currentBucketKey) {
      return (this.segmentFunctions.get(this.currentBucketKey) as (val: number) => number)(currentScore);
    } else {
      const itVal = this.mapKeyIt.next();
      if (!itVal.done) {
        this.currentBucketKey = itVal.value;
        return (this.segmentFunctions.get(this.currentBucketKey) as (val: number) => number)(currentScore);
      }
      return currentScore + (gainedDots + 20);
    }
  }

}
