<script>
  import {
    Jumbotron, Row, Col, Button, Container, Alert
  } from 'sveltestrap/src';

  import {userStore, loginDone, cloutXRate} from "../../../commonStore";
import LoadingBlinker from '../../../components/LoadingBlinker.svelte';
import MyPromotionsRow from '../../../components/MyPromotionsRow.svelte';
import WalletBreadcrumb from '../../../components/WalletBreadcrumb.svelte';

  export let theUser;

  userStore.subscribe(u => {
    if (u !== null) {
      theUser = u;
    }
  });


  export const getMyPromos = async function() {
    try {
      // console.dir(bitCltUser);
      // console.dir(theUser);
      let tFetch = await fetch(`/api/user/${theUser.publicKey}/promotions.json`, {headers: {
        Authorization: `Bearer ${theUser.cc.jwt}`
      }});

      let tJSON = await tFetch.json();

      // return tJSON;
      let {active = {}, inactive = {}} = tJSON;
      let {data: activeData = []} = active;
      let {data: inactiveData = []} = inactive;
      console.log(inactiveData);
      let iid = [];
      if (inactiveData.length) {
        for (var ii of inactiveData) {
          let timeCreated = null;

          for (var eev of ii.events) {
            if (eev.action == 'PromotionStart') {
              timeCreated = eev.timeStamp;
            }
          }
          iid.push({
            timeCreated,
            ...ii
          });
        }
        iid.sort((a, b) => a.timeCreated > b.timeCreated ? -1 : 1);
      }
      return {
        active: activeData, 
        inactive: iid
      };
      

    } catch (ex) {
      console.error(ex);
      throw ex;
    }
    
  };



  let getPromos = getMyPromos();

</script>


<WalletBreadcrumb subText="My CloutCast Promotions" />
<Jumbotron>
  <h2 class="text-center">
    My Promotions
  </h2>
</Jumbotron>
<Container class="container">
  {#await getPromos}
    <LoadingBlinker />
  {:then thePromos}
    <h3>Active Promos</h3>
    {#if thePromos.active.length}
      {#each thePromos.active as promo}
        <MyPromotionsRow inactive={false} postPublicKey={promo.target.hex} promoData={promo} theRate={$cloutXRate} theUser={$userStore}/>
      {/each}
    {:else}
    <Alert color="light">
      <h4 class="alert-heading text-capitalize">You have no active promotions!</h4>
      Click the <img src="/CTA.png" style="height:26px;width:26px;" alt="CTA logo" /> below to create one!
    </Alert>
    {/if}
    <hr />
    <h3>Completed Promos</h3>
    {#if thePromos.inactive.length}
      {#each thePromos.inactive as promo}
        <MyPromotionsRow inactive={true} postPublicKey={promo.target.hex} promoData={promo} theRate={$cloutXRate} theUser={$userStore} />
      {/each}
    {:else}
      <Alert color="light">
        <h4 class="alert-heading text-capitalize">You have no completed promotions!</h4>
        Click the <img src="/CTA.png" style="height:26px;width:26px;" alt="CTA logo" /> below to create one!
      </Alert>
    {/if}
  {:catch ex}
    <Alert color="danger">
      Error: {ex.message || "Unspecified Error"}
    </Alert>
  {/await}
</Container>

