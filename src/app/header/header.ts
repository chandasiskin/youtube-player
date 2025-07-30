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

  videoUrl: string = 'https://www.youtube.com/watch?v=yebNIHKAC4A&list=RDyebNIHKAC4A&start_radio=1';

  submit() {
    this.playlistService.addVideoByUrl(this.videoUrl);
    //this.videoUrl = '';
  }
}
