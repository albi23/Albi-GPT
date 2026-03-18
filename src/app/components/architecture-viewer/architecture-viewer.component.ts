import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  ViewChild,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import {Renderable} from '../../model/renderable';
import {ArchitectureScene} from './architecture-scene';
import {fromEvent, Subject, take, takeUntil, merge, filter, switchMap, interval, timer, map, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UserActivityService} from '../../services/user-activity.service';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Component({
  selector: 'albi-architecture-viewer',
  standalone: true,
  imports: [],
  template: `
    <div class="arch-header">
      <span class="arch-badge">LIVE</span>
      <span class="arch-title">Distributed System Architecture</span>
    </div>
    <div #sceneContainer class="scene-container"></div>
    <div class="arch-legend">
      <span class="legend-item"><span class="dot" style="background:#4fc3f7"></span>Clients</span>
      <span class="legend-item"><span class="dot" style="background:#81c784"></span>Java Pods</span>
      <span class="legend-item"><span class="dot" style="background:#ff7043"></span>Kafka</span>
      <span class="legend-item"><span class="dot" style="background:#64b5f6"></span>Database</span>
      <span class="legend-item"><span class="dot" style="background:#ef5350"></span>Cache</span>
      <span class="legend-item"><span class="dot" style="background:#00bcd4"></span>K8s Cluster</span>
    </div>
    <div class="buttons">
      <button class="button" #continueBtn><span>{{ buttonText() }}</span><i></i></button>
    </div>
  `,
  styleUrls: ['./architecture-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitectureViewerComponent extends Renderable implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private activityService = inject(UserActivityService);

  @ViewChild('sceneContainer', {read: ElementRef}) sceneContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('continueBtn', {read: ElementRef}) continueBtn!: ElementRef<HTMLButtonElement>;

  buttonText: WritableSignal<string> = signal<string>('Next');

  private archScene: ArchitectureScene | null = null;
  private evt!: EventEmitter<boolean>;
  private readonly inactivitySkip = new Subject<void>();
  private readonly INACTIVITY_TIME_OUT = environment.INACTIVITY_TIME_OUT;
  private readonly destroy$ = new Subject<void>();
  private readonly PREFERRED_WITH = 1024;
  private readonly MAX_WIDTH_FACTOR = 0.90;
  private readonly MAX_HEIGHT_FACTOR = 0.65;
  private readonly PREFERRED_HEIGHT = 748;


  constructor() {
    super();

    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onResize());
  }

  override renderDone(evt: EventEmitter<boolean>): void {
    this.evt = evt;
    Renderable.scrollToBottom();
    this.cdr.markForCheck();
    Renderable.scrollToBottomAfterDelay(100);
  }

  ngAfterViewInit(): void {
    this.initScene();

    merge(
      fromEvent(this.continueBtn.nativeElement, 'click'),
      this.inactivitySkip
    ).pipe(
      take(1),
      tap(() => this.inactivitySkip.next())
    ).subscribe(() => this.evt.emit(true));

    this.startInactivityDetection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.archScene?.dispose();
  }


  private initScene(): void {
    const container = this.sceneContainer.nativeElement;
    const width = Math.max(this.PREFERRED_WITH, container.offsetWidth * this.MAX_WIDTH_FACTOR);
    const height = Math.min(this.PREFERRED_HEIGHT, window.innerHeight * this.MAX_HEIGHT_FACTOR);

    container.style.width = width + 'px';
    container.style.height = height + 'px';

    this.archScene = new ArchitectureScene(container, width, height);
    Renderable.scrollToBottomAfterDelay(200);
  }

  private onResize(): void {
    if (!this.archScene || !this.sceneContainer) return;
    const container = this.sceneContainer.nativeElement;
    const width = Math.max(this.PREFERRED_WITH, container.offsetWidth * this.MAX_WIDTH_FACTOR);
    const height = Math.min(this.PREFERRED_HEIGHT, window.innerHeight * this.MAX_HEIGHT_FACTOR);
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    this.archScene.resize(width, height);
  }

  private startInactivityDetection(): void {
    const userMoves$ = this.activityService.listenUserEvents()
      .pipe(filter(x => x !== null)) as Observable<Event>;

    interval(this.INACTIVITY_TIME_OUT).pipe(
      take(1),
      switchMap(() => userMoves$),
      tap(() => this.buttonText.set('Next')),
      switchMap(() =>
        interval(this.INACTIVITY_TIME_OUT).pipe(
          take(1),
          switchMap(() => timer(0, 1000).pipe(map((i: number) => i + 1))),
        )
      ),
      filter((val: number): boolean => val > 4),
      takeUntil(this.inactivitySkip),
    ).subscribe((count: number): void => {
      this.buttonText.set(`Next ${10 - count}`);
      if (count == 10) {
        this.buttonText.set('Next');
        this.inactivitySkip.next();
      }
    });
  }
}
