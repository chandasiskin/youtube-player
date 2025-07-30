import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Video } from '../models/video';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Playlist {
  private playlist = new BehaviorSubject<Video[]>([]);
  private currentVideo = new BehaviorSubject<Video | null>(null);

  playlist$ = this.playlist.asObservable();
  currentVideo$ = this.currentVideo.asObservable();

  addVideoByUrl(youtubeUrl: string) {
    const videoId = this.extractVideoId(youtubeUrl);

    if (!videoId) return;

    const apiKey = environment.apiKey;
    const apiUrl = environment.apiUrl + '&key=' + apiKey + '&id=' + videoId;

    const video: Video = {
      id: videoId,
      title: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      url: youtubeUrl
    };

    const current = this.playlist.value;
    this.playlist.next([...current, video]);

    /*this.http.get<any>(apiUrl)
      .pipe(map(res => {
        const snippet = res.items[0]?.snippet;
        if (!snippet) return null;
        const video: Video = {
          id: videoId,
          title: snippet.title,
          thumbnailUrl: snippet.thumbnails.default.url,
          url: youtubeUrl
        };
        return video;
      }))
      .subscribe(video => {
        if (video) {
          const current = this.playlist.value;
          this.playlist.next([...current, video]);
        }
      });*/
  }

  setCurrentVideo(video: Video) {
    this.currentVideo.next(video);
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);

    return match ? match[1] : null;
  }
}
