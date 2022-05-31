<script>

import {
  Jumbotron
} from 'sveltestrap/src';

export let jumbotron = false;
export let centered = true;
export let fullWidth = true;
export let noText = false;
export let altText = null;
</script>

<style>
  .blinkLoad {
    animation: blinker 1.5s linear infinite;
  }

  .smolIcon {
    vertical-align: middle;
    height: 1.3em;
  }

  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
</style>


{#if jumbotron}
  <Jumbotron>
    <h1 class="blinkLoad" class:text-center={centered}>
      <img src="/logoSquare.png" alt="logo" />
      {#if noText == false}
        Loading...
      {/if}
      {#if altText !== null} 
        {altText}
      {/if}
    </h1>
  </Jumbotron>
{:else}
  <div class="blinkLoad" class:w-100={fullWidth} class:text-center={centered}>
    <img class="smolIcon" src="/logoSquare.png" alt="logo" />
    {#if noText == false}
      Loading...
    {/if}
  </div>
{/if}