<script>
	// export let segment;
	import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Modal,
    InputGroup,
    Button,
    Badge,
    Input, Alert, ModalHeader, ModalBody, ModalFooter, Dropdown, Offcanvas, Icon, Tooltip, Row, Col
  } from 'sveltestrap';

  // import {isAuthenticated, user, userToken, bitCloutUser} from "../auth/store";
  import { cloutXRate, passWindow, toggleInboxMenu, toggleLogin, toggleMobileMenu, toggleTheme } from "../commonStore";
  import LoadingBlinker from './LoadingBlinker.svelte';
  import InboxComponent from './InboxComponent.svelte';
  import { userStore, mobileAuth } from '../commonStore';
  import {stores, goto} from "@sapper/app";
import Fa from 'svelte-fa/src/fa.svelte';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
  const {page} = stores();

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    page.subscribe(({ path, params, query }) => {
      const from = window.location.pathname;
      // const redirect = (href) => { goto(href); }
      console.log([from, path, params, query]);
    });
  }

  let isOpen = false;
  export let forMobile = false;

  export let authClient;
  export let theUser = null;
  let inboxCount = 0;

  userStore.subscribe(async u => {
    if (u !== null) {
      // console.log(u);
      theUser = u;
      try {
      let myResults = await fetch(`/api/promotion/get/my.json`, {
        headers: {
          'Authorization' : `Bearer ${theUser.cc.jwt}`
        }
      });

      let myStuff = await myResults.json();
      let {count = 0} = myStuff;
      inboxCount = count;


      // console.log(myStuff);
      } catch (ex) {
        console.error(ex);
      }
    }
  });
  export let fabClick = async function() {
    console.log("fabClick didn't initialize.");
  };

  export let doPromo = async function(evt) {
    if (forMobile == true) {
      toggleMobileMenu.set(false);
    }
    fabClick();
  };


  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  async function postAuth() {
    console.dir(theUser);
  }
 

  
  export const handleAuth = async function handleAuth() {
    await authService.loginWithPopup(authClient);
    // handle postAuth
    await postAuth();
  };

  export const handleBitCloutAuth = async function(event) {
    if (event) {
      event.preventDefault();
    }
    
    toggleLogin.set(true);

  }


  export const handleUnauth = async function() {
    localStorage.removeItem('btu');
    window.location.href = window.location.origin;
  };

  export const handleAuthDisable = async function() {
    alert("Coming real soon, we promise ;)");
  }


  // handle postRegistration
 

  export const navTo = async function(theRoute) {
    goto(theRoute);
    if (forMobile == true) {
      toggleMobileMenu.set(false);
    }
  }

  export const doInbox = async function() {
    toggleInboxMenu.set(true);
    if (forMobile == true) {
      toggleMobileMenu.set(false);
    }
  }
  let theme = "light";
  let themeIcon = "sun";

  export const doTheme = async function() {
    toggleTheme.set(true);
  }

  toggleTheme.subscribe(th => {
    if (typeof th == 'string') {
      theme = th;
      if (theme == 'light') {
        themeIcon = 'sun';
      } else if (theme == 'dark') {
        themeIcon = 'moon';
      } else {
        themeIcon = 'sunglasses';
      }
    }
  });

  onMount(() => {
    theme = localStorage.getItem("theme") || 'light';
    if (theme == 'light') {
      themeIcon = 'sun';
    } else if (theme == 'dark') {
      themeIcon = 'moon';
    } else {
      themeIcon = 'sunglasses';
    }
  });
</script>
<style>
  .logoClass {
    height: 40px;
  }

  .theSidebar {
    width: 150px;
    height: 100%;
  }
  .mobileSidebar {
    width: 100%;
    height: 100%;
  }

  .lightText {
    color: #fff;  
  }
  @media screen and (max-height: 500px) {
    .oauto {
      overflow-y: scroll;
      max-width: 400px;
    }
  }
  .p-l-0 {
    padding-left: 0 !important;
  }
  
</style>
<div class="d-sm-flex flex-column flex-shrink-0 fixed-top" style="max-width: 400px;" class:bg-dark={theme !== "light"} class:theSidebar={forMobile == false} class:mobileSidebar={forMobile == true} class:d-flex={forMobile == true} class:d-none={forMobile == false}>
  {#if forMobile == true}
  <a href="/" class="d-block p-3 link-dark text-decoration-none" title="">    
    <img src="/logo.png" class="logoClass" alt="Icon"/>
  </a>
  
  {:else}
  <Row>
    <Col>
      <a href="/" class="d-block p-3 link-dark text-decoration-none" title="">
        <img src="/logoSquare.png" class="logoClass" alt="Icon"/>
      </a>
    </Col>
    <Col class="col-auto">
      <button class="btn btn-sm btn-inline btn-outline" class:lightText={theme !== 'light'} on:click={() => doTheme()}>
        <Icon name={themeIcon} />
      </button>
    </Col>
  </Row>
  {/if}
  <span class="oauto flex-grow-1">
  <ul class="nav nav-pills nav-flush flex-column flex-grow-1 mb-auto">
    
    <li class="nav-item">
      <a href on:click={() => navTo("/")} class="nav-link" class:active={$page.path == '/'} title="">
        <Icon name="house" />
        Home
      </a>
    </li>
    {#if $userStore !== null}
    <li class="nav-item">
      <a href class="nav-link sidenavClick" on:click={() => doInbox()} aria-current="page" title="">
        <Icon name="mailbox" />
        Inbox
        {#if inboxCount > 0} 
          <Badge color="primary">
            {inboxCount}
          </Badge>
        {/if}
      </a>
    </li>
    <!-- <li class="nav-item">
      <NavLink on:click={() => doPromo()} class="nav-link sidenavClick" active={$page.path == '/create'} title="">
        <Icon name="plus" />
        Create
      </NavLink>
    </li> -->
    <li class="nav-item">
      <NavLink on:click={() => navTo("/my/wallet")} class="nav-link sidenavClick" active={$page.path == '/my/wallet'} title="">
        <Icon name="wallet2" />
        Wallet
      </NavLink>
    </li>
    <li class="nav-item">
      <NavLink on:click={() => navTo("/my/promotions")} class="nav-link sidenavClick" active={$page.path == '/my/promotions'} title="">
        <Icon name="broadcast" />
        Promos
      </NavLink>
    </li>
    <!-- <li class="nav-item">
      <NavLink on:click={() => navTo("/my/reports")} class="nav-link sidenavClick" active={$page.path == '/my/reports'} title="">
        <Icon name="clipboard-data" />
        Reports
      </NavLink>
    </li> -->
    <li class="nav-item">
      <NavLink on:click={() => handleUnauth()} class="nav-link sidenavClick" title="">
        <Icon name="box-arrow-right" />
        Sign Out
      </NavLink>
    </li>
    {:else} 
      <li class="nav-item">
        {#if $mobileAuth == true}
          <NavLink class="sidenavClick" on:click={() => passWindow.set(true)}>
            <Icon name="box-arrow-in-right" />
            Login
          </NavLink>
        {:else}
          <NavLink class="sidenavClick" on:click={() => toggleLogin.set(true)}>
            <Icon name="box-arrow-in-right" />
            Login 
          </NavLink>
        {/if}
      </li>
    {/if}
    <li class="nav-item">
      <NavLink href="https://www.notion.so/CloutCast-Read-Me-5dd54d062e9543b5a55316dc83627aa6" target="_blank" class="nav-link sidenavClick" title="">
        <Icon name="newspaper" />
        White Paper
      </NavLink>
    </li>
    <li class="nav-item">
      <NavLink href="https://discord.gg/7mVz7TWKsM" target="_blank" class="nav-link sidenavClick" title="">
        <Icon name="discord" />
        Discord
      </NavLink>
    </li>
    <li class="nav-item">
      <NavLink href="https://bitclout.com/u/CloutCast" target="_blank" class="nav-link sidenavClick" title="">
        <img src="/bitclout.svg" height="21" alt="BitClout">
        BitClout
      </NavLink>
    </li>
  </ul>
  </span>
  {#if forMobile == true} 
    <ul class="nav nav-pills nav-flush flex-column flex-grow-0">
      <li class="nav-item">
        <NavLink class="sidenavClick" on:click={() => doTheme()}>
          <Icon name={themeIcon} /> Theme: {theme}
        </NavLink>
      </li>
      <li class="nav-item">
        <NavLink class="sidenavClick" on:click={() => $toggleMobileMenu = false}>
          <Icon name="x" /> Close Menu
        </NavLink>
      </li>
    </ul>
  {/if}
  {#if $userStore !== null}
  <Button class="p-2" block on:click={doPromo} color='info' >Create Promo <img alt="cta icon logo" src="CTA.png" height="25" /></Button>
  <Row class="p-2">
    <Col class="col-auto p-2"><img src="https://bitclout.com/api/v0/get-single-profile-picture/{$userStore.publicKey}" alt="mdo" width="24" height="24" class="rounded-circle"></Col>
    <div class="col col-auto p-2 p-l-0">
      <span class="smallerText text-muted">
        <Row>
          <Col>
            {$userStore.cc.Profile.Username}
          </Col>
        </Row>
        <Row><Col>
          <Icon name="person" />{$userStore.cc.Profile.followerCount} <Fa icon={faCoins} />~{Math.floor(100 * ($userStore.cc.Profile.CoinPriceBitCloutNanos * $cloutXRate.nanosInUSD)) / 100}
        </Col></Row>
      </span>
    </div>
  </Row>
  {/if}
</div>