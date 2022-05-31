<script>
  import {Breadcrumb, BreadcrumbItem, Container} from 'sveltestrap/src';
  export let activeName = null
  export let subHref = "/my/wallet";
  export let subText = "My CloutCast Wallet"
</script>
<style>
  span {
    font-size: 0.8rem;
  }
</style>
<div class="m-2 text-center">
  <span>
    <a href="/">CloutCast.io</a>
    {#if activeName == null}
      &nbsp;/&nbsp; 
      <span>
        {subText}
      </span>
    {:else}
      &nbsp;/&nbsp; 
      <span>
        <a href="{subHref}">{subText}</a>
      </span>
      &nbsp;/&nbsp;
      <span>
        {activeName}
      </span>
    {/if}
  </span>
</div>