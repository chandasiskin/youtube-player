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
}
