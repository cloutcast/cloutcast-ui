<script>

import { Jumbotron, Row, Col, ListGroup, ListGroupItem, Container, Button } from "sveltestrap/src";
import { userStore } from "../../../../commonStore";
import {goto} from "@sapper/app";
import LoadingBlinker from "../../../../components/LoadingBlinker.svelte";

import WalletBreadcrumb from "../../../../components/WalletBreadcrumb.svelte";
import moment from 'moment';

export let segment;
let tUser = null;
userStore.subscribe(u => tUser = u);

let init = function() {
  return new Promise((resolve, reject) => {
    let theInterval = setInterval(() => {
      if (tUser !== null) {
        console.dir(tUser);
        clearInterval(theInterval);
        resolve();
      }
    }, 500);
  });
}

export const thePromise = async function() {
  try {
    await init();
    if (process.browser) {
      let thePromos = await fetch(`/api/reports/userPromoList.json`, {headers: {
        "Authorization" : `Bearer ${tUser.cc.jwt}`
      }});

      let tOut = await thePromos.json();
      if (Array.isArray(tOut)) {
        tOut.sort((a, b) => a.timeStart < b.timeStart ? 1 : -1 );
      }
      return tOut;
    }
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      error: ex
    }
  }
}

let reportPromise = thePromise();

</script>
{#await reportPromise}
  <LoadingBlinker jumbotron />
{:then data}
{#if segment}
<WalletBreadcrumb subText="Reports" subHref="/my/reports" activeName="Promotion Performance #{segment}" />
{:else}
<WalletBreadcrumb subText="Reports" subHref="/my/reports" activeName="Promotion Performance" />
{/if}

<Container fluid>
  <Button color="primary" block>
    Click here to sync with the chain **Read Only**
  </Button>
    <Jumbotron>
      <h1>Promotion Performance</h1>
      {#if segment}
        <h5>Promo #{segment}</h5>
      {/if}
    </Jumbotron>
    <Row class="p-0">
      <Col class="col-auto">
        <h6 class="text-muted">
          Promotion
        </h6>
        <ListGroup>
          {#each data as item}
            <ListGroupItem tag="button" on:click={() => goto(`/my/reports/promo/${item.id}`)} class="smallerText" active={segment == item.id}>
              {moment(item.timeStart).format('yy/MM/DD HH:mm')}<br />
              #: {item.id}<br />
              E/T: {item.countEngagements}/{item.header.engagements}
            </ListGroupItem>
          {/each}
        </ListGroup>
      </Col>
      <Col>
        <slot></slot>
      </Col>
    </Row> 
  </Container>
{/await}
