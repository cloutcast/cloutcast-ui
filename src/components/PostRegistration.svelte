<script>
  import StepWizard from 'svelte-step-wizard';
  import rStatics from './RegistrationStatics';

  import {user} from "../auth/store";
  import authService from '../auth/service';


  import {
    Alert,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Input, InputGroup, InputGroupText
  } from 'sveltestrap';

  import PostRegistrationCard from './PostRegistrationCard.svelte';
  export let initialState; 

  let open = !!initialState || true;

  const toggle = () => (open = !open);

  export let publicKeyInputDisabled;
  export let userPublicKey = '';
  export let userCloutLink = '';
  export let userCloutLinkDisabled; 
  export let theUser;
  export let bitcloutUser = {};
  export let verificationMessage = '';
  export let generateVerifyError = '';
  export let verifyError = '';
  export let waitForGenerate = false;
  export let authClient;

  export let publicKeyError = '';

  user.subscribe(u => {
    if (u) {
      if (u.sub) {
        theUser = u;
      }
    }
  });


  export const allSteps = [
    {
      title: `Welcome to CloutCast!`,
      subtitle: '',
      body: rStatics.introBody,
      footer: "Need Help?"
    },
    {
      title: `Is this your username?`,
      subtitle: '',
      body: "Please verify this is your username, if it isn't go back one and edit your public key.",
      footer: "Need Help?"
    },
    {
      title: `Please post the text IN BOLD on your wall.`,
      subtitle: '',
      body: "Please post the below message into a new Clout on your wall (including the brackets themselves), copy it's link, and paste it below.",
      footer: "Need Help?"
    }
  ];
  
  export const validatePublicKey = async function (nextStep) {
    publicKeyError = '';
    console.log(userPublicKey);
    if (userPublicKey.length !== 55) {
    publicKeyError = "Error: Key is of incorrect length.";
    } else {
      publicKeyInputDisabled = true;
      try  {
        let tURI = '/bitclout/user/' + userPublicKey + '.json';

        let userProfileGet = await fetch(tURI, {
          headers: {
            userSub: theUser.sub
          }
        });
        bitcloutUser = await userProfileGet.json();
        publicKeyInputDisabled = false;
        nextStep();
      } catch (ex) {
        publicKeyInputDisabled = false;
        publicKeyError = ex.message || "Unknown Backend Error. Please try again."
      }
      
    }
  } 

  export const generateVerification = async function(nextStep) {
    try {
      waitForGenerate = true;
      verificationMessage = '';
      generateVerifyError = '';
      let getVerification = await fetch(`/bitclout/user/${userPublicKey}/verify.json`, {
        method: 'post',
        headers: {
          userSub: theUser.sub,
          cloutUsername: bitcloutUser.Username
        }
      });
      let getVerify = await getVerification.json();
      verificationMessage = getVerify.verifyString;
      waitForGenerate = false;
      return nextStep();

    } catch (ex) {
      waitForGenerate = false;
      generateVerifyError = ex.message || "Unknown Backend Error. Please try again."
    }
  }

  export const keyChanged = async function (event) {
    if (userPublicKey.length == 55 && publicKeyError !== '') {
      publicKeyError = '';
    }
  };

  export const doLogOut = async function() {
    alert("You have been verified! Please sign in again to use CloutCast ;)");
    await authService.logout(authClient);
  }

  export const runVerification = async function () {
    // do verification
    try {
    verifyError = '';
    let t = /^https:\/\/bitclout\.com\/posts\/\S{64}/;
      

      userCloutLinkDisabled = true;

      let postHashParts = userCloutLink.split("/");
      let postHash = postHashParts[postHashParts.length - 1].substr(0, 64);

      let testVerify = await fetch(`/bitclout/user/${userPublicKey}/verify.json`, {
        headers: {
          usersub: theUser.sub,
          publicKey: userPublicKey,
          posthash: postHash
        }
      });
      let verifyResult = await testVerify.json();

if (verifyResult.success) {
  await doLogOut();
} else {
  userCloutLinkDisabled = false;
  verifyError = verifyResult.message
}

  } catch (ex) {
    userCloutLinkDisabled = false;
    console.error(ex);
    extraMessage = " If issues persist, please join our discord: https://discord.gg/7mVz7TWKsM";
    verifyError = ex.message + extraMessage|| "Unspecified Error, please try again." + extraMessage;
  }

    

  }

  export let copyAlert = false;

  export const copyVerifyMessage = async function() {
    await navigator.clipboard.writeText(verificationMessage);
    copyAlert = true;

    setTimeout(() => {
      copyAlert = false;
    }, 3000)


  }


</script>

<style>
  .superBold {
    font-weight: 800;
  }
</style>


<div>
  <Button color="info" on:click={toggle}>Complete Registration</Button>
  <Modal isOpen={open} {toggle} size="lg">
    <ModalHeader>
      Verify your bitclout identity
    </ModalHeader>
    <ModalBody>
      <StepWizard initialStep={1}>
          <StepWizard.Step num={1} let:nextStep>
            <PostRegistrationCard title={allSteps[0].title} subtitle={allSteps[0].subtitle} body={allSteps[0].body}>
              <InputGroup>
                <InputGroupText>
                  Public Key
                </InputGroupText>
                <Input placeholder="ABYz1........z1" on:input={keyChanged} bind:value={userPublicKey} disabled={publicKeyInputDisabled} />
              </InputGroup>
              <br />
              {#if publicKeyError}
                <Alert color="danger">
                  {publicKeyError}
                </Alert>
              {/if}
              {#if publicKeyInputDisabled}
                Loading, please wait...
              {:else}
                <Button color="primary" outline on:click={validatePublicKey(nextStep)}>

                  Next
                </Button>
              {/if}
              
            </PostRegistrationCard>
          </StepWizard.Step>
          <StepWizard.Step num={2} let:previousStep let:nextStep>
            <PostRegistrationCard title={allSteps[1].title} subtitle={allSteps[1].subtitle} body={allSteps[1].body}>
              <br />
              <div class="superBold">{JSON.stringify(bitcloutUser.Username)}</div>
              <br /><br />
              {#if generateVerifyError}
                <Alert color="danger">
                  {generateVerifyError}
                </Alert>
              {/if}
              {#if waitForGenerate}
                Loading, please wait...
              {:else}
                <Button color="warning" outline on:click={previousStep}>
                  This is NOT me, go back!
                </Button>
                <Button color="primary" outline on:click={generateVerification(nextStep)}>
                  This is me, next!
                </Button>
              {/if}
            </PostRegistrationCard>
          </StepWizard.Step>
          <StepWizard.Step num={3} let:previousStep let:nextStep>
            <PostRegistrationCard title={allSteps[2].title} subtitle={allSteps[2].subtitle} body={allSteps[2].body}>
              <br />
              <div class="superBold" id="theVerifyMessage">
                {verificationMessage}
              </div>
              <Button size="sm" block color="primary" on:click={copyVerifyMessage}>
                Copy To Clipboard
              </Button>
              <br />
              {#if copyAlert}
                <Alert color="info">
                  Copied to clipboard, now go to Bitclout, and paste into a new clout!
                </Alert>
              {/if}
              <br />
              <InputGroup>
                  <InputGroupText>
                    Clout Link
                  </InputGroupText>
                <Input placeholder="https://bitclout.com/xx/xxxx" bind:value={userCloutLink} disabled={userCloutLinkDisabled} />
              </InputGroup>
              <br />
              {#if verifyError}
                <Alert color="danger">
                  {verifyError}
                </Alert>
              {/if}
              {#if userCloutLinkDisabled}
                Loading, please wait...
              {:else}
              <Button color="warning" outline on:click={previousStep} disabled={userCloutLinkDisabled}>
                Go back, I want to change something! 
              </Button>
                <Button color="primary" outline on:click={runVerification} disabled={userCloutLinkDisabled}>
                  Verify! 
                </Button>
              {/if}
            </PostRegistrationCard>
          </StepWizard.Step>
      </StepWizard>
    </ModalBody>
  </Modal>

</div>

