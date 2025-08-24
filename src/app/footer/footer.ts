import { Component, inject } from '@angular/core';
import { Controller } from '../services/controller';
import { PlayerCommands } from '../enums/playerCommands.enum';
import { CommonModule } from '@angular/common';
import { Playlist } from '../services/playlist';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  private controllerService = inject(Controller);
  private playlistService = inject(Playlist);

  doShuffle: boolean = false;
  doRepeat: 'none' | 'one' | 'all' = 'none';

  nextSong(): void {
    this.controllerService.sendCommand(PlayerCommands.Next);
  }

  previousSong(): void {
    this.controllerService.sendCommand(PlayerCommands.Previous);
  }

  toggleShuffle(): void {
    this.playlistService.toggleShuffle();

    this.doShuffle = this.playlistService.shouldShuffle();
  }

  toggleRepeat(): void {
    this.playlistService.toggleRepeat();

    this.doRepeat = this.playlistService.getRepeat();
  }

  getRepeatIcon(): string {
    if (this.doRepeat === 'one') {
      return 'repeat_one';
    } else {
      return 'repeat';
    }
  }

  playPause(): void {
    this.controllerService.sendCommand(PlayerCommands.PlayPause);
  }
}
