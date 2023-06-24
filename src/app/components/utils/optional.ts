export class Optional<T> {

  readonly val: T

  private constructor(arg: T) {
    this.val = arg
  }

  static of<T>(arg: T | undefined): Optional<T> {
    return new Optional<T>(arg as T)
  }

  ifPresent<T>(action: (arg: T) => void): void {
    if (this.val !== null) {
      action(this.val as T)
    }
  }

  ifPresentOrElse(consumer: (arg: T) => void, action: () => void): void {
    if (this.val !== null && this.val !== undefined) {
      consumer(this.val as T)
    } else {
      action()
    }
  }
}
