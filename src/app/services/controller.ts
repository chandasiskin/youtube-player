import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlayerCommands } from '../enums/playerCommands.enum';

@Injectable({
  providedIn: 'root'
})
export class Controller {
  private controller = new Subject<PlayerCommands>();

  get controller$(): Observable<PlayerCommands> {
    return this.controller.asObservable();
  }

  sendCommand(command: PlayerCommands): void {
    this.controller.next(command);
  }
}
