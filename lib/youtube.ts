"use client"
import axios from "axios";


export async function searchYoutube(searchQuery:string){
    searchQuery=encodeURIComponent(searchQuery)
    const { data } = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
    );
    if(!data){
        console.log("youtube api failed")
        return null
    }
    if(data.items[0]==undefined){
        console.log("youtube api failed")
        return null
    }
    const res:string= data?.items[0].id.videoId;
    return res;
}
