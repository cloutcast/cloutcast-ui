

<script>
  import {goto} from "@sapper/app";
  import StepWizard from 'svelte-step-wizard';
  import {user, userToken} from '../auth/store';
  import {userStore} from "../commonStore";
  import moment from 'moment';
  import * as sanitizeHTML from 'sanitize-html'; 

  import {
    Alert,
    Button, ButtonGroup,
    Input, InputGroup, InputGroupText,
    Card, CardHeader, CardBody, CardText, CardTitle, Row, Col, Icon, Badge,
    Table
  } from 'sveltestrap';

  import Slider from '@bulatdashiev/svelte-slider';

  import Fa from 'svelte-fa/src/fa.svelte';
	import {
faClock,
faDonate,
		faRetweet, faTruckLoading, faUserCircle
	} from '@fortawesome/free-solid-svg-icons';

  import UserAutocomplete from "./UserAutocompete.svelte";

  import PostRegistrationCard from './PostRegistrationCard.svelte';

  import {cloutXRate, toggleCreate} from "../commonStore.js";
import LoadingBlinker from './LoadingBlinker.svelte';
import DisplayPostVideo from './DisplayPostVideo.svelte';



  
  export let bitcloutUSDRate = 0;

  cloutXRate.subscribe(xrate => {
    if (typeof(xrate) !== 'undefined') {
      if (typeof(xrate.bitCloutInUSDRounded) !== 'undefined') {
        bitcloutUSDRate = xrate.bitCloutInUSDRounded;
      }
    }
  });

  export let theUser = null;


  export let promoCloutLink;
  export let promoCloutLinkDisabled = false;
  export let promoCloutLinkError = '';
  export let promoCloutMessage = null;
  export let engagementDetailComplete = false;

  export let engagementType = null;
  

  export const selectEngagementType = async function(ev) {
    console.dir(ev.target.value);

    if (bitcloutUSDRate == 0) {
      try {
        let xrateReq = await fetch("/bitclout/xrate.json", {
          headers: {
            "cache-control" : "cache"
          }
        });
        let xrate = await xrateReq.json();
        cloutXRate.set(xrate);

      } catch (ex) {
        console.error(ex);
      }
    }
    if (ev.target.value == 'clear') {
      engagementType = null;
    } else {
      if (ev.target.value == "Quote" || ev.target.value == "ReClout" || ev.target.value == "Comment") {
        engagementType = ev.target.value;
      }
     
    }
  };

  export let totalBudget = 0;
  export let rateBudget = 0;
  export let countEngagements = 0;

  export let rateBudgetDisabled = false;
  export let totalBudgetDisabled = false;

  export let engagementDetailError = '';

  export let userSearchValue = '';
  export let userSearchDisabled = true;
  
  export let userAutocompleteItem;
  export let selectedUsers = [];


  

  export const selectedUsersP = async function() {
    return selectedUsers;
  }

 

  let selectedUsersPromise = selectedUsersP();

  export const clearEngagementType = function(ev) {
    engagementType = null;
    rateBudgetDisabled = false;
    totalBudgetDisabled = false;
    engagementDetailComplete = false;
    totalBudget = 0;
    rateBudget = 0;
  };

 

  export const backFromEngagementDetails = function (previousStep) {
    engagementType = null;
    return previousStep();
  }

  export let doCauses = false;
  // export let causesList = [
  //   "aa", "bb", "cc", "dd", "ee", "ff"
  // ];
  export let selectedCause = "";

  export const causesChecked = async function() {
    doCauses = !doCauses; 

    if (!doCauses) {
      selectedCause = "";
    }
  }


  

  export let minFollowerCount = [10, 10000];
  export let minCoinPrice = [5, 20000];
  export let duration = [360, 10080];



  let selectPromoCriteria = true;
  let criteriaButtonDisabled = false;

  let criteriaTypeSwitch = false;
  
  export let criteriaProm = async () => {
    selectPromoCriteria = !selectPromoCriteria;
    criteriaTypeSwitch = !criteriaTypeSwitch;
    // console.dir({minFollowerCount, minCoinPrice}); 
    minFollowerCount[0] = 10;
    minCoinPrice[0] = 1;
    console.log(criteriaTypeSwitch);
    if (criteriaTypeSwitch == true) {
      userSearchValue = '';
      selectedUsers = [];
      selectedUsersPromise = selectedUsersP();
    }
    return {
      minFollowerCount: [10, 10000], 
      minCoinPrice: [5,20000], 
      duration: [360,10000], 
      selectPromoCriteria,
      userSearchDisabled: userSearchDisabled,
      criteriaTypeSwitch
    }
  };

  let criteriaPromise = criteriaProm();

  let setCriteria = async () => {
    criteriaPromise = criteriaProm();
  }

  export const enableDisableSearch = function(ev) {
    // console.log(userSearchDisabled);
    userSearchDisabled = !userSearchDisabled;
    criteriaButtonDisabled = !criteriaButtonDisabled;
    if (!userSearchDisabled) {
      userSearchValue = '';
      selectedUsers = [];
      selectedUsersPromise = selectedUsersP();
    }
    if (selectPromoCriteria == true) {
      setCriteria();
    }
  }
 

  export const validateEngagementDetails = async () => {
    try {
      engagementDetailError = '';
      if (countEngagements < 1) {
        throw new Error("Engagement Count: Please enter a whole number greater than zero.");
      }
      if ((countEngagements % 1) !== 0) {
        throw new Error("Engagement Count: Please enter a whole number greater than zero.")
      }

      if (rateBudget < 0.1) {
        throw new Error("~$USD per engagement must be greater than, or equal to ~$0.10");
      }

      console.log(theUser);

      totalBudget = Math.round(10000000000 * ((rateBudget * countEngagements) * 1.12) / bitcloutUSDRate) / 10000000000;


    } catch (ex) {
      console.error(ex);
      engagementDetailError = ex.message || "Unspecified Error."
    } finally {
      if (engagementDetailError === "") {
        rateBudgetDisabled = true;
        totalBudgetDisabled = true;
        engagementDetailComplete = true;
      }
    }
  }

  export const runVerification = async function (nextStep) {
    // do verification
    try {
      promoCloutMessage = null;
      promoCloutLinkError = '';
      
      // let t = /^https:\/\/bitclout\.com\/posts\/\S{64}/
      
      let t = /^htt(p|ps):\/\/.*\/(posts|nft)\/(\S{64})/

      if (t.test(promoCloutLink)) {
        promoCloutLinkDisabled = true;

        let postHashParts = promoCloutLink.split("/");
        let postHash = postHashParts[postHashParts.length - 1].substr(0, 64);
        let postReq = await fetch(`/bitclout/post/${postHash}.json`, {
          headers: {
            "cache-control" : "cache"
          }
        });
        let postJSON = await postReq.json();

        if (typeof(postJSON.PostFound) !== 'undefined') {
          // console.log(postJSON.PostFound);
          promoCloutMessage = postJSON.PostFound;
          promoCloutLinkDisabled = false;
           return nextStep();
        } else {
          throw new Error("Post not found. Are you sure that's a correct clout URL?")
        }

        


      } else {
        promoCloutLinkError = "please enter a valid post URL."
      }
    } catch (ex) {
      promoCloutLinkDisabled = false;
      console.error(ex);
      promoCloutLinkError = ex.message || "Unspecified Error, please try again.";
    }

    

  }

  export const removeUserFromList = async function (ttt) {
    for (var i in selectedUsers) {
      if (selectedUsers[i].Username = ttt) {
        selectedUsers = selectedUsers.splice(i+1,1);
        // delete selectedUsers[i];
      }
    }
    selectedUsersPromise = selectedUsersP();
  }
  export const userAutocompleteChange = async function() {
    // console.log(userAutocompleteItem);
    if (typeof(userAutocompleteItem) !== 'undefined') {
      let isFound = false;
      for (var sU of selectedUsers) {
        if (typeof(sU.Username) !== 'undefined' && typeof(userAutocompleteItem) !== 'undefined') {
          if (typeof(userAutocompleteItem.Username) !== 'undefined') {
            if (sU.Username == userAutocompleteItem.Username) {
              isFound = true;
            }
          }
        }
      }
        if (!isFound) {
        selectedUsers.push({
          Username: `${userAutocompleteItem.Username}`,
          PublicKeyBase58Check: `${userAutocompleteItem.PublicKeyBase58Check}`
        });
      }
      // console.log(document.getElementById("userAutocomplete").value);
      document.getElementById("userAutocomplete").value = "";
      userAutocompleteItem = undefined;

      selectedUsersPromise = selectedUsersP();
    }
  }


  function cO(k,v, convertTo = false) {
    return {key: k, value: v, convertTo}
  }
  export const reviewP = async function() {
    let rA = [];

    // cloutLink, cloutType
    rA.push(cO("Clout URI", promoCloutLink));
    rA.push(cO("Engagement Type", engagementType));
    
    rA.push(cO("Rate", Math.round(10000000000 * (rateBudget / bitcloutUSDRate)) / 10000000000, true));
    rA.push(cO("Budget", Math.round(10000000000 * ((rateBudget * countEngagements)) / bitcloutUSDRate) / 10000000000, true));
    if (selectedCause !== '') {
      rA.push(cO("Waived Fee for Cause (0%)", 0, true));
      rA.push(cO("Selected Cause", selectedCause));
    } else {
      rA.push(cO("CloutCast fee", (totalBudget * 0.12), true));
    }
    
    rA.push(cO("Total Potential Promoters", countEngagements));

    if (selectedUsers.length > 0) {
      rA.push(cO("Exclusive Promo Users", selectedUsers));
    } else {
      rA.push(cO("Minimum Follower Count", minFollowerCount[0]));
      rA.push(cO("Minimum Coin Price", Math.round(10000000000 * (minCoinPrice[0] / bitcloutUSDRate)) / 10000000000, true));
    }

    rA.push(cO("Duration (Minutes)", duration[0]));

    rA.push(cO("Total", (totalBudget), true));

    return rA;

    
  };
  export let reviewPromise = reviewP(); 


  export const updateResult = async function(nextStep) {
    reviewPromise = reviewP();
    return nextStep();
  }


  let completeCreatePromoLoading = false;
  let completeCreatePromoError = '';
  let completeCreatePromoSuccess = false;
  export const completeCreatePromotion = async function(reviewObj) {
    // do create promo
    completeCreatePromoLoading = true;
    completeCreatePromoError = '';
    // console.log(reviewObj);
    let createFetch = await fetch("/api/promotion/create.json", {
      method: "post", 
      body: JSON.stringify([
        {key: "bitcloutXRate", value: bitcloutUSDRate},
        ...reviewObj
      ]),
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${theUser.cc.jwt}`
      }
    });
    let createResult = await createFetch.text();
    if (createResult == 'OK') {
      completeCreatePromoLoading = false;
      completeCreatePromoSuccess = true
      if (process.browser) {
        if (window.location.href == `${window.location.origin}/my/promotions`) {
          toggleCreate.set("/");
        } else {
          toggleCreate.set("/my/promotions");
        }
      }
      // window.location.href = window.location.href;
    } else {
      completeCreatePromoLoading = false;
      completeCreatePromoError = createResult;
    }
  };

  export const convertDateString = function (minutes) {
    let tt = moment.duration(minutes, 'minutes')

    let buildString = "";
    if (tt._data.days > 0) {
      buildString += `${tt._data.days} Days, `
    }
    if (tt._data.hours > 0) {
      buildString += `${tt._data.hours} Hours, `
    }
    buildString += ` ${tt._data.minutes} Minutes.`

    return buildString;
  } 



</script>

<style>
  .superBold {
    font-weight: 800;
  }
</style>


<div>
  {#if $userStore !== null}
  <StepWizard initialStep={1}>
    <StepWizard.Step num={1} let:nextStep>
      <PostRegistrationCard body="Please enter the BitClout post link you wish to promote." title="Step 1 -- Define Promotion Content">    
        <InputGroup>
          <InputGroupText>
            <Icon name="link" />
          </InputGroupText>
          <Input placeholder="https://bitclout.com/xx/xxxx" bind:value={promoCloutLink} disabled={promoCloutLinkDisabled} />
        </InputGroup>
        {#if promoCloutLinkError}
          <Alert color="danger" class="mt-2">
            {promoCloutLinkError}
          </Alert>
        {/if}
        <hr />
        {#if promoCloutLinkDisabled}
          <LoadingBlinker />
        {:else}
        <Row>
          <Col xs></Col>
          <Col xs class="col-auto">
            <Button color="primary" outline on:click={runVerification(nextStep)}>
              Next
            </Button>
          </Col>
        </Row>
        {/if}
      </PostRegistrationCard>
    </StepWizard.Step>
    <StepWizard.Step num={2} let:previousStep let:nextStep>
      <PostRegistrationCard title="Step 2 -- Verify Promotion Post" body="Please confirm that this is the post you'd like to promote.">
        <Card class="mb-2">
					<CardBody>
						<Row>
							<Col class="col-auto align-self-start">
								<img src="https://bitclout.com/api/v0/get-single-profile-picture/{promoCloutMessage.ProfileEntryResponse.PublicKeyBase58Check}" alt="{promoCloutMessage.ProfileEntryResponse.Username} avatar" style="height:50px;" class="recloutGigImage"/>
							</Col>
							<Col>
								<span class="superBold usernameSize">
									{promoCloutMessage.ProfileEntryResponse.Username}
								</span>
                {#if promoCloutMessage.ProfileEntryResponse.bitcloutPrice !== null}
                <Badge pill color="light">
                  ~${parseFloat(promoCloutMessage.ProfileEntryResponse.bitcloutPrice).toFixed(2)}
                </Badge>
                {/if}
								<br />
                <div class="block roberto">
								  {@html sanitizeHTML(promoCloutMessage.Body.split("\n").join("<br />"))}
                </div>
                <br />
                {#if promoCloutMessage.ImageURLs}
                  {#each promoCloutMessage.ImageURLs as imageURL}
                    <br />
                    <img src="{imageURL}" class="mb-1" style="max-height:200px;" alt="image for {promoCloutMessage.PostHashHex}" />
                  {/each}
                {/if}
                {#if promoCloutMessage.PostExtraData}
                  {#if typeof promoCloutMessage.PostExtraData.EmbedVideoURL == 'string'}
                    <DisplayPostVideo videoURL={promoCloutMessage.PostExtraData.EmbedVideoURL} />
                  {/if}
                {/if}
                {#if promoCloutMessage.RecloutedPostEntryResponse !== null }
                  <Card body>
                    <Row>
                      <Col class="col-auto align-self-start">
                        <img src="https://bitclout.com/api/v0/get-single-profile-picture/{promoCloutMessage.RecloutedPostEntryResponse.ProfileEntryResponse.PublicKeyBase58Check}" style="height:50px;" alt="promo reclouted avatar" />
                      </Col>
                      <Col>
                        <span class="superBold usernameSize">
                          {promoCloutMessage.RecloutedPostEntryResponse.ProfileEntryResponse.Username}
                        </span>
                        <Badge pill color="light">
                          ~${parseFloat((promoCloutMessage.RecloutedPostEntryResponse.ProfileEntryResponse.CoinPriceBitCloutNanos * 0.000000001) * bitcloutUSDRate).toFixed(2)}
                        </Badge>
                        <br />
                        <div class="block roberto">
                          {@html sanitizeHTML(promoCloutMessage.RecloutedPostEntryResponse.Body.split("\n").join("<br />"))}
                        </div>
                        <br />
                        {#if promoCloutMessage.RecloutedPostEntryResponse.ImageURLs}
                          {#each promoCloutMessage.RecloutedPostEntryResponse.ImageURLs as imgU}
                            <br />
                            <img src="{imgU}" style="max-height:150px;" alt="image for {promoCloutMessage.PostHashHex}" />
                          {/each}
                        {/if}
                        {#if promoCloutMessage.RecloutedPostEntryResponse.PostExtraData}
                          {#if typeof promoCloutMessage.RecloutedPostEntryResponse.PostExtraData.EmbedVideoURL == 'string'}
                            <DisplayPostVideo videoURL={promoCloutMessage.RecloutedPostEntryResponse.PostExtraData.EmbedVideoURL} />
                          {/if}
                        {/if}
                      </Col>
                    </Row>
                  </Card>
                {/if}
							</Col>
							<Col class="col-auto">
								...
							</Col>
						</Row>
            <Row class="mt-2">
              <Col>
                <div class="text-center">
                <Icon name="chat-right" class="text-center" />
                {promoCloutMessage.CommentCount}
                </div>
              </Col>
              <Col>
                <div class="text-center">
                  <Fa icon={faRetweet} class="text-center" />
                  {promoCloutMessage.RecloutCount}
                </div>
              </Col>
              <Col>
                <div class="text-center">
                  <Icon name="heart" class="text-center" />
                  {promoCloutMessage.LikeCount}
                </div>
              </Col>
              <Col>
                <div class="text-center">
                  <Icon name="gem" class="text-center" />
                  {promoCloutMessage.DiamondCount}
                </div>
              </Col>
            </Row>
					</CardBody>
				</Card>
        <hr />
        <Row>
          <Col xs>
          
          </Col>
          <Col xs class="col-auto">
            <Button color="warning" outline on:click={previousStep}>
              Back
            </Button>
            <Button color="primary" outline on:click={nextStep}>
              Next
            </Button>
          </Col>
        </Row>
      </PostRegistrationCard>
    </StepWizard.Step>
    <StepWizard.Step num={3} let:previousStep let:nextStep>
      <PostRegistrationCard title="Step 3 -- Define Duration">
        Define the duration (in minutes) below. 
        <InputGroup class="mt-2">
          <InputGroupText>
            Duration: 
          </InputGroupText>
          <Input type="number" bind:value={duration[0]} on:input={(e) =>{if (e.target.value > duration[1]) { duration[0] = duration[1] }}}/>
        </InputGroup>
        <Slider bind:value={duration} min={360} max={duration[1]} step={1}>
          <span slot="left" style="font-size:20px;">
            <Fa icon={faClock} />
          </span>
        </Slider>
        <br />
        {convertDateString(duration[0])}
        <hr />
        <Row>
          <Col xs>
          
          </Col>
          <Col xs class="col-auto">
            <Button color="warning" outline on:click={previousStep}>
              Back
            </Button>
            <Button color="primary" outline on:click={nextStep}>
              Next
            </Button>
          </Col>
        </Row>
      </PostRegistrationCard>
    </StepWizard.Step>
    <StepWizard.Step num={4} let:previousStep let:nextStep>
      <PostRegistrationCard title="Step 4 -- Define Criteria" body="">

        {#await criteriaPromise}
          <LoadingBlinker />        
        {:then criteria}

          What kind of criteria would you like to define for this promotion?
          <hr /> 
          <Row>
            <Col>
              <Button class="w-100" size="md" outline={criteriaTypeSwitch == false} on:click={() => setCriteria(false)} color="primary">
                Coin Price / Follower Count
              </Button>
            </Col>
            <Col>
              <Button class="w-100" size="md" outline={criteriaTypeSwitch == true} on:click={() => setCriteria(true)} color="primary">
                Specific Users
              </Button>
            </Col>
          </Row>
          <hr />
          {#if criteriaTypeSwitch == true}
          Modify Minimum Follower Count, and Minimum Coin Price below.
          <InputGroup>
            <InputGroupText>
              Min Follower Count: 
            </InputGroupText>
            <Input type="number" bind:value={minFollowerCount[0]} on:input={(e) =>{if (e.target.value > minFollowerCount[1]) { minFollowerCount[0] = minFollowerCount[1] }}}/>
          </InputGroup>
          <br />
            <Slider bind:value={minFollowerCount} min={0} max={minFollowerCount[1]} step={1}>
              <span slot="left" style="font-size:20px;">
                <Fa icon={faUserCircle} />
              </span>
            </Slider> 
          <br />
          <InputGroup>
            <InputGroupText>
              Min Coin Price (~$USD): 
            </InputGroupText>
            <Input type="number" bind:value={minCoinPrice[0]} on:input={(e) =>{if (e.target.value > minCoinPrice[1]) { minCoinPrice[0] = minCoinPrice[1] }}}/>
          </InputGroup>
            <Slider bind:value={minCoinPrice} min={5} max={minCoinPrice[1]} step={0.05}>
              <span slot="left" style="font-size:20px;">
                <Fa icon={faDonate} />
              </span>
            </Slider>
          {:else}
            Only users you specify here will be allowed to run this promo. Once clicked, start typing a bitclout username to add them to the allowed promoters list for this promotion. 
            <br />    
            <UserAutocomplete onChange={userAutocompleteChange} bind:selectedItem={userAutocompleteItem} />
            <div class="text-muted">
            </div>
            {#await selectedUsersPromise}
              <LoadingBlinker />
            {:then selectedU}
              {#if typeof(selectedU[0]) !== 'undefined'}
                <hr />
                
                
                {#each selectedUsers as sUser}
                  <Row>
                    <Col>
                      {sUser.Username}<br>
                      <span style="font-size:0.7rem">{`${sUser.PublicKeyBase58Check}`.substr(0, 32)}....</span> 
                    </Col>
                    <Col>
                      {#if sUser.Username !== 0} 
                        <Button on:click={removeUserFromList(sUser.Username)} size="sm">Remove</Button>
                      {/if}
                    </Col>
                  </Row>
                  <hr />
                {/each}

              {/if}
            {:catch ex}
              <Alert color="danger">
                Error: {ex.message || "Unknown Error"}
              </Alert>

            {/await}
          {/if}

          

          <hr />
          <Row>
            <Col xs>
            
            </Col>
            <Col xs class="col-auto">
              <Button color="warning" outline on:click={previousStep}>
                Back
              </Button>
              <Button color="primary" outline on:click={nextStep}>
                Next
              </Button>
            </Col>
          </Row>
        {/await}
      </PostRegistrationCard>
    </StepWizard.Step>
    <StepWizard.Step num={5} let:previousStep let:nextStep>
      <PostRegistrationCard title="Step 5 -- Promotion Details">
        Please define the type of engagement, and the budget for this promotion.
        <hr />
        Engagement Type 
        <Row>
          <Col>
            <ButtonGroup class="w-100">
              <Button color="info" outline={engagementType !== 'Comment'} on:click={selectEngagementType} value="Comment" active={engagementType == 'Comment'} disabled={engagementType !== null}>
                <Icon name="chat-right" />
                Comment
              </Button>
              <Button color="info" outline={engagementType !== 'ReClout'} on:click={selectEngagementType} value="ReClout" active={engagementType == 'ReClout'} disabled={engagementType !== null}>
                <Fa icon={faRetweet} />
                ReClout
              </Button>
              <Button color="info" outline={engagementType !== 'Quote'} on:click={selectEngagementType} value="Quote" active={engagementType == 'Quote'} disabled={engagementType !== null}>
                <Icon name="chat-right-quote" />
                Quote
              </Button>
            </ButtonGroup>
            
          </Col>
          {#if engagementType !== null} 
            <Col class="col-auto">
              <Button on:click={clearEngagementType}><Icon name="x" /></Button>
            </Col>
          {/if}
        </Row>
        {#if engagementType !== null} 
          <Row class="mt-2">
            <Col>
              <hr />
              <Row>
                <Col xs="12" class="mb-2">
                  Count of Engagements<br />
                  <Input type="number" placeholder="..." bind:value={countEngagements} disabled={totalBudgetDisabled} />
                  <span class="text-muted">Maximum amount of runs this promo can run..</span>
                </Col>
                <Col xs="12">
                  ~$USD per Engagement<br />
                <Input type="number" placeholder="..." bind:value={rateBudget} disabled={rateBudgetDisabled} />
                <span class="text-muted">This is how much each promoter will get paid for running your promo. <span class="superBold">(In USD!)</span> <br /> Minimum is ~$0.10 USD per engagement.</span>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col>
                  <Table class="w-100">
                    <thead>
                      <tr>
                        <th>
                          Item
                        </th>
                        <th>
                          Bitclout
                        </th>
                        <th>
                          ~$USD
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Rate per Engagement</td>
                        <td>{Math.round(10000000000 * (rateBudget / bitcloutUSDRate)) / 10000000000}</td>
                        <td>{rateBudget}</td>
                      </tr>
                      <tr>
                        {#if selectedCause == ''}
                          <td>CloutCast Fee</td>
                          <td>{Math.round(10000000000 * ((rateBudget * countEngagements) * 0.12) / bitcloutUSDRate) / 10000000000}</td>
                          <td>{((rateBudget * countEngagements) * 0.12).toFixed(2)}</td>

                        {:else}
                          <td>CloutCast Fee Waived for Cause</td>
                          <td>0</td>
                          <td>0</td>
                        {/if}
                      </tr>
                      <tr>
                        <td>Total</td>
                        {#if selectedCause == ''}
                          <td>{Math.round(10000000000 * ((rateBudget * countEngagements) * 1.12) / bitcloutUSDRate) / 10000000000}</td>
                          <td>{((rateBudget * countEngagements) * 1.12).toFixed(2)}</td>
                      {:else} 
                      <td>{((rateBudget * countEngagements) * 1) / bitcloutUSDRate}</td>
                      <td>{((rateBudget * countEngagements) * 1)}</td>
                    {/if}
                      </tr>
                    </tbody>
                  </Table>
                  {#if countEngagements !== 0 && rateBudget !== 0 }
                    <span class="superBold">
                      Potential Runs: {countEngagements}
                    </span>
                    {#if engagementDetailComplete} 
                      <Button on:click={clearEngagementType} color="danger" outline>
                        Reset this page
                      </Button>
                    {:else}
                    <Button on:click={validateEngagementDetails} color="info" outline>
                      Confirm Selections
                    </Button>
                    {/if}
                  {/if}
                </Col>
              </Row>
            </Col>
          </Row>
        {/if}
        
        <hr />
        {#if engagementDetailError !== ''} 
          <Alert color="danger">
            {@html engagementDetailError}
          </Alert>
        {/if}
        {#if engagementDetailComplete}
          Thanks! Click 'Next' to continue.
        {/if}
        <Row>
          <Col xs>
          
          </Col>
          <Col xs class="col-auto">
            <Button color="warning" outline on:click={backFromEngagementDetails(previousStep)}>
              Back
            </Button>
            <Button color="primary" outline on:click={updateResult(nextStep)} disabled={engagementDetailComplete == false}>
              Next
            </Button>
          </Col>
        </Row>
      </PostRegistrationCard>
    </StepWizard.Step>
    <StepWizard.Step num={6} let:previousStep>
      <PostRegistrationCard title="Review Promotion" body="Please reiew your promotion's details below.">
        {#await reviewPromise}
          Please wait...
        {:then reviewObj}
        <CardBody>
          <Row>
            <Col class="col-auto align-self-start">
              <img src="https://bitclout.com/api/v0/get-single-profile-picture/{promoCloutMessage.ProfileEntryResponse.PublicKeyBase58Check}" alt="{promoCloutMessage.ProfileEntryResponse.Username} avatar" style="height:50px;" class="recloutGigImage"/>
            </Col>
            <Col>
              <span class="superBold usernameSize">
                {promoCloutMessage.ProfileEntryResponse.Username}
              </span>
              {#if promoCloutMessage.ProfileEntryResponse.bitcloutPrice !== null}
              <Badge pill color="light">
                ~${parseFloat(promoCloutMessage.ProfileEntryResponse.bitcloutPrice).toFixed(2)}
              </Badge>
              {/if}
              <br />
              {@html sanitizeHTML(promoCloutMessage.Body.split("\n").join("<br />"))}
              {#if promoCloutMessage.ImageURLs}
                {#each [...new Set(promoCloutMessage.ImageURLs)] as imageURL}
                  <br />
                  <img src="{imageURL}" style="max-height:200px" class="mb-1" alt="image for {promoCloutMessage.PostHashHex}" />
                {/each}
              {/if}
              {#if promoCloutMessage.PostExtraData}
                {#if typeof promoCloutMessage.PostExtraData.EmbedVideoURL == 'string'}
                  <DisplayPostVideo videoURL={promoCloutMessage.PostExtraData.EmbedVideoURL} />
                {/if}
              {/if}
              {#if promoCloutMessage.RecloutedPostEntryResponse !== null }
                  <Card body>
                    <Row>
                      <Col class="col-auto align-self-start">
                        <img src="https://bitclout.com/api/v0/get-single-profile-picture/{promoCloutMessage.RecloutedPostEntryResponse.ProfileEntryResponse.PublicKeyBase58Check}" style="height:50px;" alt="promo reclouted avatar" />
                      </Col>
                      <Col>
                        <span class="superBold usernameSize">
                          {promoCloutMessage.RecloutedPostEntryResponse.ProfileEntryResponse.Username}
                        </span>
                        <Badge pill color="light">
                          ~${parseFloat((promoCloutMessage.RecloutedPostEntryResponse.ProfileEntryResponse.CoinPriceBitCloutNanos * 0.000000001) * bitcloutUSDRate).toFixed(2)}
                        </Badge>
                        <br />
                        {@html sanitizeHTML(promoCloutMessage.RecloutedPostEntryResponse.Body.split("\n").join("<br />"))}
                        {#if promoCloutMessage.RecloutedPostEntryResponse.ImageURLs}
                          {#each promoCloutMessage.RecloutedPostEntryResponse.ImageURLs as imgU}
                            <br />
                            <img src="{imgU}" style="max-height:150px" class="mb-1" alt="image for {promoCloutMessage.PostHashHex}" />
                          {/each}
                        {/if}
                        {#if promoCloutMessage.RecloutedPostEntryResponse.PostExtraData}
                          {#if typeof promoCloutMessage.RecloutedPostEntryResponse.PostExtraData.EmbedVideoURL == 'string'}
                            <DisplayPostVideo videoURL={promoCloutMessage.RecloutedPostEntryResponse.PostExtraData.EmbedVideoURL} />
                          {/if}
                        {/if}
                      </Col>
                    </Row>
                  </Card>
                {/if}
            </Col>
            <Col class="col-auto">
              ...
            </Col>
          </Row>
          <Row class="mt-2">
            <Col>
              <div class="text-center">
              <Icon name="chat-right" class="text-center" />
              {promoCloutMessage.CommentCount}
              </div>
            </Col>
            <Col>
              <div class="text-center">
                <Fa icon={faRetweet} class="text-center" />
                {promoCloutMessage.RecloutCount}
              </div>
            </Col>
            <Col>
              <div class="text-center">
                <Icon name="heart" class="text-center" />
                {promoCloutMessage.LikeCount}
              </div>
            </Col>
            <Col>
              <div class="text-center">
                <Icon name="gem" class="text-center" />
                {promoCloutMessage.DiamondCount}
              </div>
            </Col>
          </Row>
        </CardBody>
        <hr />
          {#each reviewObj as sItem}
            <Row>
              <Col>
                
                {#if sItem.key == "Exclusive Promo Users"}
                  {#if sItem.value.length}
                    <h5>{sItem.key}</h5>
                    {#each sItem.value as usr}
                      {usr.Username}..
                    {/each}
                    <hr /> 
                  {/if}
                {:else}
                  <h5>{sItem.key}</h5>
                  <div class="text-muted">{sItem.value}</div>
                  
                  {#if sItem.convertTo == true}
                    (~${(sItem.value * bitcloutUSDRate).toFixed(2)} USD)
                  {/if}  
                  <hr />
                {/if}
              </Col>
            </Row>   
          {/each}
          {#if completeCreatePromoError !== ""} 
            <Alert color="danger">
              Error: {completeCreatePromoError}
            </Alert>
          {/if}

          {#if completeCreatePromoLoading}
            <LoadingBlinker />
          {:else if completeCreatePromoSuccess == true}
            <Alert color="success">
              Success! Please wait while you are routed to your active promotions page.
            </Alert>
          {:else}
          <Row>
            <Col xs>
            
            </Col>
            <Col xs class="col-auto">
              <Button color="warning" outline on:click={previousStep}>
                Back
              </Button>
              <Button color="primary" outline on:click={completeCreatePromotion(reviewObj)}>
                Create!
              </Button>
            </Col>
          </Row>
          {/if}

        {:catch exc}
          <Alert color="danger">
            There was an error: {exc.message || "Unknown Error"}
          </Alert>
        {/await}
      </PostRegistrationCard>
      
    </StepWizard.Step>
    
  </StepWizard>
  {:else}
    Please sign in to create a promotion.
  {/if}
  
</div>