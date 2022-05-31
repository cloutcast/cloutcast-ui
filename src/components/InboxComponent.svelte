<script>
  import {goto} from "@sapper/app";
import { NavItem, Button, Badge, Offcanvas, Row, Col, Icon, NavLink } from "sveltestrap/src";
import { bitCloutUser, userToken }  from "../auth/store";
import { cloutXRate, toggleDetail, toggleInboxMenu }  from "../commonStore";

import LoadingBlinker from "./LoadingBlinker.svelte";

export let inboxOpen = false;

export let toggleInbox = () => (inboxOpen = !inboxOpen);

// get promos for user
export let bUser;

toggleInboxMenu.subscribe(tI => {
  if (tI == true) {
    console.log("hey!");
    toggleInbox();
    toggleInboxMenu.set(false);
  }
})
let goPromo = async function(t) {
  inboxOpen = false;
  if (process.browser) {
    if (window.location.href == `${window.location.origin}/`) {
      toggleDetail.set(t);
    } else {
      // console.log(t);
      await goto(`/?id=${t}`);
    }
  }
  
}


export let doRate = async function() {
  try {
    let rate = await fetch(`/bitclout/xrate.json`);
    let xRate = await rate.json();
    return xRate;
  } catch (ex) {
    console.error(ex);
    return 0;
  }
}

export const getMyInbox = async function() {
  // TODO
  let tOut = await fetch(`/api/promotion/get/my.json`, {
    method: 'post',
    headers: {
      "Content-Type" : "application/json",
      "authorization" : `Bearer ${bUser.cc.jwt}`
    },
    body: JSON.stringify({
      CoinPriceBitCloutNanos: bUser.cc.Profile.CoinPriceBitCloutNanos,
      followerCount: bUser.cc.Profile.followerCount
    })
  });

  let tBody = await tOut.json();

  let {data = []} = tBody;
  let foundPromos = [];
  for (var d of data) {
    let {criteria = {}} = d;
    let {allowedUsers = []} = criteria;

   

    for (var a of allowedUsers) {
      if (a == bUser.publicKey) {
        foundPromos.push(d);
      }
    }
  }
  foundPromos.sort((a,b) => {
    return a.header.Rate > b.header.Rate ? 1 : -1
  });
  let xRate = await doRate();
  // console.log(xRate);
  return {foundPromos, bUser, xRate};
}

let inboxPromise = getMyInbox();

</script>

{#await inboxPromise}
  <LoadingBlinker noText />
{:then inboxData}
<Offcanvas isOpen={inboxOpen} toggle={toggleInbox} placement="end" header="@Inbox">
  <Row>
    <Col>
      <h4>{inboxData.foundPromos.length} promos.</h4>
    </Col>
    <Col class="col-auto">
      <Button on:click={() => inboxPromise = getMyInbox()}>
        <Icon name="arrow-repeat" />
      </Button>
    </Col>
  </Row>
  
  {#each inboxData.foundPromos as iD}
    <div class="block my-1">
      {iD.target.action} for ~{(Math.round(100*(iD.header.rate * 0.000000001) * inboxData.xRate.bitCloutInUSD)/100).toFixed(2)}USD <Button on:click={() => goPromo(iD.id)} value="{iD.id}" class="btn btn-info">See Promo</Button>
    </div>
  {/each}
  <!-- <pre>

    {JSON.stringify(inboxData.foundPromos, null, 4)}
  </pre>   -->
</Offcanvas>

{/await}
