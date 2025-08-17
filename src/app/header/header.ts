import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Playlist } from '../services/playlist';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private playlistService = inject(Playlist);

  videoUrl: string = '';

  submit() {
    this.playlistService.addVideoByUrl(this.videoUrl);
    this.videoUrl = '';
  }
}
