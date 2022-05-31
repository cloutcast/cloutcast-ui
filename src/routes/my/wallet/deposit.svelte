
<script>
  import moment from 'moment';
import {
    Jumbotron, Row, Col, Button, Container, Alert
  } from 'sveltestrap/src';
  import LoadingBlinker from '../../../components/LoadingBlinker.svelte';
  import {
    cloutXRate, userStore
  } from '../../../commonStore';
import WalletBreadcrumb from '../../../components/WalletBreadcrumb.svelte';
  export const nanosToBitClout = function(nanos) {
    return nanos * 0.000000001;
  }
  let theUser = null;
  let theToken = null;

  userStore.subscribe(u => {
    if (u !== null) {
      theUser = u;
    }
  });

  

  export const getWallet = async function() {
    let walletGet = await fetch(`/api/user/${theUser.publicKey}/wallet.json`, {
      headers: {
        authorization: `Bearer ${theUser.cc.jwt}`
      }
    });

    let xRateGet = await fetch(`/bitclout/xrate.json`);

    let xRate = await xRateGet.json();
    let wallet = await walletGet.json();
    // console.dir(wallet);

    return {...wallet, xRate};
    

  }
  export let walletPromise = getWallet();

  export const doWallet = async function() {
    walletPromise = getWallet();
  }

  export const copyAddress = async function() {
    await navigator.clipboard.writeText("BC1YLiVetFBCYjuHZY5MPwBSY7oTrzpy18kCdUnTjuMrdx9A22xf5DE");
    alert("Copied to clipboard!");
  }
</script>
{#await walletPromise}
  <LoadingBlinker jumbotron />
{:then wallet} 
<WalletBreadcrumb activeName="Deposit $Bitclout to CloutCast" />
<Jumbotron>
  <Container class="container-fluid">
    <h1 class="text-center">
      Deposit $DESO into CloutCast
    </h1>
    <hr />
    <Row>
      <Col>
        <h6 class="text-muted text-center">
          Send $DESO to this address:
          
        </h6>
        <div class="smallerText">
          BC1YLiVetFBCYjuHZY5MPwBSY7oTrzpy18kCdUnTjuMrdx9A22xf5DE <br />
          <span class="superBold">The username of this address should read "CloutCastsUnpaidIntern"</span>
        </div>
      </Col>
      <Col>
        <Button block color="secondary" on:click={copyAddress}>Copy DESO Address</Button>
      </Col>
    </Row>
    <hr />
    <h6 class="text-muted text-center">
      Deposits into CloutCast are automatically credited to your CloutCast account once your DESO public key sends DESO to the above address.
    </h6>
    <h6 class="text-muted superBold text-center">
      After clicking refresh, please wait 5-15 minutes. <br />
      Funds take on average 15 minutes to arrive, sometimes more.<br />
      Rest assured your funds are tracked, recorded on chain immediately, and in our system once we receive a response from Bitclout's API.
    </h6>
    <hr />
    <Row>
      <Col>
        <Button block color="primary" on:click={doWallet}>
          Refresh
        </Button>
      </Col>
      <Col>
        Available Balance<br />
        {nanosToBitClout(wallet.data.settled)} $DESO<br />
        (~${(Math.round(100*(wallet.data.settled * wallet.xRate.nanosInUSDRounded))/100).toFixed(2)} USD)
      </Col>
    </Row>
  </Container>
</Jumbotron>
{:catch ex}
  <Alert color="danger">
    Error: {ex.message || "Unknown Error."}
  </Alert>
{/await}
