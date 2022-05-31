<script>
  import moment from 'moment';
import {
    Jumbotron, Row, Col, Button, Container, Alert, Card, CardHeader, Icon, CardBody, CardFooter, Tooltip
  } from 'sveltestrap/src';

import {
  cloutXRate, userStore
} from "../../../commonStore";
import LoadingBlinker from '../../../components/LoadingBlinker.svelte';
import TransactionRow from '../../../components/TransactionRow.svelte';
import WalletBreadcrumb from '../../../components/WalletBreadcrumb.svelte';
  
  export const nanosToBitClout = function(nanos) {
    return nanos * 0.000000001;
  }
  let theUser = null;
  let xRate = null;

  userStore.subscribe(u => {
    if (u !== null) {
      theUser = u;
    }
  });

  cloutXRate.subscribe(x => {
    if (x !== {}) {
      xRate = x;
    }
  });






  
  export let transactionPromise = async function() {
    let txnGet = await fetch(`/api/user/${theUser.publicKey}/ledger.json`, {
      headers: {
        authorization: `Bearer ${theUser.cc.jwt}`
      }
    });

    let txns = await txnGet.json();

    // console.dir(txns);

    return txns;
  }

  let getTxns = transactionPromise();

  export const getWallet = async function() {
    let walletGet = await fetch(`/api/user/${theUser.publicKey}/wallet.json`, {
      headers: {
        authorization: `Bearer ${theUser.cc.jwt}`
      }
    });

    let wallet = await walletGet.json();
    // console.dir(wallet);

    return {...wallet, xRate, getTransactions: transactionPromise};
    

  }
  export let walletPromise = getWallet();
</script>
{#await walletPromise}
  <LoadingBlinker jumbotron />
{:then wallet} 
<WalletBreadcrumb />
<Jumbotron>
  <Container>
    <!-- <h1 class="text-center">
      Your CloutCast.io Wallet
    </h1>
    <hr /> -->
    <h2>
      
      <Tooltip target="availableBalanceInfo" placement="right">
        Any $DESO here can be withdrawn, or used to create promos.
      </Tooltip>
      Available Balance 
      <Button id="availableBalanceInfo" outline color="secondary">
        <Icon name="info-circle-fill" />
      </Button>
      <br />
      {#if typeof (wallet.data) !== 'undefined'} {#if typeof wallet.data.asOf !== 'undefined'}
      <h5 class="text-muted">As of {moment(wallet.data.asOf).toISOString()}</h5>
      {/if}{/if}
      {nanosToBitClout(wallet.data.settled)} $DESO<br />
      (~${Math.round(100*(wallet.data.settled * wallet.xRate.nanosInUSDRounded))/100} USD)
      <!-- {JSON.stringify(wallet)} -->
    </h2>
    {#if wallet.data.unSettled !== 0}
      <hr />
      <h3>
        <Tooltip target="escrowBalanceInfo" placement="right">
          Any money you make doing promotions will be held in escrow for 48 hours after your engagement time. Assuming your post isn't hidden after 48 hours, $DESO gets taken out of escrow.
        </Tooltip>
        Balance In Escrow
        <Button id="escrowBalanceInfo" outline color="secondary">
          <Icon name="info-circle-fill" />
        </Button>
        <br /> 
        {nanosToBitClout(wallet.data.unSettled)} $DESO<br />
        (~${Math.round(100*(wallet.data.unSettled * wallet.xRate.nanosInUSDRounded))/100} USD)
      </h3>
    {/if}

    <Row>
      <Col>
        <Button size="md" color="success" href="/my/wallet/deposit" outline block>Deposit $DESO into CloutCast</Button> 
      </Col>
      <Col>
        <Button size="md" color="secondary" href="/my/wallet/withdraw" outline block>Withdraw $DESO from CloutCast</Button> 
      </Col>
    </Row>
  </Container>
</Jumbotron>
<Container>
  <h4>
    Transactions
    <Button id="transactionDisclaimerButton" outline color="secondary">
      <Icon name="info-circle-fill" />
    </Button>
    <Tooltip target="transactionDisclaimerButton" placement="right">
      Transaction history may not equate to total balance, we are working on this. <br />
      Rest assured that your current balance is always up to date.
    </Tooltip>
  </h4>
  {#await getTxns}
    <LoadingBlinker />
  {:then txns}
    {#if typeof txns.data !== 'undefined'}
      {#if Array.isArray(txns.data) && txns.data.length} 
        Cleared Transactions
        {#each txns.data as txn}
        {#if txn.isFuture == false}
          <TransactionRow {wallet} {txn} />
        {/if}
        {/each}
        <hr />
        Transactions In Escrow:
        {#each txns.data as txn}
        {#if txn.isFuture == true}
          <TransactionRow {wallet} {txn} />
        {/if}
        {/each}
      {:else}
      <Alert color="light">
        <h4 class="alert-heading text-capitalize">You have no transactions... yet! ;)</h4>
      </Alert>
      {/if}
    {/if}

  {:catch ex}
    <Alert color="danger">
      {ex.message || "Unspecified Error."}
    </Alert>
  {/await}
</Container>
{:catch ex}
  <Alert color="danger">
    Error: {ex.message || "Unknown Error."}
  </Alert>
{/await}
