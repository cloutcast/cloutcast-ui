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
    Input, Alert, ModalHeader, ModalBody, ModalFooter, Dropdown, Offcanvas, Icon
  } from 'sveltestrap';

  // import {isAuthenticated, user, userToken, bitCloutUser} from "../auth/store";
  import { passWindow, toggleInboxMenu, toggleLogin, toggleMobileMenu, toggleTheme } from "../commonStore";
  import LoadingBlinker from './LoadingBlinker.svelte';
  import InboxComponent from './InboxComponent.svelte';
  import { userStore, mobileAuth } from '../commonStore';
  let isOpen = false;

  import {stores, goto} from '@sapper/app';
  const {page} = stores();
  export let authClient;
  export let theUser = null;

  export let fabClick = async function() {
    console.log("fabClick didn't initialize.");
  };

  export let doPromo = async function() {
    fabClick();
  };
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


      console.log(myStuff);
      } catch (ex) {
        console.error(ex);
      }
    }
  });

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  async function postAuth() {
    console.dir(theUser);
  }

  export let preAuthPhrase = "";

  export let preAuthOpen = false;

  export let preAuthLoading = false;
  export let preAuthError = "";



  export const preAuthToggle = () => (preAuthOpen != preAuthOpen);
  export const preAuthCheck = async function() {
    try {
      preAuthError = "";
      preAuthLoading = true;
      let preCheck = await fetch(`/api/preauth/${encodeURIComponent(preAuthPhrase)}.json`);
      let pStatus = preCheck.status;

      if (pStatus == 200) {
        await handleAuth();
      } else {
        throw new Error("Nope");
      }
    } catch (ex) {
      preAuthError = "Invalid Invitation Passphrase. Please try again."
    } finally {
      preAuthLoading = false;
    }
  }
  export const preAuthDo = async function(ev) {
    try {
    ev.preventDefault();
    let preKey = prompt("Please enter your invitation passphrase.").toString();
    let t = await fetch(`/api/preauth/${encodeURIComponent(preKey)}.json`);
    let st = t.status;
    if (st !== 200) {
      alert("Incorrect!");
    } else {
      toggleLogin.set(true);
    }
    } catch (ex) {
      alert("Incorrect!");
    }
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


  export const handleUnauth = async function handleAuth(event) {
    event.preventDefault();
    localStorage.removeItem('btu');
    window.location.href = window.location.origin;
  };

  export const handleAuthDisable = async function() {
    alert("Coming real soon, we promise ;)");
  }


  // handle postRegistration
  export const openSidebar = async function(event) {
    event.preventDefault();
    toggleMobileMenu.set(true);
  }

  export const navTo = async function(thePlace) {
    goto(thePlace);
  }
  let theme = 'light';

  toggleTheme.subscribe(th => {
    if (typeof th == 'string') {
      theme = th;
    }
  });
</script>
<style>
  .navLogo {
    height: 35px;
  }
  .headerMargin {
    margin-left: 125px;
  }
  @media screen and (max-width: 576px) {
    .headerMargin {
      margin: 0 !important;
    }
  }
  .theCTA {
    width: 26px;
    height: 26px;
  }

  .nav-item {
    font-size: 24px;
  }

</style>
<nav class="navbar navbar-expand-sm d-flex d-sm-none w-100 fixed-bottom" class:bg-light={theme == 'light'} class:navbar-light={theme == 'light'} class:bg-dark={theme !== 'light'} class:navbar-dark={theme !== 'light'}>
  
  {#if $userStore == null}
    <Nav tabs justiied class="w-100">
      <a class="nav-link active" aria-current="page" href="/">
        <Icon name="house" />
      </a>
      {#if $mobileAuth == true}
        <NavLink class="sidenavClick" on:click={() => passWindow.set(true)}>
          <Icon name="box-arrow-in-right" />
        </NavLink>
      {:else}
        <NavLink class="sidenavClick" on:click={() => toggleLogin.set(true)}>
          <Icon name="box-arrow-in-right" /> 
        </NavLink>
      {/if}
      <li class="nav-item">
        <NavLink on:click={() => $toggleMobileMenu = true} class="nav-link" title="">
          <Icon name="three-dots" />
        </NavLink>
      </li>
    </Nav>
  {:else}
  <Nav tabs justified class="w-100">
    <li class="nav-item">
      <a href on:click={() => navTo("/")} class="nav-link" class:active={$page.path == '/'} title="">
        <Icon name="house"/>
      </a>
    </li>
    <li class="nav-item">
      <NavLink on:click={() => $toggleInboxMenu = true} class="nav-link" title="">
        <Icon name="mailbox" />
        {#if inboxCount > 0}
        <span class="badge p-1 bg-primary" style="font-size: 0.5rem;">{inboxCount}</span>
        {/if}
      </NavLink>
    </li>
    {#if $page.path == '/my/promotions'}
      <Dropdown class="nav-item" direction='up'>
        <DropdownToggle class="nav-link active">
          <img src="/CTA.png" class="theCTA" alt="create promo icon" />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem on:click={() => doPromo()}>Create Promo</DropdownItem>
          <DropdownItem href="/my/promotions">My Promotions</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    {:else}
    <Dropdown class="nav-item" direction='up' active={$page.path == '/my/promotions'}>
      <DropdownToggle class="nav-link">
        <img src="/CTA.png" class="theCTA" alt="create promo icon" />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem on:click={() => doPromo()}>Create Promo</DropdownItem>
        <DropdownItem href="/my/promotions">My Promotions</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    {/if}
    <!-- <li class="nav-item">
    
    </li> -->
    <li class="nav-item">
      <NavLink on:click={() => navTo("/my/wallet")} class="nav-link" active={$page.path == '/my/wallet'} title="">
        <Icon name="wallet" />
        
      </NavLink>
    </li>
    <li class="nav-item">
      <NavLink on:click={() => $toggleMobileMenu = true} class="nav-link" title="">
        <Icon name="three-dots" />
      </NavLink>
    </li>
  </Nav>

  {/if}
</nav>