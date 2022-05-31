<script>
  import { Alert } from "sveltestrap/src";
  import {
    loginDone, userStore
  } from "../../commonStore";


  export let theUser = null;
  export let authLoad = false;

  loginDone.subscribe(isAuthLoaded => {
    if (isAuthLoaded == true) {
      authLoad = true;
      
    }
  });

  userStore.subscribe(u => {
    if (u !== null) {
      theUser = u;
    }
  });

  export const authP = function() {
    return new Promise((resolve, reject) => {
      let tInterval = setInterval(() => {
        if (authLoad == true) {
          if (theUser !== null && `${theUser}` !== 'undefined') {
            // do gets 
            console.log("got a user");
            // console.log(theUser);
            clearInterval(tInterval);
            resolve(true);
          } else {
            clearInterval(tInterval);
            window.location.href = window.origin;
            resolve(false);

          }
        }
      },250);
    });
  }


  let authPromise = authP();
</script>


{#await authPromise}
  Loading...
{:then authed}
  {#if authed == true}
    <slot></slot>  
  {/if}
{:catch ex}
  <Alert color="danger">
    {ex.message || "Fatal Error Loading Page. Try refeshing, or go back to the index page."}
  </Alert>
{/await}
