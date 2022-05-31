
<script>
  import moment from 'moment';
import { onMount } from 'svelte';

  import {
    Card, CardHeader, CardBody, CardFooter, Icon
  } from 'sveltestrap/src';
import { toggleTheme } from '../commonStore';

  export let wallet;
  export let txn;
  export const nanosToBitClout = function(nanos) {
    return nanos * 0.000000001;
  }

  let negative = false;
  let pending = false;

  let emoji = "🚀";
  let color = "info";
  let shouldShow = false;
  let memo = "";
  let action = null;

  onMount(() => {
    let {entityLog = {}, memo: theMemo = "", debit, credit} = txn;
    
    let {action:theAction = null} = entityLog;
    action = theAction;
    memo = theMemo;
    
    switch (action) {
      case "PromotionStart":
        shouldShow = true;
        negative = true;
        emoji = "⏳";
        break;
      case "UserAddFunds":
        shouldShow = true;
        emoji = "💰";
        break;
      case "UserDidPromotion":
        if (typeof debit == 'undefined' || typeof credit == 'undefined') {
          console.log(txn);
        } else {
          shouldShow = true;
          emoji = "💹";
        }
        break;
      case "UserWithdrawFunds": 
        let {evidencePostHex} = txn;
        shouldShow = true;
        negative = true;
        color = 'success';
        if (typeof evidencePostHex == 'undefined') {
          pending = true;
        }
        break;
      default: 
        break;
      

    }

    if (negative == true && color == 'info') {
      color = "danger";
    }  
    
    if (pending == true) {
      color = "warning";
    }
  });

  
  


</script>

{#if shouldShow == true}
<Card {color} class="mb-2">
  <CardHeader class="superBold whiteText">
    {emoji}
    {#if pending == true}
    -- PENDING -- 
    {/if}
    &nbsp; {action}
   
  </CardHeader>
  {#if $toggleTheme == 'light'}
  <CardBody class="superBold whiteBG">
    {#if negative == false}
      ➕
    {:else}
      ➖
    {/if}
    {nanosToBitClout(txn.amount)} $DESO (~${Math.round(100*(txn.amount * wallet.xRate.nanosInUSDRounded))/100} USD)
    {#if memo !== ""}
      <br />
      {@html memo}
    {/if}
  </CardBody>
  <CardFooter class="whiteBG">
    {moment(txn.entityLog.timeStamp).toLocaleString()}
  </CardFooter>
  {:else}
    <CardBody class="superBold darkBG">
      {#if negative == false}
        ➕
      {:else}
        ➖
      {/if}
      {nanosToBitClout(txn.amount)} $DESO (~${Math.round(100*(txn.amount * wallet.xRate.nanosInUSDRounded))/100} USD)
      {#if memo !== ""}
        <br />
        {@html memo}
      {/if}
    </CardBody>
    <CardFooter class="darkBG">
      {moment(txn.entityLog.timeStamp).toLocaleString()}
    </CardFooter>
  {/if}
</Card>
{/if}