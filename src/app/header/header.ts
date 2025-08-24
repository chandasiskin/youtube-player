import { Component, EventEmitter, inject, NgZone, OnInit, Output } from '@angular/core';
import { Playlist } from '../services/playlist';
import { Video } from '../models/video';
import { Controller } from '../services/controller';
import { PlayerCommands } from '../enums/playerCommands.enum';

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
  private controllerService = inject(Controller);
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

    this.controllerService.controller$.subscribe((command: PlayerCommands) => {
      switch(command) {
        case PlayerCommands.Next:
          let endedNaturally: boolean = false;
          this.playNextVideo(endedNaturally);
          break;
        case PlayerCommands.Previous: this.playPreviousVideo(); break;
        case PlayerCommands.Pause: this.pauseVideo(); break;
        case PlayerCommands.Play: this.playVideo(); break;
      }
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
      let endedNaturally: boolean = true;
      this.playNextVideo(endedNaturally);
    }
  }

  private playVideo(): void {

  }

  private pauseVideo(): void {

  }

  private playNextVideo(endedNaturally: boolean): void {
    const index = this.playlist.findIndex(video => video.uuid === this.currentVideo.uuid);
    const shouldShuffle = this.playlistService.shouldShuffle();
    let nextIndex;

    // If 'repeat same song' is toggled
    if (this.playlistService.getRepeat() === 'one') {
      // If song ended naturally, repeat song
      if (endedNaturally) {
        nextIndex = index;
      }
    }
    
    // If 'shuffle' is toggled
    if (nextIndex === undefined && shouldShuffle) {
      nextIndex = Math.floor(Math.random() * this.playlist.length);
    }
    
    // If on the last song
    if (nextIndex === undefined && index + 1 >= this.playlist.length) {
      // If 'repeat all' is toggled
      if (this.playlistService.getRepeat() === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    
    // Go to next song
    if (nextIndex === undefined) {
      nextIndex = index + 1;
    }
    
    const nextVideo = this.playlist[nextIndex];

    this.playlistService.playVideo(nextVideo);
  }

  private playPreviousVideo(): void {
    let nextIndex;

    const index = this.playlist.findIndex(video => video.uuid === this.currentVideo.uuid);

    // If user pressed button after 3 seconds, restart the song
    if (this.player.getCurrentTime() > 3) {
      nextIndex = index;
    } else {
      nextIndex = index - 1;
    }

    if (index <= 0) {
      return;
    }

    const previousVideo = this.playlist[nextIndex];
    this.playlistService.playVideo(previousVideo);
  }
}
