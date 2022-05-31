
<script>
  import moment from 'moment';
import {
    Jumbotron, Row, Col, Button, Container, Alert, InputGroup, Input
  } from 'sveltestrap/src';
  import LoadingBlinker from '../../../components/LoadingBlinker.svelte';
  import {
    userStore
  } from "../../../commonStore"
import WalletBreadcrumb from '../../../components/WalletBreadcrumb.svelte';
  
  export const nanosToBitClout = function(nanos) {
    return nanos * 0.000000001;
  }
  export const bitcloutToNanos = function(nanos) {
    return Math.round((nanos / 0.000000001));
  }
  let theUser = null;

  let settled = 0;



  userStore.subscribe((u) => {
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
    settled = wallet.data.settled;
    return {...wallet, xRate, ...theUser};

    
    

  }
  export let walletPromise = getWallet();

  export const doWallet = async function() {
    walletPromise = getWallet();
  }

  export const copyAddress = async function() {
    await navigator.clipboard.writeText("BC1YLiVetFBCYjuHZY5MPwBSY7oTrzpy18kCdUnTjuMrdx9A22xf5DE");
    alert("Copied to clipboard!");
  }

  export let withdrawAmount = 0;


  let withdrawLoading = false;
  let withdrawError = '';

  export let doWithdraw = async function(all = false) {
    withdrawLoading = true;
    withdrawError = '';
    try {
      let wDA = settled;
      if (!all) {
        let amount = document.getElementById("withdrawAmountInput").value;
        let floatVal = parseFloat(amount);
        // console.log(floatVal);
        if (!(floatVal > 0)) {
          throw new Error("Enter a number higher than zero.");
        }
        wDA = bitcloutToNanos(floatVal);
      }

      let doIt = confirm(`Are you sure you want to withdraw ${nanosToBitClout(wDA)} $BitClout from CloutCast?`);
      if (doIt == true) {
        let withdrawEvent = await fetch(`/api/user/${theUser.publicKey}/withdraw/${wDA}.json`, {
          headers: {
            authorization: `Bearer ${theUser.cc.jwt}`
          }
        });

        if (withdrawEvent.status == 200) {
          window.location.href = `${window.location.origin}/my/wallet`;
        } else {
          let tB = await withdrawEvent.text();
          throw new Error(tB);
        } 
      }
    } catch (ex) {
      console.error(ex);
      withdrawError = ex.message  || "Unknown Error. Please try again."
    } finally {
      withdrawLoading = false;
    }

  }

  let withdrawWarningVisible = false;
  export const doWithdrawAll = async function(wallet) {
    withdrawAmount = nanosToBitClout(wallet.data.settled);
    withdrawWarningVisible = true;

    setTimeout(() => {
      withdrawWarningVisible = false;
    }, 5000);
  }


</script>
{#await walletPromise}
  <LoadingBlinker jumbotron />
{:then wallet} 
<WalletBreadcrumb activeName="Withdraw" />
<Jumbotron>
  <Container class="container-fluid">
    <h1 class="text-center">
      Withdraw $DESO from CloutCast.io
    </h1>
    <h6 class="text-center">
      Your $DESO address<br /> <span style="font-size:0.7rem;">{$userStore["publicKey"]}</span>
    </h6>
    <hr />
    <Row>
      <Col>
        Available Balance<br />
        {nanosToBitClout(wallet.data.settled)} $DESO<br />
        (~${(Math.round(100*(wallet.data.settled * wallet.xRate.nanosInUSDRounded))/100).toFixed(2)} USD)
        <hr />
        {#if withdrawLoading == false}
        Amount to withdraw (in $DESO)
        <InputGroup size="sm" class="mb-2">
          <Input bind:value={withdrawAmount} id="withdrawAmountInput" type="number"  />		
          <Button color="info" on:click={() => doWithdraw(false)}>Submit</Button>
        </InputGroup>
        <Alert
          color="info"
          isOpen={withdrawWarningVisible}
          toggle={() => (withdrawWarningVisible = false)}>
          Please click "Submit" above to to continue with your withdrawl.
        </Alert>
        <hr />
        Alternatively, you can 
        <Button color="warning" class="my-2" on:click={() => doWithdrawAll(wallet)}>Withdraw All {nanosToBitClout(wallet.data.settled)} $DESO</Button>
        {:else}
          <LoadingBlinker /> 
        {/if}
        {#if withdrawError !== ''} 
          <Alert color="danger">
            {withdrawError}
          </Alert>
        {/if}
      </Col>
    </Row>
    <hr />
    <h6 class="text-muted text-center">
      Withdrawls out of CloutCast are processed within 24-48 hours. If this amount of time has passed, and you have not been credited the amount requested, please contact @CloutCast, or email admin@cloutcast.io
    </h6>
  </Container>
</Jumbotron>
{:catch ex}
  <Alert color="danger">
    Error: {ex.message || "Unknown Error."}
  </Alert>
{/await}
