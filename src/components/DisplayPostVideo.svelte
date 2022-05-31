

<script>
  export let videoURL;
  // https://bitclout.com/posts/5853950402f4a05180cd4e4e036b5a75c06f710324044de6501817a37a8e607f?feedTab=Global

  let youtubeRegex = /.*youtube.*/;
  let tiktokRegex = /.*tiktok.*/;
  // console.log(videoURL);
</script>
<br />
{#if /.*vimeo.*/.test(videoURL)}
<iframe
  title="vimeo-video" 
  frameborder="0" 
  allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer;" 
  allowfullscreen=""  
  height="200" 
  src="{videoURL}" style="margin-top: -30px; margin-bottom: -30px;">
</iframe>
{:else if youtubeRegex.test(videoURL)}
<iframe
  title="youtube-video" 
  frameborder="0" 
  allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer;" 
  allowfullscreen=""  
  height="200" 
  src="{videoURL}">
</iframe>
{:else if tiktokRegex.test(videoURL)}  
<iframe
  title="tiktok-video" 
  frameborder="0" 
  allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer;" 
  allowfullscreen=""  
  height="700" 
  src="{videoURL}">
</iframe>
{/if}