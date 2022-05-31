<script>
  export let tItem;

  export let detailToggle;
  export let detail;
  export let promoVerifyError = "";
  export let promoLinkDisabled = false;
  export let runPromoValidation = async () => {};
  import {theUsernameObject, userStore} from "../commonStore"
  import moment from 'moment';
  import countdown from 'countdown';
  import {v4} from 'uuid';

  import * as sanitizeHTML from 'sanitize-html'; 

  import {
    Card, CardHeader, CardBody, Row, Col, Badge, Icon, Popover, Button, Alert
  } from "sveltestrap/src";

  import Fa from 'svelte-fa/src/fa.svelte';
	import {
		faRetweet, faCoins, faExternalLinkAlt, faClipboardList
	} from '@fortawesome/free-solid-svg-icons';

  import DisplayPostVideo from './DisplayPostVideo.svelte';
  export const copyLink = async function(id) {
		
    await navigator.clipboard.writeText(window.location.origin + "/?id=" + id);	
		alert("Link copied to clipboard!")
  }

	export const goToLink = async function(detailItem) {
		console.dir(detailItem.gigPostHash);
		window.open(`https://bitclout.com/posts/${detailItem.gigPostHash}`, "_blank");
	}
  let uid = v4();
  let time = countdown(new Date(), moment(tItem.Timeout).toDate());
  let tCD = time.toString();  
  setInterval(() => {
    tCD = countdown(new Date(), moment(tItem.Timeout).toDate()).toString();
  }, 1000);
</script>
<style>
  .recloutedImage {
    display: block;
    max-height: 200px;
    max-width:80%;
  }

  .feedImage {
    max-height: 250px;
    max-width:95%;
  }

  .feedImageContainer {
    display: block;
  }
</style>

<Card class="mb-3">
  <CardHeader>
    <Row>
      <Col>
        <Badge id="reqBadge-{uid}" color="dark" class="mb-1 badgeText">
          <Fa icon={faClipboardList} /> Requirements
        </Badge>
        <Popover trigger="hover" placement="bottom" target="reqBadge-{uid}">
          {#if tItem.MinCoinPrice}
          <Badge color="dark" class="mb-1 badgeText">
            <Fa icon={faCoins} />
            Min Coin Price: ~${tItem.MinCoinPrice.toFixed(2)} USD
          </Badge>
          {/if}
          {#if tItem.MinFollowerCount}
            <Badge color="dark" class="mb-1 badgeText">
              <Icon name="people-fill" />
              Followers Needed: {tItem.MinFollowerCount}
            </Badge>
          {/if}
          {#if tItem.AllowedUsers.length}
            <Badge color="dark" id="theTrigger-{tItem.Id}-{uid}" class="mb-1 badgeText">
              <Icon name="people-fill" />
              Allowed Users ({tItem.AllowedUsers.length})<br />
              {#each tItem.AllowedUsers as tUsr}
                {#if $theUsernameObject}
                  {$theUsernameObject[tUsr]}
                {:else}
                  {tUsr}
                {/if}
                <br />
              {/each}
            </Badge>
            <Popover trigger="hover" placement="bottom" target="theTrigger-{tItem.Id}-{uid}">
              
            </Popover>
          {/if}
        </Popover>

        
       
        {#if tItem.HODLRs}
        <Badge color="warning" class="mb-1 badgeText">
          HODLR!
        </Badge>
        {/if}
        {#if tItem.ForMe}
          <Badge color="success" class="mb-1 badgeText">
            For You!
          </Badge>
        {/if}
        <Badge color="secondary" class="mb-1 badgeText">
          {tCD} left
        </Badge>
        <Badge color="info" class="mb-1 badgeText">
          ~${tItem.RemainingBudget.toFixed(2)} USD remaining
        </Badge>
      </Col>
    </Row>
  </CardHeader>
  <CardBody>
    <Row style="max-width:90%">
      <Col class="col-auto align-self-start">
        <img src="https://bitclout.com/api/v0/get-single-profile-picture/{tItem.BitcloutPublicKey}" alt="{tItem.BitcloutUsername} avatar" class="gigImage"/>
      </Col>
      <Col>
        <span class="superBold usernameSize">
          {tItem.BitcloutUsername}
        </span>
        <Badge pill color="light">
          ~${tItem.BitCloutUserPrice.toFixed(2)}
        </Badge>
        <br />
        <div class="block roberto" style="word-break:break-word;">
          {@html sanitizeHTML(tItem.gigPost.split("\n").join("<br />"))}
        </div>
        {#if tItem.gigPostImages.length}
        <div class="feedImageContainer">
          {#each tItem.gigPostImages as postImage}
            
            <img src="{postImage}" class="feedImage" alt="gigPostImage for {tItem.Id}" />
          
          {/each}
        </div>
        {/if}
        {#if tItem.postVideo}
          <DisplayPostVideo videoURL={tItem.postVideo} />
        {/if}
        {#if typeof tItem.recloutedPost !== 'undefined'} 
          <Card body>
            <Row>
              <Col class="col-auto align-self-start">
                <img src="https://bitclout.com/api/v0/get-single-profile-picture/{tItem.recloutedPost.BitcloutPublicKey}" alt="reclouted poster" style="height:50px;" class="gigImage" />
              </Col>
              <Col>
                <span class="superBold usernameSize">
                  {tItem.recloutedPost.BitcloutUsername}
                </span>
                <Badge pill color="light">
                  ~${tItem.recloutedPost.BitCloutUserPrice.toFixed(2)}
                </Badge>
                <br />
                <div class="block roberto" style="word-break: break-word;">
                  {@html sanitizeHTML(tItem.recloutedPost.gigPost.split("\n").join("<br />")) }
                </div>
                {#if tItem.recloutedPost.gigPostImages.length}
                  {#each tItem.recloutedPost.gigPostImages as rPostImage}
                    <img src="{rPostImage}" class="recloutedImage" alt="reclouted gigPostImage for {tItem.Id}" />
                  {/each}
                {/if}
                {#if tItem.recloutedPost.postVideo}
                  <DisplayPostVideo videoURL={tItem.recloutedPost.postVideo} />
                {/if}
              </Col>
            </Row>
          </Card>
        {/if}
        <hr />
      </Col>
    </Row>
    <Row class="mt-1">
     
       
        <Col class="text-center">
          {#if tItem.TargetAction == 10}
            <Button color="success" block disabled={detail} on:click={detailToggle(tItem)}>
              <Fa icon={faRetweet} /> RECLOUT<br />
              <span class="actionButtonText">FOR ~${tItem.Rate.toFixed(2)} USD</span>
            </Button>
          {:else if tItem.TargetAction == 20}
            <Button color="success" block disabled={detail} on:click={detailToggle(tItem)}>
              <Icon name="chat-left" /> COMMENT<br />
              
              <span class="actionButtonText">FOR ~${tItem.Rate.toFixed(2)} USD</span>
            </Button>
          {:else if tItem.TargetAction == 30}
            <Button color="success" block disabled={detail} on:click={detailToggle(tItem)}>
              <Icon name="chat-left-quote" /> QUOTE <br />
              <span class="actionButtonText">FOR ~${tItem.Rate.toFixed(2)} USD</span>
            </Button>
          {/if}
          
        </Col>
        {#if detail == true}
        <Col class="text-center">
          
          <Button outline color="dark" block id="btnDetailDismiss-{tItem.Id}" on:click={goToLink(tItem)}>
            <Fa icon={faExternalLinkAlt} />
            <span class="actionButtonText">GO TO <br />BITCLOUT POST</span>
          </Button>
        </Col>
        <Row>
					<Col>
						<hr />
						<div class="smallerText p-2 text-center">
							Once you have done the specified engagement for this post ({tItem.TargetActionText}), click the button below to receive ~${tItem.Rate.toFixed(2)} at the end of the promotion.<br />
							<hr />
              <span class="superBold text-center">YOU MUST MEET THE CRITERIA LISTED ABOVE, AND YOU MUST NOT HIDE THE POST FOR 48 HOURS</span>
            </div>
						<br />
						{#if promoVerifyError}
							<Alert color="danger">
								{promoVerifyError}
							</Alert>
						{/if}
						{#if promoLinkDisabled}
              <Alert color="info">
                Loading, please wait...		
              </Alert>
            {:else}
              {#if $userStore == null}
                Please log in or sign up to continue.
              {:else}
                
                <Button color="primary" outline on:click={runPromoValidation} disabled={promoLinkDisabled} block>
                  I've done the work, verify me! 
                </Button>
              {/if}
            {/if}
					</Col>
				</Row>
        {:else}
        <Col class="text-center">
          
          <Button outline color="dark" block on:click={copyLink(tItem.Id)}>
            <Icon name="link-45deg" />
            <span class="actionButtonText">COPY LINK<br />TO CLOUTCAST PROMO</span>
          </Button>
        </Col>
        {/if}
      </Row>
  </CardBody>
</Card>