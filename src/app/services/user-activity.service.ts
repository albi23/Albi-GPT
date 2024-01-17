import {BehaviorSubject, Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class UserActivityService {

  private readonly userEvent: BehaviorSubject<Event | null> = new BehaviorSubject<Event | null>(new CustomEvent('active'));

  nextEvt(evt: Event | null): void {
    this.userEvent.next(evt);
  }

  listenUserEvents(): Observable<Event | null> {
    return this.userEvent.asObservable();
  }

}

