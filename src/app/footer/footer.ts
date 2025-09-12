import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Controller } from '../services/controller';
import { PlayerCommands } from '../enums/playerCommands.enum';
import { CommonModule } from '@angular/common';
import { Playlist } from '../services/playlist';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})

export class Footer implements OnInit {
  @ViewChild('addVideoInput') addVideoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadPlaylist') uploadPlaylist!: ElementRef<HTMLInputElement>;

  private controllerService = inject(Controller);
  private playlistService = inject(Playlist);

  doShuffle: boolean = false;
  doRepeat: 'none' | 'one' | 'all' = 'none';
  isAddVideoVisible: boolean = false;
  youtubeUrl: string = '';

  ngOnInit(): void {
    // When user presses space, prevent page from scrolling
    document.addEventListener('keydown', (event) => {
      if (event?.code === 'Space') {
        event.preventDefault();
      }
    });

    // When user presses space, play or pause current song
    document.addEventListener('keyup', (event) => {
      if (event?.code === 'Space') {
        this.playPause();
      }
    });
  }

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
    return this.doRepeat === 'one' ? 'repeat_one' : 'repeat';
  }

  playPause(): void {
    this.controllerService.sendCommand(PlayerCommands.PlayPause);
  }

  download(): void {
    const playlist: string = this.playlistService.exportPlaylist();
    const blob = new Blob([playlist], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  onFileChange(event: any): void {
    const input = this.uploadPlaylist.nativeElement;
    const file = event.target.files[0];

    input.value = '';

    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        this.newPlaylist();

        const playlist = JSON.parse(e.target.result);
        console.log(playlist);
        if (Array.isArray(playlist)) {
          playlist.forEach(video => this.playlistService.addVideoToPlaylist(video));
        }
      }

      reader.readAsText(file);
    }
  }

  hideShowAddVideo(): void {
    this.isAddVideoVisible = !this.isAddVideoVisible;
    
    if (this.isAddVideoVisible) {
      setTimeout(() => this.addVideoInput.nativeElement.focus(), 0);
    }
  }

  addVideo(): void {
    this.playlistService.addVideoByUrl(this.youtubeUrl)
    this.isAddVideoVisible = false;
    setTimeout(() => this.youtubeUrl = '', 500);
  }

  newPlaylist(): void {
    this.playlistService.clearPlaylist();
  }

  randomizePlaylist(): void {
    this.playlistService.randomizePlaylist();
  }
}
