import { Component, EventEmitter, inject, NgZone, OnInit, Output } from '@angular/core';
import { Playlist } from '../services/playlist';
import { Video } from '../models/video';

const PLAYER_STATE_UNSTARTED = -1;
const PLAYER_STATE_ENDED = 0;
const PLAYER_STATE_PLAYING = 1;
const PLAYER_STATE_PAUSED = 2;
const PLAYER_STATE_BUFFERING = 3;
const PLAYER_STATE_VIDEO_CUED = 5;

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  private playlistService = inject(Playlist);
  private zone = inject(NgZone);

  private player: any;
  private playlist: Video[] = [];

  private videoTemplate: Video = {
    uuid: performance.now(),
    id: "-1",
    title: "Select a song",
    thumbnailUrl: "https://cdn.pixabay.com/photo/2023/02/23/03/56/podcast-7807801_1280.jpg",
    url: "",
    duration: "",
    durationInSeconds: 0,
  }

  currentVideo: Video = this.videoTemplate;

  @Output() playerReady = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.createPlayer();

    this.playlistService.playlist$.subscribe(playlist => this.playlist = playlist);

    this.playlistService.currentVideo$.subscribe((video: Video | null) => {
      this.zone.run(() => {
        if (video) {
          this.currentVideo = video;

          this.player.cueVideoById(video.id)
          
          setTimeout(() => this.player.playVideo(), 500);
        } else {
          this.currentVideo = this.videoTemplate;
        }
      });
    });
  }

  private createPlayer(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.zone.runOutsideAngular(() => {
        this.player = new window.YT.Player('player', {
          height: '0',
          width: '0',
          playerVars: {
            playsinline: 1
          },
          events: {
            onReady: this.onPlayerReady.bind(this),
            onStateChange: this.onPlayerStateChange.bind(this)
          }
        });
      });
    }
  }

  private onPlayerReady(event: any): void {
    event.target.setVolume(100);
    
    this.zone.run(() => this.playerReady.emit(true));
  }

  private onPlayerStateChange(event: any): void {
    if (event.data === PLAYER_STATE_ENDED) {
      this.playNextVideo();
    }
  }

  
}
