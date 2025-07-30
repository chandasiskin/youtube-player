import { Component, inject, OnInit } from '@angular/core';
import { Video } from '../models/video';
import { Playlist } from '../services/playlist';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [CommonModule],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {
  private playlistService = inject(Playlist);

  playlist: Video[] = [];

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(data => this.playlist = data);
  }

  play(video: Video) {
    this.playlistService.setCurrentVideo(video);
    console.log(video);
  }
}
