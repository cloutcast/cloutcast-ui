<script>
import moment from "moment";
import jwt from 'jsonwebtoken';

import { onMount } from "svelte";
import {toggleLogin, bitCloutAuthUser, loginDone, userStore, mobileAuth, passWindow} from "../commonStore";
import { v4 } from "uuid";

let pm_id = '';
let source = null;
let pendingRequests = [];
let identityWindow = null;
let accessLevel = 2;
let user = null;
let useJWT = true;
let isMobile = false;


passWindow.subscribe(w => {
  if (process.browser) {
    if (w == true) {
      identityWindow = window.open('https://identity.bitclout.com/log-in?accessLevelRequest=2', null, 'toolbar=no, width=800, height=1000, top=0, left=0')
    }
  }
});
function respond(e, t, n) {
  if (typeof e !== 'undefined') {
    if (e !== null) {

      e.postMessage({
        id: t,
        service: "identity"
      }, "*");
    }
  }
}
function respondMobile(e, t, n) {
  if (typeof e !== 'undefined') {
    if (e !== null) {
      
      e.postMessage({
        id: t,
        service: "identity", 
        method: "info"
      }, "*");
    }
  }
}
// adopted from https://github.com/BogdanDidenko/react-bitclout-login/blob/main/src/BitcloutLogin.js
function handleLogin(payload) {
    user = payload['users'][payload.publicKeyAdded]
    user['publicKey'] = payload.publicKeyAdded;
    if (identityWindow) {
      if (useJWT === false) {
        identityWindow.close();
        identityWindow = null;
        bitCloutAuthUser.set(user);
      } else {
        var payload = {
          accessLevel: user.accessLevel,
          accessLevelHmac: user.accessLevelHmac,
          encryptedSeedHex: user.encryptedSeedHex
        };
        source.postMessage({
          id: pm_id,
          service: 'identity',
          method: 'jwt',
          payload: payload
        }, "*");
      }
    }
  }
    function handleJWT(payload) {
      user['jwt'] = payload['jwt'];
      if (identityWindow) {
        identityWindow.close();
        identityWindow = null;
      }
      fetch(`/api/auth/${user['publicKey']}.json`, {
        headers: {
          authorization: `Bearer ${payload['jwt']}`
        }
      }).then(d => {
        if (d.status == 200) {
          d.json().then(t => {
            user["cc"] = t;
            localStorage.setItem("btu", JSON.stringify(user));
            userStore.set(user);
            loginDone.set(true);
            if (isMobile) {
              window.location.href = window.location.origin;
            }
          }).finally(() => {
            loginDone.set(true);
          })
        }
      }).catch(e => {
        console.error(e);
        loginDone.set(true);
      });
      // localStorage.setItem('btu', JSON.stringify(user));
      // bitCloutAuthUser.set(user);
      
    }
async function doInit(source) {
  let tu = localStorage.getItem("btu");
  if (tu) {
    try {
      let ju = JSON.parse(tu);
      user = ju;
      let tToken = ju.cc.jwt;

      let tT = jwt.decode(tToken);

      let {exp = 0} = tT;

      // console.log([exp, moment().unix()]);

      if (exp > moment().unix()) {
        // fetch current coin price and follower count
        let profile = await fetch(`/bitclout/user/${ju.publicKey}/get.json`, {
          headers: {
            'xccfollows' : "yes"
          }
        });

        // let tProfile = await profile.json();
        


        ju.cc.Profile = await profile.json();
        userStore.set(ju);
        // console.log(ju);
      } else {
        localStorage.removeItem("btu");
      }
      
    } catch (ex) {
      // localStorage.removeItem("btu");
      console.error(ex);
    } finally {
      loginDone.set(true);
    }
  } else {
    loginDone.set(true);
  }
}
let windowEventListener = async (message) => {
  
  const { data: { id: id, method: method, service: service, payload: payload } } = message;
  
  let {hasStorageAccess = null, browserSupported = null} = payload;
  
  if (service !== "identity") {return;}
  
  // alert(JSON.stringify({id, method, service, payload}));

  if (method == 'initialize') {
    for (let o of pendingRequests) {
      // console.log(o);
      o.source.postMessage(o, "*");
    }

    pendingRequests = [];
    pm_id = message.data.id;
    source = message.source;
    respond(message.source, message.data.id, {});
    if (isMobile == true) {
      respondMobile(message.source, v4(), {});
      await doInit(message.source);
      // await doInit(message.source);
    } else {
      await doInit(message.source);
    }
    
    
  } else if (method == "login") {
    handleLogin(payload);
  } else if (browserSupported == false) {
      alert("This application will not work with this browser!");
      return;
  } else if ( "jwt" in payload) {
    handleJWT(payload);
  }
  
  // console.dir(message);
};

onMount(async () => {
  let OS = getMobileOperatingSystem();

  if (OS == "iOS") {
    isMobile = true;
    // document.getElementById("identity").classList.remove("hideMe");
  }
  window.addEventListener("message", windowEventListener);
  
});

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}


const login = () => {
  if (isMobile == true) {
    identityWindow = window.open('https://identity.bitclout.com/log-in?accessLevelRequest='+ accessLevel, "_blank", 'toolbar=no, width=800, height=1000, top=0, left=0');

  } else {
    identityWindow = window.open('https://identity.bitclout.com/log-in?accessLevelRequest='+ accessLevel, null, 'toolbar=no, width=800, height=1000, top=0, left=0');
  }
}
export const handleEv = async () => {
  login();
};

toggleLogin.subscribe(ev => {
  if (isMobile == true && ev == true) {
    // alert("Thanks for inputting your key! Please click 'Login with BitClout' one more time.");
    mobileAuth.set(true);
    toggleLogin.set(false);
  } else if (ev == true) {
    handleEv();
    mobileAuth.set(true);
    toggleLogin.set(false);
  }
  
  
});


</script>
<svelte:head>
  <style>
    .doHide {
      display: none;
    }
    .doBlock {
      position: absolute: 
      top: 0;
      left: 0;
      width 100%;
      height: 100%
    }
    .doZ {
      z-index: 999;
    }
  </style>
</svelte:head>


<iframe
  title="bitCloutIdentity"
  id="identity"
  class="doHide"
  frameborder="0"
  src="https://identity.bitclout.com/embed"
  style="height: 100vh; width: 100vw;"
  
></iframe>
