import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Video } from '../models/video';
import { Playlist } from '../services/playlist';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';

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
  selector: 'app-main',
  imports: [CommonModule],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {
  private playlistService = inject(Playlist);
  private zone = inject(NgZone);

  private player: any;

  playlist: Video[] = [];

  currentVideo: Video | null = null;
  currentVideoUrl: SafeResourceUrl | null = null;

  progress: number = 0;
  private currentTime: Number = 0;

  currentState: "play_arrow" | "pause" | "brand_awareness" = "play_arrow";

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(pl => this.playlist = pl);
    this.playlistService.currentVideo$.subscribe((video: Video | null) => {
      if (video) {
        this.currentVideo = video;

        this.player.cueVideoById(video.id);
        setTimeout(() => this.player.playVideo(), 500);
      }
    });

    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=5RsGpSyOpIc");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=Bxap7stTsY8");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=3IYcAZU1X9o");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=RLXDT6LOeEw");

    this.createPlayer();
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
    console.log("Player ready: ", event);
  }

  private onPlayerStateChange(event: any): void {
    let newState: "play_arrow" | "pause" | "brand_awareness" = "play_arrow";

    // If song starts playing
    if (event.data === PLAYER_STATE_PLAYING) {
      newState = "brand_awareness";
    }
    
    // If song is paused
    else if (event.data === PLAYER_STATE_PAUSED) {
      newState = "pause";
    }
    
    // If song has ended
    else if (event.data === PLAYER_STATE_ENDED) {
      this.playNextVideo();
    }
    
    // Update state and trigger Angular change detection
    this.zone.run(() => this.currentState = newState );
  }

  playPause(video: Video): void {
    if (this.player) {
      // If clicked on the current video, and it is currently playing, pause it
      if (this.player.getPlayerState() === PLAYER_STATE_PLAYING && this.currentVideo && this.currentVideo.uuid === video.uuid) {
        this.currentTime = this.player.getCurrentTime();
        this.player.pauseVideo();
      }

      // If clicked on the current video, and it is currently pause, resume it
      else if (this.player.getPlayerState() === PLAYER_STATE_PAUSED && this.currentVideo && this.currentVideo.uuid === video.uuid) {
        this.player.seekTo(this.currentTime, false);
        this.player.playVideo();
      }

      // Else, start playing
      else {
        this.playlistService.setCurrentVideo(video);
      }
    }
  }

  playNextVideo(): void {
    const index = this.playlist.findIndex(video => video.uuid === this.currentVideo?.uuid);
    
    if (index === -1 || index + 1 >= this.playlist.length) {
      return;
    }

    const nextVideo = this.playlist[index + 1];
    this.playlistService.setCurrentVideo(nextVideo);
  }

  playPreviousVideo(): void {
    const index = this.playlist.findIndex(video => video.uuid === this.currentVideo?.uuid);
    
    if (index <= 0) {
      return;
    }

    const previousVideo = this.playlist[index - 1];
    this.playlistService.setCurrentVideo(previousVideo);
  }
}
