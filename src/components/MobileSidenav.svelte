<script>
  import {toggleCreate, toggleMobileMenu} from '../commonStore';
  import { NavItem, Button, Badge, Offcanvas, Row, Col, Icon } from "sveltestrap/src";
import SideNav from './SideNav.svelte';

export const togglePromo = async function () {
  toggleCreate.set(true);
}

export let fabClick = () => {};

</script>
<style>
  .theFlex {
    display: flex;
    width:100%;
  }
</style>

<Offcanvas isOpen={$toggleMobileMenu} placement="start">
  <div class="theFlex">
    <SideNav {fabClick} forMobile={true}/>
  </div>
</Offcanvas>
