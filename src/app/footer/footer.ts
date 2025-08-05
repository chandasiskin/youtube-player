import { Component, inject, OnInit } from '@angular/core';
import { Playlist } from '../services/playlist';
import { Video } from '../models/video';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  private playlistService = inject(Playlist);
  private sanitizer = inject(DomSanitizer);

  copyrightYear: Number = new Date().getFullYear();

  currentVideoUrl: SafeResourceUrl | null = null;
  currentVideoTitle: String | null = null;

  ngOnInit(): void {
    this.playlistService.currentVideo$.subscribe((video: Video | null ) => {
      if (video) {
        const url = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

        this.currentVideoTitle = video.title;
      } else {
        this.currentVideoUrl = null;
      }
    });
  }
}
