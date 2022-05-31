<script>
import {goto} from "@sapper/app";
import { Alert, Button, Row, Col, Badge, Icon, Card, Modal } from "sveltestrap/src";
import LoadingBlinker from "./LoadingBlinker.svelte";
import Fa from 'svelte-fa/src/fa.svelte';
import {faRetweet, faCoins} from '@fortawesome/free-solid-svg-icons';
// import { cloutXRate } from "./../commonStore";
// import { userToken } from "../auth/store";
import moment from 'moment';


export let theRate;
// export let uToken = null;
export let theUser;

export const doGoto = async function(t) {
  await goto(`/?id=${t}`);
}

// userToken.subscribe(ut => uToken = ut);
  export let inactive = false;
  export let postPublicKey = "";
  export let promoData;
  // console.log(promoData);
  export const nanosToBitClout = 0.000000001;

  let theFoundPromo = null;

  export const getPost = async function() {
    let thePostFetch = await fetch(`/bitclout/post/${postPublicKey}.json`, {
      headers: {
            "cache-control" : "cache"
          }
    });
    let thePost = await thePostFetch.json();
    // console.dir(promoData);
    theFoundPromo = thePost.PostFound;

    let {events: promoEvents = []} = promoData;

    let stopFound = false;
    let engagementCount = 0;
    for (var evt of promoEvents) {
      if (evt.action == 'PromotionStop') {
        stopFound = true;
      }

      if (evt.action == 'UserDidPromotion') {
        engagementCount++;
      }
    }

    return {...theFoundPromo, theRate, stopFound, engagementCount, promoData, promoEvents};
  }

  export const bogusPromise = async function() {
    return false;
  }

  let postPromise = postPublicKey !== "" ? getPost() : bogusPromise();
  
  let isCancelling = false;
  let cancelError = '';

  export const cancelPromo = async function() {
    cancelError = '';
    let reallyCancel = confirm("Are you sure you want to cancel this promo?");
    console.log(reallyCancel);
    if (reallyCancel == true) {
      isCancelling = true;
      try {
        let cancelPost = await fetch(`/api/promotion/stop/${promoData.id}.json`, {
          headers: {
            Authorization: `Bearer ${theUser.cc.jwt}`
          }
        });
        let cancelText = await cancelPost.text();

        if (cancelText == "OK") {
          window.location.href = window.location.href;
        } else {
          cancelError = cancelText;
        }
      } catch (ex) {
        console.error(ex);
        cancelError = ex.message || "Unspecified Error."
      } finally {
        isCancelling = false;
      }
    }
  };


  let isOpen = false;
  let toggle = () => (isOpen = !isOpen);

</script>

{#if postPublicKey != ""}
  {#await postPromise}
    <LoadingBlinker />
  {:then post}
    <Card body class="mt-2">
      <Row class="mb-2">
        <Col>
          {#if promoData}
            {#if promoData.criteria.minCoinPrice}
              <Badge color="dark">
                <Fa icon={faCoins} />
                Min Coin Price: ~${((parseFloat(promoData.criteria.minCoinPrice * nanosToBitClout ) * post.theRate.bitCloutInUSDRounded)).toFixed(2) } USD
              </Badge>
            {/if}
            {#if promoData.criteria.minFollowerCount}
              <Badge color="dark">
                <Icon name="people-fill" />
                Followers Needed: {promoData.criteria.minFollowerCount}
              </Badge>
            {/if}
            {#if promoData.target.action == "ReClout"}
              <Badge color="primary">
                <Fa icon={faRetweet} />
                RECLOUT
              </Badge>
            {:else if promoData.target.action == "Comment"}
              <Badge color="primary">
                <Icon name="chat-left" />
                COMMENT
              </Badge>
            {:else if promoData.target.action == "Quote"}
              <Badge color="primary">
                <Icon name="chat-left-quote" />
                QUOTE
              </Badge>
            {/if}
            <br />
            {#each promoData.events as evts}
              {#if evts.action == 'PromotionStart'} 
                <div class="block">Created On: {moment(evts.timeStamp).toLocaleString()}</div>
              {/if}
              {#if evts.action == 'PromotionExpire'}
                {#if inactive == true && post.stopFound == false}
                  <div class="block">Ended At: {moment(evts.timeStamp).toLocaleString()}</div>
                {:else}
                  {#if inactive == false}
                    <div class="block">Ends On: {moment(evts.timeStamp).toLocaleString()}</div>
                  {/if}
                {/if}
              {/if}
              {#if evts.action == 'PromotionStop'}
                {#if inactive == true}
                  <div class="block">Stopped At: {moment(evts.timeStamp).toLocaleString()}</div>
                {/if}
              {/if}
            {/each}
          {/if}
          <br />
          <div class="block"> 
            # Of Engagements: {post.engagementCount}
            {#if post.engagementCount > 0}
            <br />
              <Button color="info" on:click={() => toggle()}>
                (Click to see engagements)
              </Button>
            {/if}

          </div>
          <br />
          <div class="block">
            Post Content:<br />
            {post.Body.substr(0,128)}{#if post.Body.length > 128}...{/if}
          </div>
          {#if cancelError != ''} 
            <Alert color="danger">
              {cancelError}
            </Alert>
          {/if}
        </Col>
        <Col class="col-auto">
          {#if inactive == true}
            <Button color="primary" disabled>Restart (Coming Soon!)</Button>
          {:else}
            <Button color="info" on:click={() => {doGoto(promoData.id)} } >
              Go To Promo
            </Button>
            <Button color="danger" on:click={cancelPromo} disabled={isCancelling}>
              {#if isCancelling == true}
                Loading...
              {:else}
                Cancel
              {/if} 
            </Button>
          {/if}
        </Col>
      </Row>
    </Card>
    {#if post.engagementCount > 0} 
    <Modal body header="Engagement Details" id="modal-{promoData.Id}" {isOpen} {toggle}>
      {#each post.promoEvents as evt}
        {#if evt.action == 'UserDidPromotion'}
          User: {evt.user.handle}<br />
          {evt.timeStamp}
          <!-- {JSON.stringify(evt)} -->
          <hr />
        {/if}
      {/each}
    </Modal>
    {/if}
  {/await}
{:else}
  <Alert color="danger">
    NOT A PUBLIC KEY!
  </Alert>
{/if}