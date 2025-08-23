import { Component, inject } from '@angular/core';
import { Playlist } from '../services/playlist';
import { Video } from '../models/video';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  currentVideo: Video | null =  {
      uuid: performance.now(),
      id: "yebNIHKAC4A",
      title: "“Golden” Official Lyric Video | KPop Demon Hunters | Sony Animation",
      thumbnailUrl: "https://i.ytimg.com/vi/yebNIHKAC4A/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/yebNIHKAC4A?si=dHgc7tXenh4g3ctw",
      duration: "10",
      durationInSeconds: 199,
    };
  
    
}
