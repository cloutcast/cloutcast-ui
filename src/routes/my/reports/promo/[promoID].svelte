<script context="module">
  export async function preload({params}) {
    try {
      let {promoID} = params;
      return {promoID};
    } catch (ex) {
      console.error(ex);
      return null;
    }
  }
</script>

<script>
import {userStore} from "../../../../commonStore"
import { Alert } from "sveltestrap";
import LoadingBlinker from "../../../../components/LoadingBlinker.svelte";

import {stores} from "@sapper/app";
const {page} = stores();



export let promoID;

let tUser = null;

userStore.subscribe(u => tUser = u);

export const promoPromise = async function() {
  if (process.browser) {
    let thePromos = await fetch(`/api/promotion/get/single/${promoID}.json`, {headers: {
      "Authorization" : `Bearer ${tUser.cc.jwt}`
    }});

    let tOut = await thePromos.json();
    return tOut;
  }
}

let thePromise = promoPromise();

if (typeof window !== "undefined" && typeof document !== "undefined") {
  page.subscribe(({ path, params, query }) => {
    const from = window.location.pathname;
    // const redirect = (href) => { goto(href); }
    thePromise = promoPromise();
  });
}


</script>

{#await thePromise}
 <LoadingBlinker jumbotron altText="This may take a long time...." />
{:then promoData}

  {#if promoID == null}
    <Alert color="danger">
      Error!! 
    </Alert>
  {:else}
    {promoID}
    {JSON.stringify(promoData)}
  {/if}
{:catch error}
  <Alert color="danger">
    There was an error: {error}
  </Alert>
{/await}